from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.schemas.college import CollegeOut
from app.services.college_service import list_colleges

router = APIRouter(prefix="/colleges", tags=["Colleges"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[CollegeOut])
def get_colleges(db: Session = Depends(get_db)):
    return list_colleges(db)
