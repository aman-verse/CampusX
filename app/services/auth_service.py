from sqlalchemy.orm import Session
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token


COLLEGE_DOMAIN = "@bitmesra.ac.in"  # change later

def register_user(db: Session, name, email, password):
    user = User(
        name=name,
        email=email,
        password=hash_password(password),
        role="student"   # 🔒 fixed
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login_user(db: Session, email, password):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    token = create_access_token({"sub": user.email, "role": user.role})
    return token
