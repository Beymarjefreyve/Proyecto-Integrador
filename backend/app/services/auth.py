import uuid
import secrets
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.device import Device
from app.schemas.user import UserCreate, UserLogin
from app.schemas.device import DeviceCreate
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

def register_user(db: Session, user_in: UserCreate) -> User:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_and_create_token(db: Session, user_in: UserLogin, device_in: DeviceCreate) -> Token:
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check how many devices the user has, maybe clean up old ones (optional logic but good practice)
    
    # Create refresh token
    refresh_token = secrets.token_urlsafe(32)
    device = Device(
        user_id=user.id,
        device_name=device_in.device_name,
        device_type=device_in.device_type,
        refresh_token=refresh_token
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    
    # Create Access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "tv": user.token_version}, # tv = token_version for global valid check
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

def logout_device(db: Session, user_id: uuid.UUID, refresh_token: str):
    device = db.query(Device).filter(
        Device.user_id == user_id,
        Device.refresh_token == refresh_token
    ).first()
    if not device:
        raise HTTPException(status_code=400, detail="Device not found or already logged out")
    
    db.delete(device)
    db.commit()

def globout_logout(db: Session, user: User):
    # Invalidate all current tokens by incrementing version
    user.token_version += 1
    # Delete all device refresh tokens
    db.query(Device).filter(Device.user_id == user.id).delete()
    db.commit()
