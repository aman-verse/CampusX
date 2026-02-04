from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests
from sqlalchemy.orm import Session

from app.db.models import User, College
from app.core.security import create_access_token
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def google_login(db: Session, id_token_str: str, college_id: int):
    # Verify token with Google
    try:
        payload = google_id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception:
        return None, "Invalid Google token"

    email = payload.get("email")
    email_verified = payload.get("email_verified")

    if not email or not email_verified:
        return None, "Email not verified by Google"

    # College rules
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        return None, "College not found"

    domain = email.split("@")[-1]
    allowed_domains = [d.strip() for d in college.allowed_domains.split(",")]

    if domain not in allowed_domains and not college.allow_external_emails:
        return None, "Email domain not allowed for this college"

    # Create or login user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=payload.get("name", "User"),
            email=email,
            role="student"  # default
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Issue JWT
    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "id": user.id   # 🔥 IMPORTANT
    })

    return token, None
