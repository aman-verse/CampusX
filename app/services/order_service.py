from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem, User


def create_order(db: Session, user_email: str, items):
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        raise ValueError("User not found")

    order = Order(user_id=user.id, status="placed")
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    return order

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
