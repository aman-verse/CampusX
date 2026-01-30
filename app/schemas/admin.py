from pydantic import BaseModel, EmailStr


class UpdateRoleSchema(BaseModel):
    email: EmailStr
    role: str   # admin | vendor | delivery | student
