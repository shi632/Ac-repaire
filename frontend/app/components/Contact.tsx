"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SERVICE_PRICES: { [key: string]: number } = {
  "AC Repair Service": 349,
  "AC Installation": 1199,
  "AC Maintenance": 499,
  "AC Gas Filling": 1999,
  "AC Uninstallation": 599,
};

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    address: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Coupon and payment states
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("after_service"); // after_service, online
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [activePaymentTab, setActivePaymentTab] = useState<"card" | "upi">("upi");
  
  // Dynamic Pricing states
  const [activeSurges, setActiveSurges] = useState<any[]>([]);

  // Fetch dynamic pricing factors
  const fetchActiveSurges = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pricing-factors/active`);
      if (res.ok) {
        const data = await res.json();
        setActiveSurges(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchActiveSurges();
  }, []);

  // Custom Event Listener to pre-fill service dropdown
  useEffect(() => {
    const handleSelectService = (e: Event) => {
      const selectedTitle = (e as CustomEvent).detail;
      setFormData((prev) => ({
        ...prev,
        service: selectedTitle,
      }));
    };

    window.addEventListener("select-service", handleSelectService);
    return () => {
      window.removeEventListener("select-service", handleSelectService);
    };
  }, []);

  // Update discount applied when service or discount percent changes
  useEffect(() => {
    const basePrice = SERVICE_PRICES[formData.service] || 0;
    if (basePrice > 0 && discountPercent > 0) {
      setDiscountApplied(Math.round(basePrice * (discountPercent / 100)));
    } else {
      setDiscountApplied(0);
    }
  }, [formData.service, discountPercent]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!formData.service) {
      setCouponError("Please select a service first.");
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/coupons/validate/${couponCode.trim().toUpperCase()}`);
      if (!res.ok) {
        throw new Error("Invalid or expired coupon code");
      }
      const data = await res.json();
      setDiscountPercent(data.discount_percent);
      setCouponSuccess(true);
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
      setDiscountPercent(0);
      setDiscountApplied(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePaymentTab === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      setErrorMsg("Please fill in card details.");
      return;
    }
    if (activePaymentTab === "upi" && !upiId.includes("@")) {
      setErrorMsg("Please enter a valid UPI ID (e.g. name@okhdfc).");
      return;
    }

    setPaymentProcessing(true);
    setErrorMsg("");

    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/bookings/${createdBooking.id}/payment?payment_status=paid`, {
          method: "PUT",
        });

        if (response.ok) {
          setPaymentSuccess(true);
          setTimeout(() => {
            setShowPaymentModal(false);
            setSubmitted(true);
            setFormData({ name: "", email: "", phone: "", service: "", address: "", message: "" });
            setCouponCode("");
            setCouponSuccess(false);
            setDiscountPercent(0);
            setDiscountApplied(0);
            setPaymentSuccess(false);
            setPaymentProcessing(false);
          }, 1500);
        } else {
          setErrorMsg("Payment validation failed. Please try again.");
          setPaymentProcessing(false);
        }
      } catch (error) {
        setErrorMsg("Payment error: Server unreachable.");
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Basic Client-Side Validation
    if (formData.name.trim().length < 2) {
      setErrorMsg("Please enter a valid name (at least 2 characters).");
      setLoading(false);
      return;
    }
    if (formData.phone.trim().length < 5) {
      setErrorMsg("Please enter a valid phone number.");
      setLoading(false);
      return;
    }
    if (formData.address.trim().length < 5) {
      setErrorMsg("Please enter a complete service address (at least 5 characters).");
      setLoading(false);
      return;
    }
    if (!formData.service) {
      setErrorMsg("Please select a service from the dropdown.");
      setLoading(false);
      return;
    }

    const basePrice = SERVICE_PRICES[formData.service] || 499;
    
    // Apply dynamic pricing factors
    let surgeFlat = 0;
    let surgeMult = 1.0;
    activeSurges.forEach((s) => {
      if (s.multiplier > 1.0) surgeMult *= s.multiplier;
      if (s.flat_fee > 0) surgeFlat += s.flat_fee;
    });
    const surgedCost = Math.round(basePrice * surgeMult) + surgeFlat - basePrice;
    const finalPrice = Math.max(0, basePrice + surgedCost - discountApplied);

    const payload = {
      ...formData,
      price: finalPrice,
      coupon_code: couponSuccess ? couponCode.toUpperCase() : null,
      discount_applied: discountApplied,
      payment_status: "unpaid",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        const booking = resData.booking;
        setCreatedBooking(booking);
        if (paymentMethod === "online") {
          setShowPaymentModal(true);
        } else {
          setSubmitted(true);
          setFormData({ name: "", email: "", phone: "", service: "", address: "", message: "" });
          setCouponCode("");
          setCouponSuccess(false);
          setDiscountPercent(0);
          setDiscountApplied(0);
        }
      } else {
        setErrorMsg(resData.error || "Failed to submit booking request. Please check details.");
      }
    } catch (error: any) {
      setErrorMsg("Network error: Could not reach the server. Please try again later.");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Our Workshop",
      details: COMPANY_CONFIG.address,
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Call Direct",
      details: COMPANY_CONFIG.phone,
      link: `tel:${COMPANY_CONFIG.phoneRaw}`,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      details: COMPANY_CONFIG.email,
      link: `mailto:${COMPANY_CONFIG.email}`,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Working Hours",
      details: COMPANY_CONFIG.workingHours,
    },
  ];

  // Pricing calculations for UI display
  const basePrice = SERVICE_PRICES[formData.service] || 0;
  let surgeFlat = 0;
  let surgeMult = 1.0;
  activeSurges.forEach((s) => {
    if (s.multiplier > 1.0) surgeMult *= s.multiplier;
    if (s.flat_fee > 0) surgeFlat += s.flat_fee;
  });
  const surgedCost = Math.round(basePrice * surgeMult) + surgeFlat - basePrice;
  const grandTotal = Math.max(0, basePrice + surgedCost - discountApplied);

  return (
    <section id="contact" className="py-16 bg-white relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 z-10 relative max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Connect With Us</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Book a Professional <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AC Service</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Fill in your details below to schedule an expert technician visit. Fast doorstep service.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Map and Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5 lg:h-auto lg:flex-1"
          >
            {/* Map Card */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden p-4 shadow-sm h-[240px] lg:h-auto lg:flex-1 relative group">
              <iframe
                src={COMPANY_CONFIG.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-550"
              />
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-extrabold text-[10px] mb-0.5 uppercase tracking-wide">
                      {info.title}
                    </h4>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-slate-650 hover:text-blue-600 font-medium text-[11px] break-all transition-colors"
                      >
                        {info.details}
                      </a>
                    ) : (
                      <p className="text-slate-655 font-medium text-[11px]">
                        {info.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full shadow-sm"
              >
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full w-fit mb-4 shadow-sm shadow-emerald-500/5">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-xs text-slate-550 max-w-xs mb-5 leading-relaxed">
                  Thank you for booking with CoolAir. A certified AC technician has been assigned and will contact you shortly.
                </p>
                <div className="bg-slate-100/50 border border-slate-200/50 rounded-xl p-3.5 w-full max-w-[240px] text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between font-bold">
                    <span>Order Price:</span>
                    <span className="text-blue-600">₹{createdBooking?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className={`font-bold capitalize ${createdBooking?.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {createdBooking?.payment_status === 'paid' ? 'Paid Online' : 'Pay on Delivery'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-transform active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Submit Another Booking
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col h-full text-left">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 border-b border-slate-155 pb-2 mb-1">Request Service</h3>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 text-rose-700 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900"
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900"
                        placeholder="name@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                        Service Needed *
                      </label>
                      <select
                        required
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900 cursor-pointer"
                      >
                        <option value="">Select a service</option>
                        <option value="AC Repair Service">AC Repair Service</option>
                        <option value="AC Installation">AC Installation</option>
                        <option value="AC Maintenance">AC Maintenance</option>
                        <option value="AC Gas Filling">AC Gas Filling</option>
                        <option value="AC Uninstallation">AC Uninstallation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                      Doorstep Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900 resize-none"
                      placeholder="Enter flat no, building name, and sector details"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5">
                      Describe Problem (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900 resize-none"
                      placeholder="AC is leaking water / blowing warm air..."
                    />
                  </div>

                  {/* Coupon & Pricing */}
                  {formData.service && (
                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      {/* Coupon input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-555 uppercase mb-1">
                          Apply Promo Coupon
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter Code (e.g. COOLAIR20)"
                            disabled={couponSuccess}
                            className="flex-grow px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs text-slate-900 uppercase"
                          />
                          <button
                            type="button"
                            onClick={handleValidateCoupon}
                            disabled={validatingCoupon || couponSuccess || !couponCode.trim()}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {validatingCoupon ? "Checking..." : couponSuccess ? "Applied" : "Apply"}
                          </button>
                        </div>
                        {couponError && <p className="text-[9px] text-rose-500 font-bold mt-0.5">{couponError}</p>}
                        {couponSuccess && (
                          <p className="text-[9px] text-emerald-600 font-bold mt-0.5">
                            Success! Coupon applied ({discountPercent}% Discount)
                          </p>
                        )}
                      </div>

                      {/* Payment Method Option */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-555 uppercase mb-1">
                          Choose Payment Option
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("after_service")}
                            className={`px-3 py-2.5 rounded-lg border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              paymentMethod === "after_service"
                                ? "border-blue-600 bg-blue-50/50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>Pay After Service</span>
                            <span className="text-[8px] text-slate-500 font-medium font-sans">Cash / UPI at doorstep</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("online")}
                            className={`px-3 py-2.5 rounded-lg border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              paymentMethod === "online"
                                ? "border-blue-600 bg-blue-50/50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>Pay Securely Online</span>
                            <span className="text-[8px] text-slate-500 font-medium font-sans">UPI & Card Gateway</span>
                          </button>
                        </div>
                      </div>

                      {/* Pricing Summary */}
                      <div className="bg-slate-100/50 border border-slate-200/50 rounded-xl p-3.5 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>Base Service Cost:</span>
                          <span className="font-semibold text-slate-800">₹{basePrice}</span>
                        </div>
                        
                        {surgedCost > 0 && (
                          <div className="flex justify-between text-amber-600 font-medium">
                            <span>Demand Surcharges:</span>
                            <span>+₹{surgedCost}</span>
                          </div>
                        )}

                        {discountApplied > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Promo Discount Applied:</span>
                            <span>-₹{discountApplied}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xs font-black border-t border-slate-200 pt-2 text-slate-900">
                          <span>Grand Total:</span>
                          <span className="text-blue-600">₹{grandTotal}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 lg:mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-[0.99] cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Booking Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Book AC Technician Now</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && createdBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-white text-left relative z-50"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    Secure Checkout <CheckCircle className="w-5 h-5 text-blue-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: #{createdBooking.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Amount Due</span>
                <span className="text-xl font-black text-blue-400">₹{createdBooking.price}</span>
              </div>

              {/* Payment Method tabs */}
              <div className="flex gap-2 p-1 bg-slate-950 border border-slate-850 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActivePaymentTab("upi")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    activePaymentTab === "upi" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setActivePaymentTab("card")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    activePaymentTab === "card" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Card Checkout
                </button>
              </div>

              <form onSubmit={handleSimulatePayment} className="space-y-4">
                {activePaymentTab === "upi" ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      required={activePaymentTab === "upi"}
                      placeholder="e.g. shivam@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs"
                    />
                    <span className="text-[9px] text-slate-500 block leading-normal mt-1">
                      Enter your UPI address (e.g. shivam@okhdfc, shivam@paytm) and click Pay to simulate checkout verification.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required={activePaymentTab === "card"}
                        placeholder="4111 2222 3333 4444"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Expiry MM/YY
                        </label>
                        <input
                          type="text"
                          required={activePaymentTab === "card"}
                          placeholder="12/28"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          required={activePaymentTab === "card"}
                          maxLength={3}
                          placeholder="•••"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2 text-rose-400 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{paymentSuccess ? "Payment Verified!" : "Processing Secure Payment..."}</span>
                    </>
                  ) : (
                    <span>Pay ₹{createdBooking.price} Now</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}