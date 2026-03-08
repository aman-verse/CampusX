from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import models
from app.db.database import SessionLocal
from app.db.models import Canteen
from app.schemas.menu import CanteenOut
from app.utils.helpers import require_roles

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

@router.get("/vendor")
def get_vendor_canteen(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):

    canteen = db.query(models.Canteen).filter(
        models.Canteen.vendor_email == user["sub"]
    ).first()

    return canteen