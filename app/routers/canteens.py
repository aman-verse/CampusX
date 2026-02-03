from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import Canteen
from app.schemas.menu import CanteenOut

router = APIRouter(prefix="/canteens", tags=["Canteens"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[CanteenOut])
def list_canteens(db: Session = Depends(get_db)):
    return db.query(Canteen).all()


@router.get("/college/{college_id}", response_model=list[CanteenOut])
def get_canteens_by_college(college_id: int,db: Session = Depends(get_db)):
    return db.query(Canteen).filter(Canteen.college_id == college_id).all()