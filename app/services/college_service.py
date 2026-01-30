from sqlalchemy.orm import Session
from app.db.models import College


def list_colleges(db: Session):
    return db.query(College).all()


def update_college_settings(
    db: Session,
    college_id: int,
    allowed_domains: str,
    allow_external_emails: bool
):
    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        return None

    college.allowed_domains = allowed_domains
    college.allow_external_emails = allow_external_emails
    db.commit()
    db.refresh(college)
    return college
