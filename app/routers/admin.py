from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import SessionLocal
from app.db import models
from app.db.models import Canteen

from app.schemas.menu import CanteenCreate, MenuItemCreate
from app.schemas.admin import UpdateRoleSchema
from app.schemas.college import CollegeUpdate

from app.services.menu_service import create_canteen, create_menu_item
from app.services.admin_service import update_user_role, set_external_email
from app.services.college_service import update_college_settings

from app.utils.helpers import require_roles

router = APIRouter(prefix="/admin", tags=["Admin"])


# ================= DATABASE =================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= DASHBOARD DATA =================

@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin", "superadmin"]))
):
    return db.query(models.Order).options(
        joinedload(models.Order.items)
    ).all()


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin", "superadmin"]))
):
    return db.query(models.User).all()


@router.get("/canteens")
def get_all_canteens(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin", "superadmin"]))
):
    return db.query(Canteen).all()


# ================= ADMIN ACTIONS =================

# Admin + Superadmin can add canteens
@router.post("/canteens")
def add_canteen(
    data: CanteenCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin", "superadmin"]))
):
    return create_canteen(db, data.name)


# Admin + Superadmin can add menu
@router.post("/menu")
def add_menu_item(
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin", "superadmin"]))
):
    return create_menu_item(
        db,
        data.name,
        data.price,
        data.canteen_id
    )


# ================= SUPERADMIN ACTIONS =================

# Only superadmin can change roles
@router.post("/users/role")
def change_user_role(
    data: UpdateRoleSchema,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    updated_user = update_user_role(db, data.email, data.role,external_email_allowed=data.external_email_allowed)

    if not updated_user:
        return {"error": "User not found"}

    return {
        "email": updated_user.email,
        "new_role": updated_user.role,
        "external_email_allowed": updated_user.external_email_allowed
    }


# Only superadmin can update college settings
@router.patch("/colleges/{college_id}")
def update_college(
    college_id: int,
    data: CollegeUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    college = update_college_settings(
        db,
        college_id,
        data.allowed_domains,
        data.allow_external_emails
    )

    if not college:
        return {"error": "College not found"}

    return {
        "id": college.id,
        "allowed_domains": college.allowed_domains,
        "allow_external_emails": college.allow_external_emails
    }


# Only superadmin can approve external email
@router.patch("/users/external-email")
def allow_external_email(
    email: str,
    allowed: bool,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    updated_user = set_external_email(db, email, allowed)

    if not updated_user:
        return {"error": "User not found"}

    return {
        "email": updated_user.email,
        "external_email_allowed": updated_user.external_email_allowed
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    target = db.query(models.User).filter(models.User.id == user_id).first()

    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(target)
    db.commit()

    return {"message": "User deleted"}