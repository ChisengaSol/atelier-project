from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
import shutil
import uuid
from database import get_db_connection
from auth import get_current_user

router = APIRouter(prefix="/api", tags=["Products & Categories"])

@router.get("/categories")
def get_categories(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM categories ORDER BY name ASC;")
        categories = [{"id": str(row[0]), "name": row[1]} for row in cursor.fetchall()]
        return {"status": "success", "data": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.get("/products")
def get_products(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                p.id, p.title, p.base_price as price, p.status,
                pv.sku, pv.stock_quantity as stock, pi.image_url,
                c.id as category_id, c.name as category_name
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
            LEFT JOIN product_categories pc ON pc.product_id = p.id
            LEFT JOIN categories c ON c.id = pc.category_id
            ORDER BY p.created_at DESC;
        """
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        products_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        formatted_products = []
        for p in products_data:
            formatted_products.append({
                "id": str(p["id"]),
                "title": p["title"],
                "sku": p["sku"] or "N/A",
                "category_id": str(p["category_id"]) if p["category_id"] else "",
                "category": p["category_name"] or "Uncategorized", 
                "price": float(p["price"]) if p["price"] else 0.00,
                "stock": p["stock"] or 0,
                "sales": 0, 
                "revenue": 0.00, 
                "status": p["status"],
                "tag": "", 
                "image_url": p["image_url"] or ""
            })

        return {"status": "success", "data": formatted_products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/products")
async def create_product(
    title: str = Form(...), sku: str = Form(...), price: float = Form(...),
    stock: int = Form(...), category_id: str = Form(...), image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    image_url = None
    if image and image.filename:
        file_extension = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{file_name}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"http://localhost:8000/{file_path}"

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("INSERT INTO products (title, base_price, status) VALUES (%s, %s, 'Active') RETURNING id;", (title, price))
        product_id = cursor.fetchone()[0]

        cursor.execute("INSERT INTO product_variants (product_id, sku, stock_quantity) VALUES (%s, %s, %s);", (product_id, sku, stock))

        if category_id:
            cursor.execute("INSERT INTO product_categories (product_id, category_id) VALUES (%s, %s);", (product_id, category_id))

        if image_url:
            cursor.execute("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (%s, %s, TRUE);", (product_id, image_url))

        conn.commit()
        return {"status": "success", "message": "Product added successfully."}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.put("/products/{product_id}")
async def update_product(
    product_id: str, title: str = Form(...), sku: str = Form(...), price: float = Form(...),
    stock: int = Form(...), category_id: str = Form(...), image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    image_url = None
    if image and image.filename:
        file_extension = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{file_name}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"http://localhost:8000/{file_path}"

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE products SET title = %s, base_price = %s WHERE id = %s RETURNING id;", (title, price, product_id))
        if not cursor.fetchone(): raise HTTPException(status_code=404, detail="Product not found")

        cursor.execute("UPDATE product_variants SET sku = %s, stock_quantity = %s WHERE product_id = %s;", (sku, stock, product_id))

        cursor.execute("DELETE FROM product_categories WHERE product_id = %s;", (product_id,))
        if category_id:
            cursor.execute("INSERT INTO product_categories (product_id, category_id) VALUES (%s, %s);", (product_id, category_id))

        if image_url:
            cursor.execute("UPDATE product_images SET is_primary = FALSE WHERE product_id = %s;", (product_id,))
            cursor.execute("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (%s, %s, TRUE);", (product_id, image_url))

        conn.commit()
        return {"status": "success", "message": "Product updated successfully."}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/products/{product_id}/archive")
def archive_product(product_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE products SET status = 'Archived' WHERE id = %s RETURNING id;", (product_id,))
        if not cursor.fetchone(): raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"status": "success", "message": "Product archived"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.patch("/products/{product_id}/unarchive")
def unarchive_product(product_id: str, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE products SET status = 'Active' WHERE id = %s RETURNING id;", (product_id,))
        if not cursor.fetchone(): raise HTTPException(status_code=404, detail="Product not found")
        conn.commit()
        return {"status": "success", "message": "Product unarchived"}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()