from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from datetime import datetime, timedelta
from typing import List
from jose import JWTError, jwt  # type: ignore
import bcrypt  # type: ignore
import os

from database import get_db
from models import AdminUser, Technician, Coupon, Booking, InventoryItem, Complaint, AuditLog, PricingFactor
from schemas import BookingResponse, AdminLogin, Token, TechnicianResponse, CouponResponse, InventoryItemResponse, ComplaintResponse, AuditLogResponse, PricingFactorResponse
from crud import get_bookings, update_booking_status, delete_booking, assign_technician, get_audit_logs, get_inventory_items, update_inventory_stock, create_inventory_item, get_complaints, update_complaint_status, get_pricing_factors, update_pricing_factor

router = APIRouter(prefix="/admin", tags=["admin"])

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=Token)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/bookings", response_model=List[BookingResponse])
def read_bookings(
    skip: int = 0, 
    limit: int = 100, 
    status: str = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return get_bookings(db, skip=skip, limit=limit, status=status)

@router.put("/bookings/{booking_id}/status", response_model=BookingResponse)
def update_status(
    booking_id: int, 
    status: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    booking = update_booking_status(db, booking_id, status)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.put("/bookings/{booking_id}/assign", response_model=BookingResponse)
def update_technician_assignment(
    booking_id: int, 
    technician_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    booking = assign_technician(db, booking_id, technician_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.delete("/bookings/{booking_id}")
def remove_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    booking = delete_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

# Technician Management Routes
@router.get("/technicians")
def list_technicians(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return db.query(Technician).all()

@router.post("/technicians")
def create_technician(
    name: str,
    phone: str,
    rating: float = 4.9,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    tech = Technician(name=name, phone=phone, rating=rating)
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech

# Coupon Management Routes
@router.get("/coupons")
def list_coupons(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return db.query(Coupon).all()

@router.post("/coupons")
def create_coupon(
    code: str,
    discount_percent: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    existing = db.query(Coupon).filter(Coupon.code == code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon = Coupon(code=code.upper(), discount_percent=discount_percent)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

# Audit Logs
@router.get("/audit-logs", response_model=List[AuditLogResponse])
def read_audit_logs(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return get_audit_logs(db)

# Inventory Management
@router.get("/inventory", response_model=List[InventoryItemResponse])
def read_inventory(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return get_inventory_items(db)

@router.put("/inventory/{item_id}")
def update_stock(
    item_id: int,
    stock_level: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    item = update_inventory_stock(db, item_id, stock_level)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("/inventory", response_model=InventoryItemResponse)
def create_item(
    name: str,
    stock_level: int,
    unit_price: int,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return create_inventory_item(db, name, stock_level, unit_price, description)

# Complaints Management
@router.get("/complaints", response_model=List[ComplaintResponse])
def read_complaints(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return get_complaints(db)

@router.put("/complaints/{complaint_id}/status")
def update_complaint(
    complaint_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    comp = update_complaint_status(db, complaint_id, status)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp

# Dynamic Pricing Configuration
@router.get("/pricing-factors", response_model=List[PricingFactorResponse])
def read_pricing_factors(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return get_pricing_factors(db)

@router.put("/pricing-factors/{factor_id}")
def update_pricing(
    factor_id: int,
    multiplier: float,
    flat_fee: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    factor = update_pricing_factor(db, factor_id, multiplier, flat_fee, is_active)
    if not factor:
        raise HTTPException(status_code=404, detail="Pricing factor not found")
    return factor

# Technician Management PUT/DELETE
@router.put("/technicians/{tech_id}")
def edit_technician(
    tech_id: int,
    name: str,
    phone: str,
    rating: float,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    from crud import update_technician
    tech = update_technician(db, tech_id, name, phone, rating, status)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    return tech

@router.delete("/technicians/{tech_id}")
def remove_technician(
    tech_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    from crud import delete_technician
    tech = delete_technician(db, tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    return {"message": "Technician deleted successfully"}

# Booking Edit PUT
@router.put("/bookings/{booking_id}")
def edit_booking_details(
    booking_id: int,
    name: str,
    phone: str,
    service: str,
    address: str,
    price: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    from crud import update_booking_details
    booking = update_booking_details(db, booking_id, name, phone, service, address, price, status)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
