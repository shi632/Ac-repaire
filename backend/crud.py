from sqlalchemy.orm import Session  # type: ignore
from models import Booking
from schemas import BookingCreate

def create_booking(db: Session, booking: BookingCreate):
    db_booking = Booking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_bookings(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

def get_booking(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()

def update_booking_status(db: Session, booking_id: int, status: str):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.status = status
        db.commit()
        db.refresh(booking)
    return booking

def delete_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        db.delete(booking)
        db.commit()
    return booking