from fastapi import APIRouter, Depends
from app.utils.helpers import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user.get("sub"),
        "role": current_user.get("role")
    }
