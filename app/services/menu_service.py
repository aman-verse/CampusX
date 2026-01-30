from sqlalchemy.orm import Session
from app.db.models import Canteen, MenuItem


def create_canteen(db: Session, name: str):
    canteen = Canteen(name=name)
    db.add(canteen)
    db.commit()
    db.refresh(canteen)
    return canteen


def create_menu_item(db: Session, name: str, price: int, canteen_id: int):
    item = MenuItem(
        name=name,
        price=price,
        canteen_id=canteen_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
