from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.order import OrderCreate, OrderOut
from app.services.order_service import create_order, accept_order, deliver_order
from app.utils.helpers import require_roles
from app.db.database import SessionLocal
from app.db import models

router = APIRouter(prefix="/orders", tags=["Orders"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= STUDENT =================

@router.post("/")
def place_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["student"]))
):
    return create_order(
        db=db,
        user_id=user["id"],          # 🔥 FROM JWT
        canteen_id=data.canteen_id,
        items=data.items
    )

@router.get("/my", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["student"]))
):
    return (
        db.query(models.Order)
        .filter(models.Order.user_id == user["id"])
        .all()
    )

    # ================= VENDOR =================

@router.get("/vendor", response_model=list[OrderOut])
def vendor_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    canteen = db.query(models.Canteen).filter(
        models.Canteen.vendor_email == user["sub"]
    ).first()

    if not canteen:
        return []

    return db.query(models.Order).filter(
        models.Order.canteen_id == canteen.id,
        models.Order.status == "placed"
    ).all()

@router.patch("/vendor/{order_id}/accept")
def vendor_accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    order = accept_order(db, order_id)
    return {"status": order.status}

# ================= DELIVERY =================

@router.patch("/delivery/{order_id}/deliver")
def delivery_deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["delivery"]))
):
    order = deliver_order(db, order_id)
    return {"status": order.status}
