from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import create_order,get_orders_by_user_email,get_placed_orders, accept_order,get_accepted_orders, deliver_order
from app.utils.helpers import require_roles, get_current_user
from app.db.database import SessionLocal
from app.schemas.order import OrderOut
from app.utils.helpers import require_roles, get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=OrderResponse)
def place_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["student"]))
):
    order = create_order(
    db,
    user_email=user["sub"],  # ✅ email
    items=data.items
)
    return {
        "order_id": order.id,
        "status": order.status
    }

@router.get("/my", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["student"]))
):
    orders = get_orders_by_user_email(db, user["sub"])

    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "status": order.status,
            "items": [
                {
                    "menu_item_id": item.menu_item_id,
                    "quantity": item.quantity
                }
                for item in order.items
            ]
        })

    return result

# VENDOR → view placed orders
@router.get("/vendor", response_model=list[OrderOut])
def vendor_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    orders = get_placed_orders(db)

    return [
        {
            "id": order.id,
            "status": order.status,
            "items": [
                {
                    "menu_item_id": item.menu_item_id,
                    "quantity": item.quantity
                }
                for item in order.items
            ]
        }
        for order in orders
    ]

# VENDOR → accept order
@router.patch("/vendor/{order_id}/accept")
def vendor_accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    order = accept_order(db, order_id)
    if not order:
        return {"error": "Order not found"}

    return {
        "message": f"Order {order_id} accepted",
        "status": order.status
    }

# DELIVERY → view accepted orders
@router.get("/delivery", response_model=list[OrderOut])
def delivery_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["delivery"]))
):
    orders = get_accepted_orders(db)

    return [
        {
            "id": order.id,
            "status": order.status,
            "items": [
                {
                    "menu_item_id": item.menu_item_id,
                    "quantity": item.quantity
                }
                for item in order.items
            ]
        }
        for order in orders
    ]

# DELIVERY → mark delivered
@router.patch("/delivery/{order_id}/deliver")
def delivery_deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["delivery"]))
):
    order = deliver_order(db, order_id)
    if not order:
        return {"error": "Order not found"}

    return {
        "message": f"Order {order_id} delivered",
        "status": order.status
    }
