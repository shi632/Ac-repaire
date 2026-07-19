from sqlalchemy.orm import Session  # type: ignore
from models import Booking, Technician, Coupon, InventoryItem, Complaint, AuditLog, PricingFactor, AttendanceLog
from schemas import BookingCreate
import random

SERVICE_PRICES = {
    "AC Repair Service": 349,
    "AC Installation": 1199,
    "AC Maintenance": 499,
    "AC Gas Filling": 1999,
    "AC Uninstallation": 599
}

def log_audit_event(db: Session, user: str, role: str, action: str):
    log = AuditLog(user=user, role=role, action=action)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_audit_logs(db: Session):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(150).all()

def create_booking(db: Session, booking: BookingCreate):
    booking_data = booking.model_dump()
    
    # Calculate base price
    base_price = SERVICE_PRICES.get(booking.service, 499)
    discount = 0
    
    # Process coupon
    if booking.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == booking.coupon_code, Coupon.is_active == True).first()
        if coupon:
            discount = int(base_price * (coupon.discount_percent / 100.0))
            booking_data["discount_applied"] = discount
            
    booking_data["price"] = base_price - discount
    
    # Auto-assign technician
    available_tech = db.query(Technician).filter(Technician.status == "available").all()
    if available_tech:
        assigned_tech = random.choice(available_tech)
        booking_data["technician_id"] = assigned_tech.id
        
    booking_data["status"] = "pending"
    
    db_booking = Booking(**booking_data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Log audit event
    log_audit_event(db, "System", "Dispatcher", f"Auto-created and confirmed Booking #{db_booking.id} for client: {db_booking.name}")
    return db_booking

def get_bookings(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

def get_booking(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()

def get_customer_bookings(db: Session, phone: str):
    clean_phone = "".join(filter(str.isdigit, phone))
    all_bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    matched = []
    for b in all_bookings:
        b_digits = "".join(filter(str.isdigit, b.phone))
        if clean_phone in b_digits or b_digits in clean_phone:
            matched.append(b)
    return matched

def update_booking_status(db: Session, booking_id: int, status: str):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.status = status
        db.commit()
        db.refresh(booking)
        log_audit_event(db, "Admin/Tech", "Dispatcher", f"Updated status of Booking #{booking_id} to: {status}")
    return booking

def update_booking_payment(db: Session, booking_id: int, payment_status: str):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.payment_status = payment_status
        db.commit()
        db.refresh(booking)
        log_audit_event(db, "User/Admin", "Support Agent", f"Updated payment status of Booking #{booking_id} to: {payment_status}")
    return booking

def assign_technician(db: Session, booking_id: int, technician_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.technician_id = technician_id
        db.commit()
        db.refresh(booking)
        tech = db.query(Technician).filter(Technician.id == technician_id).first()
        tech_name = tech.name if tech else f"ID {technician_id}"
        log_audit_event(db, "Admin", "Dispatcher", f"Assigned technician '{tech_name}' to Booking #{booking_id}")
    return booking

def delete_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        db.delete(booking)
        db.commit()
        log_audit_event(db, "Admin", "Super Admin", f"Deleted booking record #{booking_id}")
    return booking

# Inventory Operations
def get_inventory_items(db: Session):
    return db.query(InventoryItem).all()

def update_inventory_stock(db: Session, item_id: int, stock_level: int):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if item:
        item.stock_level = stock_level
        db.commit()
        db.refresh(item)
        log_audit_event(db, "Admin", "Super Admin", f"Updated stock level of inventory '{item.name}' to: {stock_level}")
    return item

def create_inventory_item(db: Session, name: str, stock_level: int, unit_price: int, description: str = None):
    item = InventoryItem(name=name, stock_level=stock_level, unit_price=unit_price, description=description)
    db.add(item)
    db.commit()
    db.refresh(item)
    log_audit_event(db, "Admin", "Super Admin", f"Created inventory item '{name}' with {stock_level} units")
    return item

# Complaints Operations
def get_complaints(db: Session):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

def create_complaint(db: Session, booking_id: int, description: str):
    complaint = Complaint(booking_id=booking_id, description=description)
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    log_audit_event(db, "Customer", "Support Agent", f"Raised Customer Complaint #{complaint.id} regarding Booking #{booking_id}")
    return complaint

def update_complaint_status(db: Session, complaint_id: int, status: str):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if complaint:
        complaint.status = status
        db.commit()
        db.refresh(complaint)
        log_audit_event(db, "Admin", "Support Agent", f"Updated status of Complaint #{complaint_id} to: {status}")
    return complaint

# Pricing Multipliers Operations
def get_pricing_factors(db: Session):
    return db.query(PricingFactor).all()

def update_pricing_factor(db: Session, factor_id: int, multiplier: float, flat_fee: int, is_active: bool):
    factor = db.query(PricingFactor).filter(PricingFactor.id == factor_id).first()
    if factor:
        factor.multiplier = multiplier
        factor.flat_fee = flat_fee
        factor.is_active = is_active
        db.commit()
        db.refresh(factor)
        log_audit_event(db, "Admin", "Super Admin", f"Configured pricing rule '{factor.name}' (multiplier: {multiplier}x, fee: +₹{flat_fee}, active: {is_active})")
    return factor

# Technician Attendance & Completing Jobs
def log_attendance(db: Session, technician_id: int, action: str):
    log = AttendanceLog(technician_id=technician_id, action=action)
    db.add(log)
    db.commit()
    db.refresh(log)
    
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    tech_name = tech.name if tech else f"ID {technician_id}"
    log_audit_event(db, tech_name, "Dispatcher", f"Technician clocked {action.replace('_', ' ')}")
    return log

def get_technician_jobs(db: Session, technician_id: int):
    return db.query(Booking).filter(Booking.technician_id == technician_id).order_by(Booking.created_at.desc()).all()

def complete_technician_job(db: Session, booking_id: int, before_photo: str = None, after_photo: str = None, signature: str = None, repair_notes: str = None):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.status = "completed"
        booking.before_photo = before_photo
        booking.after_photo = after_photo
        booking.checklist_completed = True
        booking.customer_signature = signature
        booking.repair_notes = repair_notes
        db.commit()
        db.refresh(booking)
        
        tech_name = booking.technician.name if booking.technician else "Technician"
        log_audit_event(db, tech_name, "Dispatcher", f"Completed service order Booking #{booking_id} and collected signature.")
    return booking

def reject_technician_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        tech_name = booking.technician.name if booking.technician else "Technician"
        booking.technician_id = None
        booking.status = "pending"
        db.commit()
        db.refresh(booking)
        log_audit_event(db, tech_name, "Dispatcher", f"Rejected service assignment for Booking #{booking_id} (Returned to pending queue)")
    return booking

def create_inventory_request(db: Session, technician_id: int, item_id: int, qty: int):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    tech_name = tech.name if tech else f"ID {technician_id}"
    
    if item and item.stock_level >= qty:
        item.stock_level -= qty
        db.commit()
        log_audit_event(db, tech_name, "Super Admin", f"Scanned & used {qty} unit(s) of '{item.name}' (Stock level updated)")
        return {"success": True, "stock": item.stock_level}
    return {"success": False, "message": "Insufficient stock"}

def update_technician(db: Session, tech_id: int, name: str, phone: str, rating: float, status: str = None):
    tech = db.query(Technician).filter(Technician.id == tech_id).first()
    if tech:
        tech.name = name
        tech.phone = phone
        tech.rating = rating
        if status:
            tech.status = status
        db.commit()
        db.refresh(tech)
        log_audit_event(db, "Admin", "Super Admin", f"Updated technician info for '{name}' (ID: {tech_id})")
    return tech

def delete_technician(db: Session, tech_id: int):
    tech = db.query(Technician).filter(Technician.id == tech_id).first()
    if tech:
        db.query(Booking).filter(Booking.technician_id == tech_id).update({Booking.technician_id: None})
        db.delete(tech)
        db.commit()
        log_audit_event(db, "Admin", "Super Admin", f"Deleted technician record '{tech.name}' (ID: {tech_id})")
    return tech

def update_booking_details(db: Session, booking_id: int, name: str, phone: str, service: str, address: str, price: int, status: str):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        booking.name = name
        booking.phone = phone
        booking.service = service
        booking.address = address
        booking.price = price
        booking.status = status
        db.commit()
        db.refresh(booking)
        log_audit_event(db, "Admin", "Super Admin", f"Edited Booking details for #{booking_id} (Client: {name})")
    return booking