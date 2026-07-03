from fastapi import APIRouter, HTTPException, Depends, Response
import uuid
import datetime
from database import get_db_connection
from schemas import UserCreate, UserLogin, UserUpdate, PaymentMethodCreate, CartItemCreate, CartItemUpdate, AddressCreate, OrderStatusUpdate,CouponCreate, CouponStatusUpdate, AdminCreate, AdminStatusUpdate
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api", tags=["Users, Auth & Payments"])

# cart and checkout routes

@router.post("/users/me/checkout")
def place_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        #Generate Order Number
        order_number = f"ATL-{uuid.uuid4().hex[:8].upper()}"
        
        # Insert Order
        cursor.execute("""
            INSERT INTO orders (order_number, user_id, subtotal, tax, shipping_cost, total_amount, status)
            VALUES (%s, %s, %s, %s, 0, %s, 'Confirmed') RETURNING id;
        """, (order_number, current_user['user_id'], order_data['subtotal'], order_data['tax'], order_data['total']))
        
        order_id = cursor.fetchone()[0]
        
        # Move Cart Items to Order Items
        cursor.execute("""
            INSERT INTO order_items (order_id, variant_id, quantity, unit_price, subtotal)
            SELECT 
                %s, 
                (SELECT id FROM product_variants WHERE product_id = c.product_id LIMIT 1), 
                c.quantity, 
                p.base_price, 
                (c.quantity * p.base_price)
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = %s;
        """, (order_id, current_user['user_id']))
        
        #Clear the Cart
        cursor.execute("DELETE FROM cart_items WHERE user_id = %s;", (current_user['user_id'],))
        
        conn.commit()
        return {"status": "success", "orderNumber": order_number}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/users/me/cart")
def get_cart_items(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                c.id, c.product_id, c.size, c.color, c.quantity,
                p.title, p.base_price,
                cat.name as category_name,
                pi.image_url
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_categories pc ON pc.product_id = p.id
            LEFT JOIN categories cat ON cat.id = pc.category_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
            WHERE c.user_id = %s
            ORDER BY c.created_at DESC;
        """
        cursor.execute(query, (current_user['user_id'],))
        
        cart_items = []
        for row in cursor.fetchall():
            cart_items.append({
                "id": str(row[0]),
                "product_id": str(row[1]),
                "size": row[2],
                "color": row[3],
                "quantity": row[4],
                "title": row[5],
                "price": float(row[6]),
                "category": row[7] or "Uncategorized",
                "image": row[8] or "https://via.placeholder.com/600x800?text=No+Image"
            })
            
        return {"status": "success", "data": cart_items}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/users/me/cart")
def add_to_cart(item: CartItemCreate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO cart_items (user_id, product_id, size, color, quantity)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, product_id, size, color)
            DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
            RETURNING id;
        """
        cursor.execute(query, (
            current_user['user_id'], item.product_id, 
            item.size, item.color, item.quantity
        ))
        
        new_id = cursor.fetchone()[0]
        conn.commit()
        return {"status": "success", "message": "Added to bag", "id": str(new_id)}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/users/me/cart/{item_id}")
def update_cart_quantity(item_id: str, update: CartItemUpdate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE cart_items SET quantity = %s WHERE id = %s AND user_id = %s RETURNING id;",
            (update.quantity, item_id, current_user['user_id'])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cart item not found")
            
        conn.commit()
        return {"status": "success", "message": "Quantity updated"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.delete("/users/me/cart/{item_id}")
def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cart_items WHERE id = %s AND user_id = %s RETURNING id;", (item_id, current_user['user_id']))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cart item not found")
            
        conn.commit()
        return {"status": "success", "message": "Removed from bag"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# user, auth, accounts routes

@router.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    requester_role = current_user.get("role")
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if requester_role == 'superadmin':
            cursor.execute("SELECT id, first_name, last_name, email, status, role FROM users LIMIT 50;")
        else:
            cursor.execute("SELECT id, first_name, last_name, email, status, role FROM users WHERE role != 'superadmin' LIMIT 50;")
            
        users_data = cursor.fetchall()
        
        formatted_users = [{
            "id": str(user[0]), "first_name": user[1], "last_name": user[2],
            "email": user[3], "status": user[4], "role": user[5]
        } for user in users_data]

        return {"status": "success", "data": formatted_users}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/auth/me")
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = %s;", (current_user['user_id'],))
        user = cursor.fetchone()
        
        if not user: raise HTTPException(status_code=404, detail="User not found")
        
        user_data = {
            "id": str(user[0]), "first_name": user[1], "last_name": user[2],
            "email": user[3], "role": user[4], "created_at": user[5].strftime("%B %Y") if user[5] else "Recently"
        }
        return {"status": "success", "user": user_data}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.put("/users/me")
def update_current_user(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if update_data.new_password:
            if not update_data.current_password: raise HTTPException(status_code=400, detail="Current password is required.")
            cursor.execute("SELECT password_hash FROM users WHERE id = %s;", (current_user['user_id'],))
            db_pw_hash = cursor.fetchone()[0]
            if not verify_password(update_data.current_password, db_pw_hash): raise HTTPException(status_code=401, detail="Incorrect password.")
            if len(update_data.new_password) < 8: raise HTTPException(status_code=400, detail="Password too short.")
            new_hashed_pw = get_password_hash(update_data.new_password)
            cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s;", (new_hashed_pw, current_user['user_id']))

        if update_data.first_name:
            cursor.execute("UPDATE users SET first_name = %s WHERE id = %s;", (update_data.first_name, current_user['user_id']))
        if update_data.last_name:
            cursor.execute("UPDATE users SET last_name = %s WHERE id = %s;", (update_data.last_name, current_user['user_id']))
            
        conn.commit()
        return {"status": "success", "message": "Profile updated successfully."}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/auth/signup")
def signup(user: UserCreate):
    if len(user.password) < 8: raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s;", (user.email,))
        if cursor.fetchone(): raise HTTPException(status_code=400, detail="Email already registered")
            
        hashed_pw = get_password_hash(user.password)
        cursor.execute("INSERT INTO users (first_name, last_name, email, password_hash, status, role) VALUES (%s, %s, %s, %s, 'Active', 'customer') RETURNING id, email;", (user.first_name, user.last_name, user.email, hashed_pw))
        conn.commit()
        return {"status": "success", "message": "User registered successfully."}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database registration failure: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/auth/login")
def login(user: UserLogin, response: Response):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, password_hash, status, role FROM users WHERE email = %s;", (user.email,))
        db_user = cursor.fetchone()
        
        if not db_user or not verify_password(user.password, db_user[1]): raise HTTPException(status_code=401, detail="Invalid credentials")
        if db_user[2] != 'Active': raise HTTPException(status_code=403, detail="Account inactive.")

        access_token = create_access_token(data={"sub": user.email, "user_id": str(db_user[0]), "role": db_user[3]})
        response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True, secure=False, samesite="lax", max_age=1800)
        
        return {"status": "success", "message": "Logged in successfully", "role": db_user[3]}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"status": "success", "message": "Logged out successfully"}

#payment method routes

@router.get("/users/me/payments")
def get_payment_methods(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, card_type, last4, expiry, is_default FROM user_payment_methods WHERE user_id = %s ORDER BY created_at ASC;", (current_user['user_id'],))
        
        payments = []
        for row in cursor.fetchall():
            icon = "C"
            if row[1] == "Visa": icon = "V"
            elif row[1] == "Mastercard": icon = "M"
            elif row[1] == "Amex": icon = "A"
            payments.append({"id": str(row[0]), "type": row[1], "last4": row[2], "expires": row[3], "isDefault": row[4], "icon": icon})
            
        return {"status": "success", "data": payments}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/users/me/payments")
def add_payment_method(payment: PaymentMethodCreate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM user_payment_methods WHERE user_id = %s;", (current_user['user_id'],))
        is_default = (cursor.fetchone()[0] == 0)
        
        cursor.execute("INSERT INTO user_payment_methods (user_id, card_type, last4, expiry, is_default) VALUES (%s, %s, %s, %s, %s) RETURNING id;", (current_user['user_id'], payment.type, payment.last4, payment.expires, is_default))
        new_id = cursor.fetchone()[0]
        conn.commit()
        return {"status": "success", "message": "Payment method added", "id": str(new_id)}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.delete("/users/me/payments/{payment_id}")
def delete_payment_method(payment_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_payment_methods WHERE id = %s AND user_id = %s RETURNING id;", (payment_id, current_user['user_id']))
        if not cursor.fetchone(): raise HTTPException(status_code=404, detail="Not found")
        conn.commit()
        return {"status": "success", "message": "Removed"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/users/me/payments/{payment_id}/default")
def set_default_payment_method(payment_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE user_payment_methods SET is_default = FALSE WHERE user_id = %s;", (current_user['user_id'],))
        cursor.execute("UPDATE user_payment_methods SET is_default = TRUE WHERE id = %s AND user_id = %s RETURNING id;", (payment_id, current_user['user_id']))
        if not cursor.fetchone():
            conn.rollback()
            raise HTTPException(status_code=404, detail="Not found")
        conn.commit()
        return {"status": "success", "message": "Default updated"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# address route

@router.get("/users/me/addresses")
def get_addresses(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, address_type, first_name, last_name, address_line_1, 
                   city, state, postal_code, country, is_default 
            FROM user_addresses WHERE user_id = %s ORDER BY is_default DESC, id ASC;
            """, 
            (current_user['user_id'],)
        )
        addresses = []
        for row in cursor.fetchall():
            addresses.append({
                "id": str(row[0]), "type": row[1], "firstName": row[2], "lastName": row[3],
                "street": row[4], "city": row[5], "state": row[6], "zip": row[7], "country": row[8], "isDefault": row[9]
            })
        return {"status": "success", "data": addresses}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/users/me/addresses")
def add_address(address: AddressCreate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM user_addresses WHERE user_id = %s;", (current_user['user_id'],))
        is_default = (cursor.fetchone()[0] == 0)
        cursor.execute(
            """
            INSERT INTO user_addresses (user_id, address_type, first_name, last_name, 
            address_line_1, city, state, postal_code, country, is_default)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
            """,
            (current_user['user_id'], address.type, address.first_name, address.last_name,
            address.street, address.city, address.state, address.zip, address.country, is_default)
        )
        new_id = cursor.fetchone()[0]
        conn.commit()
        return {"status": "success", "message": "Added", "id": str(new_id)}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.delete("/users/me/addresses/{address_id}")
def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_addresses WHERE id = %s AND user_id = %s RETURNING id;", (address_id, current_user['user_id']))
        if not cursor.fetchone(): raise HTTPException(status_code=404, detail="Not found")
        conn.commit()
        return {"status": "success", "message": "Removed"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/users/me/addresses/{address_id}/default")
def set_default_address(address_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE user_addresses SET is_default = FALSE WHERE user_id = %s;", (current_user['user_id'],))
        cursor.execute("UPDATE user_addresses SET is_default = TRUE WHERE id = %s AND user_id = %s RETURNING id;", (address_id, current_user['user_id']))
        if not cursor.fetchone():
            conn.rollback()
            raise HTTPException(status_code=404, detail="Not found")
        conn.commit()
        return {"status": "success", "message": "Default updated"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/users/me/orders")
def get_orders(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all orders for this user
        cursor.execute("""
            SELECT id, order_number, created_at, status, subtotal, tax, shipping_cost, total_amount
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC;
        """, (current_user['user_id'],))
        
        db_orders = cursor.fetchall()
        
        formatted_orders = []
        for order in db_orders:
            order_id = order[0]
            
            # Fetch all items belonging to this specific order
            cursor.execute("""
                SELECT 
                    oi.id, 
                    p.title, 
                    COALESCE(pv.size, 'N/A'), 
                    COALESCE(pv.color, 'Default'), 
                    oi.quantity, 
                    oi.unit_price,
                    pi.image_url
                FROM order_items oi
                JOIN product_variants pv ON oi.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
                WHERE oi.order_id = %s;
            """, (order_id,))
            
            items_data = cursor.fetchall()
            items = []
            for item in items_data:
                items.append({
                    "id": str(item[0]),
                    "title": item[1],
                    "size": item[2],
                    "color": item[3],
                    "qty": item[4],
                    "price": float(item[5]),
                    "image": item[6] or "https://via.placeholder.com/600x800?text=No+Image"
                })

            formatted_orders.append({
                "id": order[1], 
                "db_id": str(order_id),
                "date": order[2].strftime("%Y-%m-%d"),
                "status": order[3],
                "subtotal": float(order[4]),
                "tax": float(order[5]),
                "shipping": float(order[6]),
                "total": float(order[7]),
                "items": items,
                "shippingAddress": "Address on file", 
                "paymentMethod": "Card on file" 
            })

        return {"status": "success", "data": formatted_orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/orders")
def get_all_orders(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT o.id, o.order_number, o.created_at, o.status, o.subtotal, o.tax, o.shipping_cost, o.total_amount,
                   u.first_name, u.last_name, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC;
        """)
        db_orders = cursor.fetchall()
        
        formatted_orders = []
        for order in db_orders:
            order_id = order[0]
            
            cursor.execute("""
                SELECT oi.id, p.title, COALESCE(pv.size, 'N/A'), COALESCE(pv.color, 'Default'), oi.quantity, oi.unit_price, pi.image_url
                FROM order_items oi
                JOIN product_variants pv ON oi.variant_id = pv.id
                JOIN products p ON pv.product_id = p.id
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
                WHERE oi.order_id = %s;
            """, (order_id,))
            
            items_data = cursor.fetchall()
            items = []
            for item in items_data:
                items.append({
                    "id": str(item[0]),
                    "title": item[1],
                    "size": item[2],
                    "color": item[3],
                    "qty": item[4],
                    "price": float(item[5]),
                    "image": item[6] or "https://via.placeholder.com/600x800?text=No+Image"
                })
            
            formatted_orders.append({
                "id": order[1],
                "db_id": str(order_id),
                "tracking": f"ATL{str(order_id)[:8].upper()}", # Generated tracking
                "customer": {
                    "initials": f"{order[8][0]}{order[9][0]}".upper() if order[8] and order[9] else "U",
                    "name": f"{order[8]} {order[9]}",
                    "email": order[10],
                    "phone": "+1 555-0102" # Fallback
                },
                "date": order[2].strftime("%Y-%m-%d"),
                "status": order[3],
                "subtotal": float(order[4]),
                "tax": float(order[5]),
                "shipping": float(order[6]),
                "total": float(order[7]),
                "items": items,
                "payment": "Card on file",
                "shippingAddress": "Address on file"
            })
            
        return {"status": "success", "data": formatted_orders}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/admin/orders/{order_number}/status")
def update_order_status(order_number: str, update: OrderStatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE orders SET status = %s WHERE order_number = %s RETURNING id;", 
            (update.status, order_number)
        )
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Order not found")
            
        conn.commit()
        return {"status": "success", "message": "Status updated successfully"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/customers")
def get_admin_customers(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query users and dynamically aggregate their order totals
        cursor.execute("""
            SELECT 
                u.id, u.first_name, u.last_name, u.email, u.status, u.created_at,
                COUNT(o.id) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as total_spent,
                MAX(o.created_at) as last_order_date
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'Cancelled'
            WHERE u.role != 'superadmin'
            GROUP BY u.id
            ORDER BY u.created_at DESC;
        """)
        db_customers = cursor.fetchall()
        
        customers = []
        for row in db_customers:
            uid = row[0]
            
            # Fetch tags
            cursor.execute("SELECT tag_name FROM user_tags WHERE user_id = %s;", (uid,))
            tags = [t[0] for t in cursor.fetchall()]
            
            # Fetch default address for location
            cursor.execute("SELECT address_line_1, city, state, country FROM user_addresses WHERE user_id = %s AND is_default = TRUE LIMIT 1;", (uid,))
            addr = cursor.fetchone()
            
            if addr:
                location = f"{addr[1]}, {addr[3]}" # City, Country
                full_address = f"{addr[0]}, {addr[1]}, {addr[2]}, {addr[3]}"
            else:
                location = "Unknown"
                full_address = "No address on file"
                
            # Auto-assign tags based on spend/orders if no explicit tags exist
            spent = float(row[7])
            if not tags:
                if spent > 1000: tags.append("VIP")
                if spent > 500: tags.append("High-Value")
                if int(row[6]) > 3: tags.append("Loyal")
                if int(row[6]) == 1: tags.append("New")
                if int(row[6]) > 1: tags.append("Repeat")
                
            # Remove duplicate tags
            tags = list(set(tags))
            
            customers.append({
                "id": str(uid),
                "displayId": f"usr-{str(uid).split('-')[0][:3]}",
                "initials": f"{row[1][0]}{row[2][0]}".upper(),
                "name": f"{row[1]} {row[2]}",
                "email": row[3],
                "phone": "+1 555-0101", # Placeholder since phone is not in base schema
                "location": location,
                "fullAddress": full_address,
                "orders": int(row[6]),
                "spent": spent,
                "lastOrder": row[8].strftime("%Y-%m-%d") if row[8] else "N/A",
                "memberSince": row[5].strftime("%Y-%m-%d") if row[5] else "N/A",
                "tags": tags,
                "status": row[4]
            })
            
        return {"status": "success", "data": customers}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/overview")
def get_admin_overview(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COALESCE(SUM(total_amount), 0), COUNT(id) FROM orders WHERE status != 'Cancelled';")
        totals = cursor.fetchone()
        total_revenue = float(totals[0])
        total_orders = int(totals[1])
        
        cursor.execute("SELECT COUNT(id) FROM users WHERE status = 'Active' AND role != 'superadmin';")
        active_customers = int(cursor.fetchone()[0])
        
        # Recent Orders 
        cursor.execute("""
            SELECT o.order_number, u.first_name, u.last_name, o.status, o.total_amount 
            FROM orders o JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC LIMIT 5;
        """)
        recent_orders = [{
            "id": row[0],
            "initials": f"{row[1][0]}{row[2][0]}".upper(),
            "name": f"{row[1]} {row[2]}",
            "status": row[3],
            "total": float(row[4])
        } for row in cursor.fetchall()]
        
        # Top Products
        cursor.execute("""
            SELECT p.id, p.title, pi.image_url, SUM(oi.quantity), SUM(oi.subtotal) 
            FROM order_items oi 
            JOIN product_variants pv ON oi.variant_id = pv.id 
            JOIN products p ON pv.product_id = p.id 
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE 
            GROUP BY p.id, p.title, pi.image_url 
            ORDER BY SUM(oi.quantity) DESC LIMIT 5;
        """)
        top_products = [{
            "id": str(row[0]),
            "title": row[1],
            "image": row[2] or "https://via.placeholder.com/150",
            "sales": int(row[3]),
            "revenue": float(row[4])
        } for row in cursor.fetchall()]

        # Generate 6-Month Chart Data using Python
        months = []
        today = datetime.date.today()
        # Get the last 6 months
        for i in range(5, -1, -1):
            d = today.replace(day=1) - datetime.timedelta(days=i*30)
            months.append(d.strftime("%b"))
            
        revenue_by_month = {m: 0 for m in months}
        orders_by_month = {m: 0 for m in months}
        
        # Fetch last 180 days of orders
        six_months_ago = today - datetime.timedelta(days=180)
        cursor.execute("SELECT created_at, total_amount FROM orders WHERE status != 'Cancelled' AND created_at >= %s;", (six_months_ago,))
        
        for row in cursor.fetchall():
            order_date = row[0]
            month_name = order_date.strftime("%b")
            if month_name in revenue_by_month:
                revenue_by_month[month_name] += float(row[1])
                orders_by_month[month_name] += 1
                
        chart_data = [{"month": m, "revenue": revenue_by_month[m], "orders": orders_by_month[m]} for m in months]

        return {
            "status": "success", 
            "data": {
                "totalRevenue": total_revenue,
                "totalOrders": total_orders,
                "activeCustomers": active_customers,
                "lowStockItems": 2, # Mocked to 2 for now, requires deeper inventory tracking setup
                "recentOrders": recent_orders,
                "topProducts": top_products,
                "chartData": chart_data
            }
        }
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/analytics")
def get_admin_analytics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        #High-Level Metrics
        cursor.execute("SELECT COALESCE(SUM(total_amount), 0), COUNT(id) FROM orders WHERE status != 'Cancelled';")
        totals = cursor.fetchone()
        gross_revenue = float(totals[0])
        total_orders = int(totals[1])
        
        avg_order_value = gross_revenue / total_orders if total_orders > 0 else 0
        
        cursor.execute("SELECT COUNT(id) FROM orders WHERE status IN ('Refunded', 'Returned');")
        total_returns = int(cursor.fetchone()[0])
        return_rate = (total_returns / total_orders * 100) if total_orders > 0 else 0

        #Monthly Trend Data 
        months = []
        today = datetime.date.today()
        for i in range(5, -1, -1):
            d = today.replace(day=1) - datetime.timedelta(days=i*30)
            months.append(d.strftime("%b"))
            
        revenue_by_month = {m: 0 for m in months}
        orders_by_month = {m: 0 for m in months}
        returns_by_month = {m: 0 for m in months}
        
        six_months_ago = today - datetime.timedelta(days=180)
        cursor.execute("SELECT created_at, total_amount, status FROM orders WHERE created_at >= %s;", (six_months_ago,))
        for row in cursor.fetchall():
            order_date = row[0]
            amount = float(row[1])
            status = row[2]
            month_name = order_date.strftime("%b")
            
            if month_name in revenue_by_month:
                if status != 'Cancelled':
                    revenue_by_month[month_name] += amount
                    orders_by_month[month_name] += 1
                if status in ('Refunded', 'Returned'):
                    returns_by_month[month_name] += 1
                    
        chart_data = [{"month": m, "revenue": revenue_by_month[m], "orders": orders_by_month[m], "returns": returns_by_month[m]} for m in months]

        #Revenue by Country
        cursor.execute("""
            SELECT COALESCE(ua.country, 'Unknown') as country, COUNT(o.id) as orders, COALESCE(SUM(o.total_amount), 0) as revenue
            FROM orders o
            LEFT JOIN user_addresses ua ON o.user_id = ua.user_id AND ua.is_default = TRUE
            WHERE o.status != 'Cancelled'
            GROUP BY COALESCE(ua.country, 'Unknown')
            ORDER BY revenue DESC
            LIMIT 6;
        """)
        country_data = []
        for row in cursor.fetchall():
            country_rev = float(row[2])
            share_pct = (country_rev / gross_revenue * 100) if gross_revenue > 0 else 0
            country_data.append({
                "country": row[0],
                "orders": int(row[1]),
                "revenue": country_rev,
                "share": share_pct
            })

        # Sales by Category
        cursor.execute("""
            SELECT c.name, COALESCE(SUM(oi.subtotal), 0) as category_revenue
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN product_categories pc ON pv.product_id = pc.product_id
            JOIN categories c ON pc.category_id = c.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'Cancelled'
            GROUP BY c.name
            ORDER BY category_revenue DESC
            LIMIT 5;
        """)
        category_data = []
        cat_total_revenue = 0
        cat_rows = cursor.fetchall()
        for row in cat_rows: cat_total_revenue += float(row[1])
        
        for row in cat_rows:
            cat_rev = float(row[1])
            category_data.append({
                "name": row[0],
                "revenue": cat_rev,
                "percentage": (cat_rev / cat_total_revenue * 100) if cat_total_revenue > 0 else 0
            })

        return {
            "status": "success", 
            "data": {
                "grossRevenue": gross_revenue,
                "totalOrders": total_orders,
                "avgOrderValue": avg_order_value,
                "returnRate": return_rate,
                "totalReturns": total_returns,
                "chartData": chart_data,
                "countryData": country_data,
                "categoryData": category_data
            }
        }
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

#discounts routes

@router.get("/admin/discounts")
def get_admin_discounts(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, code, discount_type, discount_value, min_order_value, usage_limit, times_used, expires_at, status FROM coupons ORDER BY created_at DESC;")
        db_coupons = cursor.fetchall()
        
        coupons = []
        active_count = 0
        total_uses = 0
        impact = 0
        
        today = datetime.date.today()
        
        for row in db_coupons:
            cid, code, dtype, dval, min_ord, limit, used, exp, status = row
            
            # Automatically expire coupons if past expiry date
            if status == 'Active' and exp and exp < today:
                status = 'Expired'
                cursor.execute("UPDATE coupons SET status = 'Expired' WHERE id = %s", (cid,))
                conn.commit()
            
            if status == 'Active':
                active_count += 1
            total_uses += used
            
            # Rough estimation of total dollar impact
            if dtype == 'Fixed Amount ($)':
                impact += (used * float(dval))
            else:
                impact += (used * float(dval)) 
                
            # Build the description string
            desc = f"{float(dval):g}% off" if dtype == 'Percentage (%)' else f"${float(dval):g} off"
            if min_ord > 0:
                desc += f" · min ${float(min_ord):g}"
                
            coupons.append({
                "id": cid,
                "code": code,
                "status": status,
                "desc": desc,
                "used": used,
                "limit": limit,
                "expires": exp.strftime("%Y-%m-%d") if exp else ""
            })
            
        return {
            "status": "success", 
            "data": {
                "coupons": coupons,
                "metrics": {
                    "active": active_count,
                    "uses": total_uses,
                    "impact": impact
                }
            }
        }
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/admin/discounts")
def create_discount(coupon: CouponCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, times_used, expires_at, status)
            VALUES (%s, %s, %s, %s, %s, 0, %s, 'Active') RETURNING id;
        """, (coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_value, coupon.usage_limit, coupon.expires_at))
        conn.commit()
        
        return {"status": "success", "message": "Coupon created successfully"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/admin/discounts/{coupon_id}/status")
def update_discount_status(coupon_id: int, update: CouponStatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE coupons SET status = %s WHERE id = %s RETURNING id;", (update.status, coupon_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Coupon not found")
        conn.commit()
        return {"status": "success"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.delete("/admin/discounts/{coupon_id}")
def delete_discount(coupon_id: int, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM coupons WHERE id = %s RETURNING id;", (coupon_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Coupon not found")
        conn.commit()
        return {"status": "success"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/accounts")
def get_admin_accounts(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, first_name, last_name, email, status, department, created_at, last_login, permissions 
            FROM users 
            WHERE role IN ('admin', 'superadmin')
            ORDER BY created_at DESC;
        """)
        
        admins = []
        for row in cursor.fetchall():
            uid, fname, lname, email, status, dept, created, last_login, perms = row
            
            # Parse comma-separated permissions string back into a list
            perm_list = [p.strip() for p in perms.split(',')] if perms else []
            
            admins.append({
                "id": uid,
                "initials": f"{fname[0] if fname else ''}{lname[0] if lname else ''}".upper(),
                "name": f"{fname} {lname}",
                "email": email,
                "status": status,
                "department": dept or "General",
                "created": created.strftime("%Y-%m-%d") if created else "",
                "lastLogin": last_login.strftime("%Y-%m-%d %H:%M") if last_login else "Never",
                "permissions": perm_list
            })
            
        return {"status": "success", "data": admins}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/admin/accounts")
def create_admin_account(admin: AdminCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s;", (admin.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # Mocking a temporary password hash since they will reset it
        temp_hashed_pw = "TEMP_HASH_REPLACE_ME_OR_USE_REAL_HASHER" 
        # In a real app, use: temp_hashed_pw = get_password_hash("TempPass123!")

        cursor.execute("""
            INSERT INTO users (first_name, last_name, email, password_hash, role, status, department, permissions)
            VALUES (%s, %s, %s, %s, 'admin', 'Active', %s, %s) RETURNING id;
        """, (admin.first_name, admin.last_name, admin.email, temp_hashed_pw, admin.department, admin.permissions))
        
        conn.commit()
        return {"status": "success", "message": "Admin created successfully"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/admin/accounts/{admin_id}/status")
def update_admin_status(admin_id: int, update: AdminStatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Prevent superadmin from suspending themselves
    if current_user.get("id") == admin_id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account status")

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET status = %s WHERE id = %s AND role = 'admin' RETURNING id;", (update.status, admin_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Admin account not found")
        conn.commit()
        return {"status": "success"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/admin/audit-logs")
def get_audit_logs(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Joining audit_logs with the admins table 
        cursor.execute("""
            SELECT al.id, al.severity, a.full_name, a.role, al.action_description, al.target_entity, al.created_at, al.ip_address
            FROM audit_logs al
            JOIN admins a ON al.admin_id = a.id
            ORDER BY al.created_at DESC;
        """)
        
        logs = [{
            "id": row[0], 
            "severity": row[1],
            "actorName": row[2], 
            "actorRole": row[3], 
            "action": row[4],   
            "target": row[5],    
            "timestamp": row[6].strftime("%Y-%m-%d %H:%M"),
            "ip": row[7]
        } for row in cursor.fetchall()]
        
        return {"status": "success", "data": logs}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

class AdminSettingsUpdate(BaseModel):
    full_name: str
    email: str
    department: str
    current_password: Optional[str] = None
    new_password: Optional[str] = None
    notifications: dict

@router.get("/admin/settings")
def get_admin_settings(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        admin_id = current_user.get("id")

        cursor.execute("INSERT INTO admin_preferences (admin_id) VALUES (%s) ON CONFLICT (admin_id) DO NOTHING;", (admin_id,))
        conn.commit()

        cursor.execute("""
            SELECT a.first_name, a.last_name, a.email, a.department, a.last_login, a.role,
                   ap.order_updates, ap.registrations, ap.low_stock, ap.performance, ap.security
            FROM admins a
            LEFT JOIN admin_preferences ap ON a.id = ap.admin_id
            WHERE a.id = %s;
        """, (admin_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Admin profile not found")
            
        return {
            "status": "success",
            "profile": {
                # Combine first and last name
                "name": f"{row[0] or ''} {row[1] or ''}".strip(), 
                "email": row[2] or "",                             
                "dept": row[3] or "Operations",                    
                "lastLogin": row[4].strftime("%Y-%m-%d %H:%M") if row[4] else "Never", 
                "role": row[5] or "Admin"                          
            },
            "notifications": {
                "orderUpdates": bool(row[6]) if row[6] is not None else True,
                "registrations": bool(row[7]) if row[7] is not None else True,
                "lowStock": bool(row[8]) if row[8] is not None else True,
                "performance": bool(row[9]) if row[9] is not None else True,
                "security": bool(row[10]) if row[10] is not None else True
            }
        }
    except Exception as e:
        print(f"Error fetching settings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/admin/settings")
def update_admin_settings(settings: AdminSettingsUpdate, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        admin_id = current_user.get("id")

        # Split the full name back into first and last name for the database
        name_parts = settings.full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Update Profile Information
        cursor.execute("""
            UPDATE admins 
            SET first_name = %s, last_name = %s, email = %s, department = %s 
            WHERE id = %s;
        """, (first_name, last_name, settings.email, settings.department, admin_id))

        # Update Notifications
        n = settings.notifications
        cursor.execute("""
            UPDATE admin_preferences 
            SET order_updates = %s, registrations = %s, low_stock = %s, performance = %s, security = %s
            WHERE admin_id = %s;
        """, (n.get("orderUpdates", True), n.get("registrations", True), n.get("lowStock", True), n.get("performance", True), n.get("security", True), admin_id))

        conn.commit()
        return {"status": "success", "message": "Settings updated"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()