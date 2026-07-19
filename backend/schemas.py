from pydantic import BaseModel, Field, field_validator  # type: ignore
from datetime import datetime
from typing import Optional, List
import re

class TechnicianResponse(BaseModel):
    id: int
    name: str
    phone: str
    rating: float
    avatar: str
    status: str
    
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    service: str = Field(..., min_length=2, max_length=100)
    address: str = Field(..., min_length=5)
    message: Optional[str] = None

class BookingCreate(BookingBase):
    price: Optional[int] = 499
    coupon_code: Optional[str] = None
    discount_applied: Optional[int] = 0
    payment_status: Optional[str] = "unpaid"
    technician_id: Optional[int] = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean_phone = re.sub(r'[\s\-()]', '', v)
        if not re.match(r'^\+\d{1,4}\d{10}$', clean_phone):
            raise ValueError("Phone number must include a country code starting with '+' followed by exactly 10 digits (e.g., +91 93899 82912).")
        return v

class BookingResponse(BookingBase):
    id: int
    status: str
    price: int
    coupon_code: Optional[str]
    discount_applied: int
    payment_status: str
    technician_id: Optional[int]
    technician: Optional[TechnicianResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CouponResponse(BaseModel):
    id: int
    code: str
    discount_percent: int
    is_active: bool
    
    class Config:
        from_attributes = True

# New schemas for Enterprise suite
class InventoryItemBase(BaseModel):
    name: str
    stock_level: int
    unit_price: int
    description: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: int
    
    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    booking_id: int
    description: str

class ComplaintResponse(BaseModel):
    id: int
    booking_id: int
    description: str
    status: str
    created_at: datetime
    booking: Optional[BookingResponse] = None
    
    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user: str
    role: str
    action: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class PricingFactorResponse(BaseModel):
    id: int
    name: str
    multiplier: float
    flat_fee: int
    is_active: bool
    
    class Config:
        from_attributes = True