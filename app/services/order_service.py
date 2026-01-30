from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem, User
from app.db import models

def create_order(db: Session, user_id: int, canteen_id: int, items: list):
    # 1. Validate canteen
    canteen = db.query(models.Canteen).filter(
        models.Canteen.id == canteen_id
    ).first()

    if not canteen:
        raise ValueError("Invalid canteen")

    # 2. Create order
    order = models.Order(
        user_id=user_id,
        canteen_id=canteen_id,
        status="placed"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # 3. Add order items
    for item in items:
        order_item = models.OrderItem(
            order_id=order.id,
            menu_item_id=item["menu_item_id"],
            quantity=item["quantity"]
        )
        db.add(order_item)

    db.commit()

    # 4. RETURN canteen phone (SOURCE OF TRUTH)
    return {
        "order_id": order.id,
        "canteen_phone": canteen.vendor_phone
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

