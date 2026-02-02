from pydantic import BaseModel
from typing import List


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


class OrderOut(BaseModel):
    id: int
    status: str
    items: list[OrderItemOut]
