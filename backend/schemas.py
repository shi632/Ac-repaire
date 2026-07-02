from pydantic import BaseModel, Field  # type: ignore
from datetime import datetime
from typing import Optional

class BookingBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    service: str = Field(..., min_length=2, max_length=100)
    address: str = Field(..., min_length=5)
    message: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str