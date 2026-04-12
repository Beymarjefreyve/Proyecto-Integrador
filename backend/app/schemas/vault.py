from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class VaultBase(BaseModel):
    encrypted_vault: str  # Base64 encoded bytea or hex string depending on frontend format. Let's use string for REST.
    salt: str
    iterations: int

class VaultCreate(VaultBase):
    pass

class VaultUpdate(BaseModel):
    encrypted_vault: str
    version: int

class VaultResponse(VaultBase):
    id: UUID
    user_id: UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
