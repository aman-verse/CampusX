from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.models import User
from app.db.database import SessionLocal
from app.utils.helpers import get_current_user
from app.schemas.user import UpdateProfile

router = APIRouter(prefix="/users", tags=["Users"])


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------
# GET CURRENT USER
# ---------------------------------------------------

@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "phone": db_user.phone
    }


# ---------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------

@router.patch("/profile")
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    db_user = db.query(User).filter(
        User.email == user["sub"]
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.phone is not None:

        if len(data.phone) != 10 or not data.phone.isdigit():
            raise HTTPException(400, "Invalid phone number")

        db_user.phone = data.phone

    db.commit()
    db.refresh(db_user)

    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "phone": db_user.phone
    }