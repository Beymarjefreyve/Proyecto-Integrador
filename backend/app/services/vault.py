from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vault import Vault
from app.models.user import User
from app.schemas.vault import VaultCreate, VaultUpdate

def init_vault(db: Session, user: User, vault_in: VaultCreate) -> Vault:
    existing_vault = db.query(Vault).filter(Vault.user_id == user.id).first()
    if existing_vault:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vault already initialized")
    
    vault = Vault(
        user_id=user.id,
        encrypted_vault=vault_in.encrypted_vault.encode("utf-8"),
        salt=vault_in.salt.encode("utf-8"),
        iterations=vault_in.iterations,
        version=1
    )
    db.add(vault)
    db.commit()
    db.refresh(vault)
    return vault

def get_vault(db: Session, user: User) -> dict:
    vault = db.query(Vault).filter(Vault.user_id == user.id).first()
    if not vault:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
    
    return {
        "id": vault.id,
        "user_id": vault.user_id,
        "encrypted_vault": vault.encrypted_vault.decode("utf-8"),
        "salt": vault.salt.decode("utf-8"),
        "iterations": vault.iterations,
        "version": vault.version,
        "created_at": vault.created_at,
        "updated_at": vault.updated_at
    }

def update_vault(db: Session, user: User, vault_in: VaultUpdate) -> dict:
    vault = db.query(Vault).filter(Vault.user_id == user.id).first()
    if not vault:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
    
    # Simple version check to prevent lost updates
    if vault_in.version <= vault.version:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vault version conflict")
    
    vault.encrypted_vault = vault_in.encrypted_vault.encode("utf-8")
    # Only encrypted vault usually gets updated, salt and iterations are from init
    vault.version = vault_in.version
    
    db.commit()
    db.refresh(vault)
    
    return {
        "id": vault.id,
        "user_id": vault.user_id,
        "encrypted_vault": vault.encrypted_vault.decode("utf-8"),
        "salt": vault.salt.decode("utf-8"),
        "iterations": vault.iterations,
        "version": vault.version,
        "created_at": vault.created_at,
        "updated_at": vault.updated_at
    }
