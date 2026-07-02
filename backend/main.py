from fastapi import FastAPI, Depends, HTTPException  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from contextlib import asynccontextmanager

from database import engine, Base, get_db
from models import Booking, AdminUser
from schemas import BookingCreate, BookingResponse
from crud import create_booking
from admin_routes import router as admin_router
import os

# Create tables
Base.metadata.create_all(bind=engine)

# Seed admin user
def seed_admin():
    db = Session(bind=engine)
    admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    if not admin:
        from admin_routes import get_password_hash
        admin = AdminUser(
            username="admin",
            hashed_password=get_password_hash("admin123")  # Change in production!
        )
        db.add(admin)
        db.commit()
    db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_admin()
    yield

app = FastAPI(
    title="AC Repair Service API",
    description="Backend API for AC Repair Business",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin routes
app.include_router(admin_router)

@app.post("/api/bookings", response_model=BookingResponse)
def submit_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    try:
        db_booking = create_booking(db, booking)
        return db_booking
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AC Repair API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)