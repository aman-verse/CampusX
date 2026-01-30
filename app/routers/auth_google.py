from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.schemas.auth import GoogleLoginSchema
from app.services.google_auth import google_login

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/google")
def google_auth(data: GoogleLoginSchema, db: Session = Depends(get_db)):
    token, error = google_login(db, data.id_token, data.college_id)
    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"access_token": token}
