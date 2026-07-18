from fastapi import FastAPI, Depends, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from contextlib import asynccontextmanager
from typing import Optional, List
from pydantic import BaseModel
import os
from dotenv import load_dotenv #type: ignore

# Load environment variables
load_dotenv()

from database import engine, Base, get_db
from models import Booking, AdminUser, Technician, Coupon, InventoryItem, Complaint, AuditLog, PricingFactor, AttendanceLog
from schemas import BookingCreate, BookingResponse
from crud import create_booking

# Create tables (with automatic schema mismatch recovery)
from sqlalchemy import text # type: ignore
try:
    with engine.connect() as conn:
        # Check if the newer attendance_logs table exists to verify DB matches new model tables
        conn.execute(text("SELECT id FROM attendance_logs LIMIT 1"))
except Exception:
    print("Database schema mismatch detected. Recreating database tables...")
    try:
        Base.metadata.drop_all(bind=engine)
    except Exception as drop_err:
        print(f"Error dropping tables: {drop_err}")

Base.metadata.create_all(bind=engine)

# Seed admin and default data
def seed_admin_and_data():
    db = Session(bind=engine)
    
    # 1. Seed Admin User
    admin_user = os.getenv("ADMIN_USERNAME", "Shivam")
    admin_password = os.getenv("ADMIN_PASSWORD", "Shivam5001")
    
    admin = db.query(AdminUser).filter(AdminUser.username == admin_user).first()
    if not admin:
        from admin_routes import get_password_hash
        # Delete previous default admin user if it exists
        db.query(AdminUser).filter(AdminUser.username == "admin").delete()
        admin = AdminUser(
            username=admin_user,
            hashed_password=get_password_hash(admin_password)
        )
        db.add(admin)
        
    # 2. Seed Technicians
    techs = [
        {"name": "Amit Kumar", "phone": "+91 93899 82912", "rating": 4.9, "status": "available"},
        {"name": "Sandeep Singh", "phone": "+91 98725 43210", "rating": 4.8, "status": "available"},
        {"name": "Gurpreet Singh", "phone": "+91 88720 12345", "rating": 4.9, "status": "available"},
        {"name": "Vikram Jeet", "phone": "+91 76960 98765", "rating": 4.7, "status": "available"}
    ]
    for tech_data in techs:
        tech = db.query(Technician).filter(Technician.name == tech_data["name"]).first()
        if not tech:
            db_tech = Technician(**tech_data)
            db.add(db_tech)
            
    # 3. Seed Coupon Codes
    coupons = [
        {"code": "WELCOME10", "discount_percent": 10},
        {"code": "COOLAIR20", "discount_percent": 20},
        {"code": "FESTIVE30", "discount_percent": 30}
    ]
    for cp_data in coupons:
        cp = db.query(Coupon).filter(Coupon.code == cp_data["code"]).first()
        if not cp:
            db_cp = Coupon(**cp_data)
            db.add(db_cp)
            
    # 4. Seed Inventory Items
    items = [
        {"name": "Copper Pipe Coil (15m)", "stock_level": 45, "unit_price": 1500, "description": "Insulated copper pipe line sets"},
        {"name": "R32 Gas Cylinder (10kg)", "stock_level": 8, "unit_price": 3500, "description": "Eco-friendly R-32 refrigerant gas"},
        {"name": "Run Capacitor (45uF)", "stock_level": 120, "unit_price": 250, "description": "Outdoor motor starter run capacitors"},
        {"name": "Indoor Fan Blower Motor", "stock_level": 15, "unit_price": 1800, "description": "Standard split AC indoor fan motors"}
    ]
    for item_data in items:
        item = db.query(InventoryItem).filter(InventoryItem.name == item_data["name"]).first()
        if not item:
            db_item = InventoryItem(**item_data)
            db.add(db_item)
            
    # 5. Seed Pricing Surcharge Factors
    factors = [
        {"name": "Peak Summer Surcharge", "multiplier": 1.15, "flat_fee": 0, "is_active": False},
        {"name": "Weekend Dispatch Surcharge", "multiplier": 1.0, "flat_fee": 150, "is_active": False},
        {"name": "Late Night Emergency Surcharge", "multiplier": 1.0, "flat_fee": 250, "is_active": False}
    ]
    for fac_data in factors:
        fac = db.query(PricingFactor).filter(PricingFactor.name == fac_data["name"]).first()
        if not fac:
            db_fac = PricingFactor(**fac_data)
            db.add(db_fac)
            
    db.commit()
    db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_admin_and_data()
    yield

app = FastAPI(
    title="AC Repair Service API",
    description="Backend API for AC Repair Business",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin routes
from admin_routes import router as admin_router
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to AC Repair Service API",
        "status": "Running",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.post("/api/bookings", response_model=BookingResponse)
def submit_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    try:
        db_booking = create_booking(db, booking)
        return db_booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings/track/{phone}")
def track_bookings(phone: str, db: Session = Depends(get_db)):
    from crud import get_customer_bookings
    try:
        return get_customer_bookings(db, phone)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/bookings/{booking_id}/payment")
def update_payment(booking_id: int, payment_status: str, db: Session = Depends(get_db)):
    from crud import update_booking_payment
    try:
        booking = update_booking_payment(db, booking_id, payment_status)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/coupons/validate/{code}")
def validate_coupon(code: str, db: Session = Depends(get_db)):
    try:
        coupon = db.query(Coupon).filter(Coupon.code == code.upper(), Coupon.is_active == True).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
        return {"code": coupon.code, "discount_percent": coupon.discount_percent}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Complaints Endpoint
@app.post("/api/complaints")
def submit_complaint(booking_id: int, description: str, db: Session = Depends(get_db)):
    from crud import create_complaint
    try:
        return create_complaint(db, booking_id, description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pricing Factors active endpoint
@app.get("/api/pricing-factors/active")
def read_active_pricing(db: Session = Depends(get_db)):
    try:
        return db.query(PricingFactor).filter(PricingFactor.is_active == True).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Technician App Portal Endpoints ---
class JobCompletePayload(BaseModel):
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    signature: Optional[str] = None
    repair_notes: Optional[str] = None

class InventoryRequestPayload(BaseModel):
    technician_id: int
    item_id: int
    qty: int

@app.get("/api/technicians")
def list_technicians_public(db: Session = Depends(get_db)):
    try:
        return db.query(Technician).all()
    except Exception as e:
        raise HTTPException(status_code=550, detail=str(e))

@app.post("/api/technicians/{tech_id}/attendance")
def technician_attendance(tech_id: int, action: str, db: Session = Depends(get_db)):
    from crud import log_attendance
    try:
        return log_attendance(db, tech_id, action)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/technicians/{tech_id}/jobs")
def technician_jobs(tech_id: int, db: Session = Depends(get_db)):
    from crud import get_technician_jobs
    try:
        return get_technician_jobs(db, tech_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/technicians/jobs/{booking_id}/complete")
def technician_complete_job(booking_id: int, payload: JobCompletePayload, db: Session = Depends(get_db)):
    from crud import complete_technician_job
    try:
        return complete_technician_job(db, booking_id, payload.before_photo, payload.after_photo, payload.signature, payload.repair_notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/technicians/jobs/{booking_id}/reject")
def technician_reject_job(booking_id: int, db: Session = Depends(get_db)):
    from crud import reject_technician_booking
    try:
        booking = reject_technician_booking(db, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/technicians/jobs/{booking_id}/status")
def technician_update_job_status(booking_id: int, status: str, db: Session = Depends(get_db)):
    from crud import update_booking_status
    try:
        booking = update_booking_status(db, booking_id, status)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/technicians/inventory-requests")
def technician_inventory_request(payload: InventoryRequestPayload, db: Session = Depends(get_db)):
    from crud import create_inventory_request
    try:
        res = create_inventory_request(db, payload.technician_id, payload.item_id, payload.qty)
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("message"))
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AC Repair API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)