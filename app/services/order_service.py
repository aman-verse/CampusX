from http.client import HTTPException
from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem, User
from app.db import models
from datetime import datetime
from app.db import models
from app.services.whatsapp import build_whatsapp_url
from fastapi import HTTPException
from app.db import models
from app.services.whatsapp import build_whatsapp_url

def create_order(db, user_id: int, canteen_id: int, items: list):
    total = 0
    print("DEBUG: user_id =", user_id)
    print("DEBUG: canteen_id =", canteen_id)
    print("DEBUG: items =", items)

    canteen = db.query(models.Canteen).filter(
        models.Canteen.id == canteen_id
    ).first()

    print("DEBUG: canteen =", canteen)

    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")

    order = models.Order(
        user_id=user_id,
        canteen_id=canteen_id,
        status="placed"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    print("DEBUG: order created, id =", order.id)

    for item in items:
        print("DEBUG: adding item", item.menu_item_id, item.quantity)

        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == item.menu_item_id
        ).first()

        price = menu_item.price * item.quantity
        total += price

        order_item = models.OrderItem(
            order_id=order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity
        )
        db.add(order_item)
    order.total_amount = total
    db.commit()
    db.refresh(order)
    
    whatsapp_url = build_whatsapp_url(
        phone=canteen.vendor_phone,
        order_id=order.id,
        items=items
    )

    print("DEBUG: whatsapp_url =", whatsapp_url)

    return {
        "order_id": order.id,
        "status": order.status,
        "whatsapp_url": whatsapp_url
    }


def get_orders_by_user_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return []

    return (
        db.query(Order)
        .filter(Order.user_id == user.id)
        .all()
    )

def get_placed_orders(db: Session):
    return db.query(Order).filter(Order.status == "placed").all()


def accept_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None

    order.status = "accepted"
    db.commit()
    db.refresh(order)
    return order

def get_accepted_orders(db: Session):
    return db.query(Order).filter(Order.status == "accepted").all()


def deliver_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None

    order.status = "delivered"
    db.commit()
    db.refresh(order)
    return order
