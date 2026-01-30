from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import hashlib

# ---------------- CONFIG ----------------
SECRET_KEY = "CHANGE_THIS_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# argon2 instead of bcrypt
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)


# ---------------- PASSWORD ----------------
def hash_password(password: str) -> str:
    # optional pre-hash (extra safety)
    pre = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre)


def verify_password(password: str, hashed: str) -> bool:
    pre = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.verify(pre, hashed)


# ---------------- JWT ----------------
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
