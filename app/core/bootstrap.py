from sqlalchemy.orm import Session
from app.db.models import User
import os

def create_super_admin(db: Session):
    email = os.getenv("SUPER_ADMIN_EMAIL")
    name = os.getenv("SUPER_ADMIN_NAME", "Super Admin")

    if not email:
        return

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        return

    superadmin = User(
        name=name,
        email=email,
        role="superadmin",
        external_email_allowed=True
    )

    db.add(superadmin)
    db.commit()