from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    external_email_allowed: bool
    phone: Optional[str] = None

    class Config:
        orm_mode = True

class UpdateProfile(BaseModel):
    phone: Optional[str] = None