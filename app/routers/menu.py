from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import models
from app.utils.helpers import require_roles
from app.db.database import SessionLocal
from app.db.models import MenuItem
from app.schemas.menu import MenuItemOut,MenuItemCreate
from app.services.menu_service import create_menu_item
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

@router.delete("/{menu_id}")
def delete_menu_item(
    menu_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):

    item = db.query(models.MenuItem).get(menu_id)

    if not item:
        return {"error": "Item not found"}

    db.delete(item)
    db.commit()

    return {"message": "Menu item deleted"}

@router.post("/")
def add_menu_item(
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):

    item = create_menu_item(
        db,
        name=data.name,
        price=data.price,
        canteen_id=data.canteen_id
    )

    return item