from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class PaymentMethodCreate(BaseModel):
    type: str
    last4: str
    expires: str

class AddressCreate(BaseModel):
    type: str
    first_name: str
    last_name: str
    street: str
    city: str
    state: str
    zip: str
    country: str

class CartItemCreate(BaseModel):
    product_id: str
    size: str
    color: str
    quantity: int

class CartItemUpdate(BaseModel):
    quantity: int
class OrderStatusUpdate(BaseModel):
    status: str

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    min_order_value: float
    usage_limit: int
    expires_at: str

class CouponStatusUpdate(BaseModel):
    status: str

class AdminCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    department: str
    permissions: str

class AdminStatusUpdate(BaseModel):
    status: str