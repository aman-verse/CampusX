from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import MenuItem
from app.schemas.menu import MenuItemOut

router = APIRouter(prefix="/menu", tags=["Menu"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{canteen_id}", response_model=list[MenuItemOut])
def get_menu(canteen_id: int, db: Session = Depends(get_db)):
    return (
        db.query(MenuItem)
        .filter(MenuItem.canteen_id == canteen_id)
        .all()
    )
