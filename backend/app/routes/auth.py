from typing import Any
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from app.schemas.device import DeviceCreate
from app.services import auth as auth_service
from app.routes.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    return auth_service.register_user(db=db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin, 
    device_in: DeviceCreate,
    db: Session = Depends(get_db)
) -> Any:
    return auth_service.authenticate_and_create_token(db=db, user_in=user_in, device_in=device_in)

@router.post("/logout")
def logout(
    refresh_token: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    auth_service.logout_device(db=db, user_id=current_user.id, refresh_token=refresh_token)
    return {"msg": "Logged out successfully"}

@router.post("/logout/all")
def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    auth_service.globout_logout(db=db, user=current_user)
    return {"msg": "Logged out from all devices successfully"}

@router.delete("/me")
def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    db.delete(current_user)
    db.commit()
    return {"msg": "User deleted successfully"}
