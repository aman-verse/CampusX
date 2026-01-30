from pydantic import BaseModel

class CollegeOut(BaseModel):
    id: int
    name: str

class CollegeUpdate(BaseModel):
    allowed_domains: str
    allow_external_emails: bool
    