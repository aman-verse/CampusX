from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterSchema, LoginSchema, TokenSchema
from app.services.auth_service import register_user, login_user
from app.db.database import SessionLocal

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    user = register_user(db, data.name, data.email, data.password, data.role)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid college email")
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenSchema)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    token = login_user(db, data.email, data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token}
