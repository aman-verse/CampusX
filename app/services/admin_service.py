from sqlalchemy.orm import Session
from app.db.models import User


def update_user_role(db: Session, email: str, role: str, external_email_allowed: bool = False):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    user.role = role
    user.external_email_allowed = external_email_allowed
    db.commit()
    db.refresh(user)
    return user

def set_external_email(db: Session, email: str, allowed: bool):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    user.external_email_allowed = allowed
    db.commit()
    db.refresh(user)

    return user