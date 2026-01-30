from pydantic import BaseModel
from typing import List

class CanteenOut(BaseModel):
    id: int
    name: str

class MenuItemOut(BaseModel):
    id: int
    name: str
    price: int

class CanteenCreate(BaseModel):
    name: str

class MenuItemCreate(BaseModel):
    name: str
    price: int
    canteen_id: int
