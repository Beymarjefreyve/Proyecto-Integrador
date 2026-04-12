from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DeviceBase(BaseModel):
    device_name: str
    device_type: str

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: UUID
    is_active: bool
    last_used: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
