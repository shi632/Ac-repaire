import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields (including address)
    const { name, phone, service, address, message } = body;
    if (!name || !phone || !service || !address) {
      return NextResponse.json(
        { error: "Missing required fields: name, phone, service, and address are required." },
        { status: 400 }
      );
    }

    // Phone Validation: must start with '+' and have a country code followed by a 10-digit number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^\+\d{1,4}\d{10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must include a country code starting with '+' followed by exactly 10 digits (e.g. +91 93899 82912)." },
        { status: 400 }
      );
    }

    // Email Validation: optional, but if entered, must be valid and contain '@'
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: "Invalid email address (must contain '@' and a domain, e.g. name@example.com)." },
          { status: 400 }
        );
      }
    }

    // Forward to FastAPI backend
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    
    const response = await fetch(`${backendUrl}/api/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name,
        phone,
        service,
        address,
        message: message || "",
        price: body.price,
        coupon_code: body.coupon_code,
        discount_applied: body.discount_applied,
        payment_status: body.payment_status
      }),
    });

    if (!response.ok) {
      let errorDetail = "Failed to submit booking to database server.";
      try {
        const errData = await response.json();
        errorDetail = errData.detail || errorDetail;
      } catch (e) {}
      
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Booking created successfully", booking: data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error forwarding booking:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error.message || error) },
      { status: 500 }
    );
  }
}