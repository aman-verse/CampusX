import token
from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem, User
from app.db import models
from datetime import datetime
from app.schemas import order
from app.services.whatsapp import build_whatsapp_url
from fastapi import HTTPException
from datetime import datetime, timedelta

def create_order(
    db,
    user_id: int,
    canteen_id: int,
    phone: str,
    address: str,
    items: list,
    student_note: str | None = None
):
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
    
    last_order = db.query(models.Order)\
    .filter(models.Order.canteen_id == canteen_id)\
    .order_by(models.Order.id.desc())\
    .first()

    token = 1

    if last_order and last_order.token:
        token = last_order.token + 1

    recent_order = db.query(models.Order).filter(
        models.Order.user_id == user_id,
        models.Order.created_at >= datetime.utcnow() - timedelta(seconds=10)
    ).first()

    if recent_order:
        raise HTTPException(
            status_code=400,
            detail="Order already placed. Please wait."
        )

    order = models.Order(
        user_id=user_id,
        canteen_id=canteen_id,
        phone=phone,
        address=address,
        token=token,
        status="placed",
        student_note=student_note
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)

    print("DEBUG: order created, id =", order.id)

    order_items_for_msg = []

    for item in items:
        menu_item_id = item["menu_item_id"]
        quantity = item["quantity"]

        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == menu_item_id
        ).first()

        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {menu_item_id} not found")

        price = menu_item.price * quantity
        total += price

        order_items_for_msg.append({
            "name": menu_item.name,
            "qty": quantity,
            "price": price
        })
        order_item = models.OrderItem(
            order_id=order.id,
            menu_item_id=menu_item_id,
            quantity=quantity
        )
        db.add(order_item)

    order.total_amount = total
    db.commit()
    db.refresh(order)
    
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    whatsapp_url = build_whatsapp_url(
        phone=canteen.vendor_phone,
        order_id=order.id,
        token=order.token,
        student_name=user.name,
        student_phone=phone,
        address=address,
        items=order_items_for_msg,
        total=total
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

