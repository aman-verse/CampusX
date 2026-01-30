from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.menu import CanteenCreate, MenuItemCreate
from app.services.menu_service import create_canteen, create_menu_item
from app.schemas.admin import UpdateRoleSchema
from app.services.admin_service import update_user_role
from app.utils.helpers import require_roles
from app.schemas.college import CollegeUpdate
from app.services.college_service import update_college_settings

router = APIRouter(prefix="/admin", tags=["Admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/canteens")
def add_canteen(
    data: CanteenCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin"]))
):
    return create_canteen(db, data.name)


@router.post("/menu")
def add_menu_item(
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin"]))
):
    return create_menu_item(
        db,
        data.name,
        data.price,
        data.canteen_id
    )

@router.patch("/users/role")
def change_user_role(
    data: UpdateRoleSchema,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin"]))
):
    updated_user = update_user_role(db, data.email, data.role)
    if not updated_user:
        return {"error": "User not found"}

    return {
        "email": updated_user.email,
        "new_role": updated_user.role
    }

@router.patch("/colleges/{college_id}")
def update_college(
    college_id: int,
    data: CollegeUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["admin"]))
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
