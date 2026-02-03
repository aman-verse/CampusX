from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests
from sqlalchemy.orm import Session
from app.db.models import User, College
from app.core.security import create_access_token
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if not GOOGLE_CLIENT_ID:
    raise RuntimeError("GOOGLE_CLIENT_ID not set")


def google_login(db: Session, id_token_str: str, college_id: int):
    # Verify Google ID token
    try:
        payload = google_id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        return None, "Invalid Google token"

    email = payload.get("email")
    email_verified = payload.get("email_verified")

    if not email or not email_verified:
        return None, "Email not verified by Google"

    # College validation
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        return None, "College not found"

    domain = email.split("@")[-1].lower()
    allowed_domains = [
        d.strip().lower()
        for d in college.allowed_domains.split(",")
    ]

    if domain not in allowed_domains and not college.allow_external_emails:
        return None, "Email domain not allowed for this college"

    # Find or create user (Google-safe)
    user = (
        db.query(User)
        .filter(User.google_sub == payload["sub"])
        .first()
    )

    if not user:
        user = User(
            name=payload.get("name", "User"),
            email=email,
            role="student",
            provider="google",
            google_sub=payload["sub"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Issue JWT
    token = create_access_token(
        sub=str(user.id),
        extra={
            "role": user.role,
            "provider": "google"
        }
    )

    return token, None
