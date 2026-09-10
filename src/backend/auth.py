"""
auth.py — minimal JWT auth.

Deliberately simple: seeded plaintext-password users (see db.py), a login
endpoint that issues a JWT, and a dependency that other routes use to check
"is this a learner or an admin." This satisfies the blueprint's RBAC
requirement without the overhead of a full user-registration system we
don't have time for in 3 days.
"""
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

SECRET_KEY = "sih26101-hackathon-demo-secret-change-me"  # fine for a demo; not for production
ALGORITHM = "HS256"
EXPIRE_MINUTES = 480  # 8 hours — long enough that a demo never expires mid-recording

security = HTTPBearer()


def create_token(official_id: int, username: str, role: str) -> str:
    payload = {
        "sub": str(official_id),
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def require_admin(payload: dict = Depends(decode_token)) -> dict:
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return payload
