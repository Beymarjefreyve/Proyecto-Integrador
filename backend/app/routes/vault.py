from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.vault import VaultCreate, VaultUpdate, VaultResponse
from app.services import vault as vault_service
from app.routes.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/init", response_model=VaultResponse)
def init_vault(
    vault_in: VaultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Initialize the zero-knowledge vault for the current user."""
    return vault_service.init_vault(db=db, user=current_user, vault_in=vault_in)

@router.get("", response_model=VaultResponse)
def get_vault(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve the encrypted vault for the current user."""
    return vault_service.get_vault(db=db, user=current_user)

@router.put("", response_model=VaultResponse)
def update_vault(
    vault_in: VaultUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update the encrypted vault content for the current user."""
    return vault_service.update_vault(db=db, user=current_user, vault_in=vault_in)
