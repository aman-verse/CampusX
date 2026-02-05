from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    canteen_id: int          # ✅ ADD THIS
    items: list[OrderItemCreate]

class OrderResponse(BaseModel):
    order_id: int
    status: str

class OrderItemOut(BaseModel):
    menu_item_id: int
    quantity: int
    class Config:
        orm_mode = True

class CanteenOut(BaseModel):
    id: int
    name: str

class OrderOut(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: datetime
    canteen: CanteenOut
    items: List[OrderItemOut]

    class Config:
        orm_mode = True
