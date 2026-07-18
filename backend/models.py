from sqlalchemy import Column, Integer, Float, String, Text, DateTime, Boolean, ForeignKey  # type: ignore
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy.sql import func  # type: ignore
from database import Base

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    service = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, confirmed, completed, cancelled, on_the_way, arrived, in_progress
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Columns for payments and tracking
    price = Column(Integer, default=499)
    coupon_code = Column(String(50), nullable=True)
    discount_applied = Column(Integer, default=0)
    payment_status = Column(String(20), default="unpaid") # unpaid, paid, refunded
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)
    
    # Technician completing details
    before_photo = Column(Text, nullable=True)
    after_photo = Column(Text, nullable=True)
    checklist_completed = Column(Boolean, default=False)
    customer_signature = Column(Text, nullable=True)
    repair_notes = Column(Text, nullable=True)
    
    technician = relationship("Technician", back_populates="bookings")
    complaints = relationship("Complaint", back_populates="booking", cascade="all, delete-orphan")

class Technician(Base):
    __tablename__ = "technicians"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    rating = Column(Float, default=4.9)
    avatar = Column(String(255), default="/images/about.png")
    status = Column(String(20), default="available") # available, busy
    
    bookings = relationship("Booking", back_populates="technician")
    attendance_logs = relationship("AttendanceLog", back_populates="technician", cascade="all, delete-orphan")

class Coupon(Base):
    __tablename__ = "coupon_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    stock_level = Column(Integer, default=0)
    unit_price = Column(Integer, default=0)
    description = Column(String(255), nullable=True)

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="open") # open, in_progress, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    booking = relationship("Booking", back_populates="complaints")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(50), nullable=False)
    role = Column(String(20), nullable=False)
    action = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class PricingFactor(Base):
    __tablename__ = "pricing_factors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    multiplier = Column(Float, default=1.0)
    flat_fee = Column(Integer, default=0)
    is_active = Column(Boolean, default=False)

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=False)
    action = Column(String(20), nullable=False) # clock_in, clock_out
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    technician = relationship("Technician", back_populates="attendance_logs")

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)