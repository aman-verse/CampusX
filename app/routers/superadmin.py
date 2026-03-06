from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.utils.helpers import require_roles
from app.db import models
from app.schemas.college import CollegeCreate
from app.schemas.admin import UpdateRoleSchema
from app.services.admin_service import update_user_role
router = APIRouter(prefix="/superadmin", tags=["Super Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/colleges")
def get_colleges(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    return db.query(models.College).all()


@router.get("/admins")
def get_admins(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    return db.query(models.User).filter(
        models.User.role == "admin"
    ).all()

@router.post("/colleges")
def create_college(data: CollegeCreate, db: Session = Depends(get_db)):
    college = models.College(
        name=data.name,
        allowed_domains=data.allowed_domains,
        allow_external_emails=data.allow_external_emails
    )

    db.add(college)
    db.commit()
    db.refresh(college)

    return college

@router.post("/users/role")
def change_user_role(
    data: UpdateRoleSchema,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["superadmin"]))
):
    updated_user = update_user_role(db, data.email, data.role, data.external_email_allowed)

    if not updated_user:
        return {"error": "User not found"}

    return {
        "email": updated_user.email,
        "new_role": updated_user.role,
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