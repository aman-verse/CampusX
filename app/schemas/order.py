from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    canteen_id: int
    phone: str
    address: str
    items: list[OrderItemCreate]
    student_note: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: int
    status: str

class MenuItemMini(BaseModel):
    id: int
    name: str
    price: int

    class Config:
        orm_mode = True


class OrderItemOut(BaseModel):
    quantity: int
    menu_item: MenuItemMini

    class Config:
        orm_mode = True

class CanteenOut(BaseModel):
    id: int
    name: str

class UserMini(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True
class OrderOut(BaseModel):
    id: int
    token: int
    status: str
    total_amount: float
    created_at: datetime

    phone: str
    address: str
    reject_reason: Optional[str] = None
    student_note: Optional[str] = None
    user: UserMini
    canteen: CanteenOut
    items: List[OrderItemOut]

    class Config:
        orm_mode = True
