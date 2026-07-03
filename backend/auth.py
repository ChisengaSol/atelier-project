import os
from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from dotenv import load_dotenv
from pathlib import Path
from fastapi import Request, HTTPException

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("CRITICAL SECURITY ERROR: JWT_SECRET_KEY is missing from the .env file.")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

#cryptography
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain text password matches the hashed version in the database."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Converts a plain text password into a secure bcrypt hash."""
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    return hashed_bytes.decode('utf-8')

def create_access_token(data: dict) -> str:
    """Generates a secure JSON Web Token (JWT) with an expiration time."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(request: Request):
    """Dependency to extract and verify the JWT from the HttpOnly cookie."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = token.replace("Bearer ", "")
    
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")