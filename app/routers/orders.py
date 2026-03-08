from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session,joinedload
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
        user_id=user["id"],
        canteen_id=data.canteen_id,
        phone=data.phone,
        address=data.address,
        items=[item.dict() for item in data.items]
    )

@router.get("/my", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["student"]))
):
    db_user = db.query(models.User).filter(
        models.User.email == user["sub"]
    ).first()

    if not db_user:
        return []

    return (
        db.query(models.Order)
        .filter(models.Order.user_id == db_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

    # ================= VENDOR =================

# @router.get("/vendor", response_model=list[OrderOut])
# def vendor_orders(
#     db: Session = Depends(get_db),
#     user=Depends(require_roles(["vendor"]))
# ):
#     canteen = db.query(models.Canteen).filter(
#         models.Canteen.vendor_email == user["sub"]
#     ).first()

#     if not canteen:
#         return []

#     return db.query(models.Order).options(joinedload(models.Order.items)).filter(
#         models.Order.canteen_id == canteen.id,
#         models.Order.status != "delivered"
#     ).all()

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

    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.canteen_id == canteen.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

@router.patch("/vendor/{order_id}/accept")
def vendor_accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    order = accept_order(db, order_id)
    return order

@router.patch("/vendor/{order_id}/reject")
def reject_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):
    order = db.query(models.Order).get(order_id)
    order.status = "rejected"
    db.commit()
    return order

@router.get("/vendor/history", response_model=list[OrderOut])
def vendor_order_history(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["vendor"]))
):

    canteen = db.query(models.Canteen).filter(
        models.Canteen.vendor_email == user["email"]
    ).first()

    if not canteen:
        return []

    return db.query(models.Order).filter(
        models.Order.canteen_id == canteen.id,
        models.Order.status == "delivered"
    ).order_by(models.Order.created_at.desc()).all()
# ================= DELIVERY =================

@router.patch("/delivery/{order_id}/deliver")
def delivery_deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["delivery","vendor"]))
):
    order = deliver_order(db, order_id)
    return {"status": order.status}
