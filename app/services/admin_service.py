from sqlalchemy.orm import Session
from app.db.models import User


def update_user_role(db: Session, email: str, role: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    user.role = role
    db.commit()
    db.refresh(user)
    return user
