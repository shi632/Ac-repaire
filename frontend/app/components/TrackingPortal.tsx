"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Calendar, MapPin, Phone, Star, ShieldCheck, CheckCircle2, AlertCircle, Clock, CreditCard, ChevronRight, X, ArrowLeft, AlertTriangle } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

const API_URL = "";

interface Booking {
  id: number;
  name: string;
  phone: string;
  service: string;
  address: string;
  message: string | null;
  status: string;
  price: number;
  coupon_code: string | null;
  discount_applied: number;
  payment_status: string;
  technician_id: number | null;
  technician: {
    id: number;
    name: string;
    phone: string;
    rating: number;
    avatar: string;
  } | null;
  created_at: string;
}

export default function TrackingPortal() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchDone, setSearchDone] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Simulated GPS variables
  const [eta, setEta] = useState(15);
  const [techPosition, setTechPosition] = useState({ x: 20, y: 70 }); // percentages inside the mock map container

  // Payment states inside tracking
  const [showPayModal, setShowPayModal] = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [paymentTab, setPaymentTab] = useState<"upi" | "card">("upi");

  // Complaint states
  const [complaintText, setComplaintText] = useState("");
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Fetch customer bookings
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phoneNumber.trim().length < 5) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSearchDone(false);
    setSelectedBooking(null);
    setComplaintSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/bookings/track/${phoneNumber.trim()}`);
      if (!res.ok) {
        throw new Error("Unable to search bookings at this time.");
      }
      const data = await res.json();
      setBookings(data);
      setSearchDone(true);

      // Default select the latest booking if list is not empty
      if (data.length > 0) {
        setSelectedBooking(data[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to search bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate live location movement of technician
  useEffect(() => {
    if (!selectedBooking || selectedBooking.status !== "confirmed") return;

    // Reset ETA and position on load
    setEta(14);
    setTechPosition({ x: 15, y: 65 });

    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 2) return 2;
        return prev - 1;
      });

      setTechPosition((prev) => {
        const dx = 80 - prev.x;
        const dy = 30 - prev.y;
        
        const stepX = dx * 0.15;
        const stepY = dy * 0.15;

        return {
          x: Math.min(80, Math.max(0, prev.x + stepX + (Math.random() * 2 - 1))),
          y: Math.min(80, Math.max(0, prev.y + stepY + (Math.random() * 2 - 1))),
        };
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [selectedBooking]);

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !complaintText.trim()) return;

    setComplaintLoading(true);
    setErrorMsg("");
    setComplaintSuccess(false);

    try {
      const res = await fetch(
        `${API_URL}/api/complaints?booking_id=${selectedBooking.id}&description=${encodeURIComponent(complaintText.trim())}`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        setComplaintSuccess(true);
        setComplaintText("");
      } else {
        setErrorMsg("Failed to submit support complaint. Try again.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to complaint backend.");
    }
    setComplaintLoading(false);
  };

  const triggerPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (paymentTab === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      setErrorMsg("Please fill in credit card details.");
      return;
    }
    if (paymentTab === "upi" && !upiId.includes("@")) {
      setErrorMsg("Please enter a valid UPI address.");
      return;
    }

    setPayProcessing(true);
    setErrorMsg("");

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${selectedBooking.id}/payment?payment_status=paid`, {
          method: "PUT",
        });

        if (res.ok) {
          const updated = await res.json();
          setPaySuccess(true);
          
          setTimeout(() => {
            setSelectedBooking(updated);
            setBookings((prev) =>
              prev.map((b) => (b.id === updated.id ? { ...b, payment_status: "paid" } : b))
            );
            
            setShowPayModal(false);
            setPaySuccess(false);
            setPayProcessing(false);
          }, 1500);
        } else {
          setErrorMsg("Payment simulation failed. Try again.");
          setPayProcessing(false);
        }
      } catch (err) {
        setErrorMsg("Payment connection failed.");
        setPayProcessing(false);
      }
    }, 2000);
  };

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return 1;
      case "confirmed": return 3;
      case "completed": return 5;
      case "cancelled": return 0;
      default: return 1;
    }
  };

  return (
    <section id="track-status" className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Tracking Dashboard</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Track Your <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Service Status</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Enter your mobile number below to see active status tracking, assigned technicians, and past service history.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-grow flex items-center pl-3 gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter booking phone number"
                className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-blue-500/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Now"}
            </button>
          </form>
          {errorMsg && !showPayModal && (
            <p className="text-center text-xs text-rose-500 font-bold mt-3">{errorMsg}</p>
          )}
        </div>

        {/* Results Container */}
        {searchDone && (
          <div className="max-w-6xl mx-auto">
            {bookings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-fit mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Bookings Found</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  We couldn't find any booking history associated with phone number **{phoneNumber}**. Check the number or submit a booking.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Side: Booking History List */}
                <div className="space-y-4 lg:col-span-1 text-left">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Service List</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {bookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setComplaintSuccess(false);
                          setComplaintText("");
                        }}
                        className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 cursor-pointer shadow-sm ${
                          selectedBooking?.id === booking.id
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              selectedBooking?.id === booking.id
                                ? "bg-white/20 text-white"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {booking.service}
                            </span>
                            <p className="text-xs font-bold mt-2">ID: #{booking.id}</p>
                          </div>
                          <span className={`text-[10px] font-bold capitalize px-2.5 py-1 rounded-lg ${
                            booking.status === "completed"
                              ? (selectedBooking?.id === booking.id ? "bg-emerald-500/25 text-white" : "bg-emerald-550/10 text-emerald-600")
                              : booking.status === "cancelled"
                              ? (selectedBooking?.id === booking.id ? "bg-rose-500/25 text-white" : "bg-rose-500/10 text-rose-550")
                              : (selectedBooking?.id === booking.id ? "bg-white/25 text-white animate-pulse" : "bg-amber-500/10 text-amber-500 animate-pulse")
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full text-[10px]">
                          <span className="opacity-80">
                            {new Date(booking.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-extrabold">₹{booking.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Detailed Tracking dashboard */}
                <div className="lg:col-span-2">
                  {selectedBooking && (
                    <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 space-y-8 shadow-sm text-left">
                      {/* Dashboard Header */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-5 gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{selectedBooking.service}</h4>
                          <p className="text-xs text-slate-500 mt-1">Booked on {new Date(selectedBooking.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Payment Status</span>
                            <span className={`text-xs font-black capitalize ${selectedBooking.payment_status === "paid" ? "text-emerald-600" : "text-amber-550 animate-pulse"}`}>
                              {selectedBooking.payment_status === "paid" ? "Paid Securely" : "Unpaid Order"}
                            </span>
                          </div>
                          {selectedBooking.payment_status !== "paid" && selectedBooking.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => setShowPayModal(true)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Online
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stepper Status Progress */}
                      {selectedBooking.status === "cancelled" ? (
                        <div className="bg-rose-50 border border-rose-100 text-rose-850 rounded-2xl p-4 flex gap-3 text-xs leading-normal font-semibold">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <p className="font-extrabold text-rose-900">Booking Cancelled</p>
                            <p className="text-rose-700 text-[11px] mt-0.5 font-medium">This service booking request has been marked as cancelled. Please book another AC service if you require assistance.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Live Status Progress</span>
                          <div className="relative flex justify-between items-center w-full pt-2">
                            {/* Connector Line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-100 z-0" />
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-blue-600 z-0 transition-all duration-1000"
                              style={{ width: `${((getStatusStep(selectedBooking.status) - 1) / 4) * 100}%` }}
                            />

                            {[
                              { label: "Booked", step: 1 },
                              { label: "Confirmed", step: 3 },
                              { label: "Completed", step: 5 },
                            ].map((s) => {
                              const isActive = getStatusStep(selectedBooking.status) >= s.step;
                              return (
                                <div key={s.step} className="z-10 flex flex-col items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center font-bold text-xs transition-all ${
                                    isActive
                                      ? "bg-blue-600 border-white text-white shadow-md shadow-blue-500/20 scale-110"
                                      : "bg-white border-slate-200 text-slate-400"
                                  }`}>
                                    {isActive ? <CheckCircle2 className="w-4 h-4" /> : s.step === 1 ? "1" : s.step === 3 ? "2" : "3"}
                                  </div>
                                  <span className={`text-[10px] font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Technician & Map Simulation Columns */}
                      {selectedBooking.status === "confirmed" && selectedBooking.technician && (
                        <div className="grid md:grid-cols-5 gap-6 pt-4 border-t border-slate-100">
                          {/* Technician profile card */}
                          <div className="md:col-span-2 bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-14 h-14 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center border border-blue-200">
                                <span className="font-extrabold text-blue-600 text-lg">
                                  {selectedBooking.technician.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <h5 className="font-extrabold text-sm text-slate-900">{selectedBooking.technician.name}</h5>
                                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">AC Specialist</span>
                                <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-1 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                                  <span>{selectedBooking.technician.rating} Rating</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-slate-200/60 pt-4 space-y-3 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Technician Contact</span>
                                <a
                                  href={`tel:${selectedBooking.technician.phone}`}
                                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[10px]"
                                >
                                  <Phone className="w-3 h-3" /> {selectedBooking.technician.phone}
                                </a>
                              </div>
                              <div className="p-3 bg-blue-50/50 rounded-xl flex gap-2.5 items-center text-blue-700 text-[10px] font-semibold leading-normal">
                                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>Background verified pro assigned for your safety.</span>
                              </div>
                            </div>
                          </div>

                          {/* Map Simulation widget */}
                          <div className="md:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden min-h-[220px] flex flex-col justify-between p-4 relative group shadow-inner">
                            {/* Grid Map Background */}
                            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                            {/* Simulated Path Line */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20">
                              <path d="M 50 150 Q 150 100, 300 60" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 4" />
                            </svg>

                            {/* GPS Headings */}
                            <div className="z-10 flex justify-between items-start bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-xl w-full">
                              <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Technician Location</span>
                                <span className="text-[10px] text-white font-bold flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> En Route to Doorstep
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Estimated ETA</span>
                                <span className="text-[10px] text-blue-400 font-black">{eta} mins remaining</span>
                              </div>
                            </div>

                            {/* Simulated moving icon */}
                            <motion.div
                              className="absolute z-10 w-9 h-9 bg-blue-600 border border-blue-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                              style={{ left: `${techPosition.x}%`, top: `${techPosition.y}%`, transform: "translate(-50%, -50%)" }}
                              animate={{ x: [0, 1.5, -1.5, 0], y: [0, -1.5, 1.5, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Star className="w-4 h-4 fill-white" />
                            </motion.div>

                            {/* Client Destination Point */}
                            <div className="absolute z-10 w-4 h-4 bg-emerald-500 border border-white rounded-full shadow-md flex items-center justify-center" style={{ left: "80%", top: "30%" }}>
                              <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                            </div>

                            <div className="z-10 w-full text-center">
                              <span className="text-[9px] text-slate-500 font-medium">GPS location updates every 5s</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Info (Address & Request Message) */}
                      <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Service Address</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{selectedBooking.address}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Instructions/Message</span>
                          <p className="text-slate-700 font-medium leading-relaxed italic">{selectedBooking.message || "No special instructions provided."}</p>
                        </div>
                      </div>

                      {/* Customer Complaint Section */}
                      {selectedBooking.status !== "cancelled" && (
                        <div className="pt-6 border-t border-slate-100">
                          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block mb-2">Need Support or Have a Complaint?</span>
                          
                          {complaintSuccess ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-700 text-xs font-semibold">
                              Complaint logged successfully! Our support agents will contact you shortly.
                            </div>
                          ) : (
                            <form onSubmit={handleRaiseComplaint} className="space-y-3">
                              <textarea
                                rows={2}
                                required
                                value={complaintText}
                                onChange={(e) => setComplaintText(e.target.value)}
                                placeholder="Describe your issue or complaint details here (e.g. Technician did not clean up properly / Cooling issue recurred)..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-none transition-all resize-none"
                              />
                              <button
                                type="submit"
                                disabled={complaintLoading || !complaintText.trim()}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                {complaintLoading ? "Logging Issue..." : "File Support Request"}
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment checkout modal (UPI & Card checkouts) */}
      <AnimatePresence>
        {showPayModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-white text-left relative z-50"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    Online Bill Settle <CheckCircle2 className="w-5 h-5 text-blue-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: #{selectedBooking.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Amount Payable</span>
                <span className="text-xl font-black text-blue-400">₹{selectedBooking.price}</span>
              </div>

              {/* Payment Method tabs */}
              <div className="flex gap-2 p-1 bg-slate-950 border border-slate-850 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentTab("upi")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    paymentTab === "upi" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab("card")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    paymentTab === "card" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Card Checkout
                </button>
              </div>

              <form onSubmit={triggerPaymentSubmit} className="space-y-4">
                {paymentTab === "upi" ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      required={paymentTab === "upi"}
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
                        required={paymentTab === "card"}
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
                          required={paymentTab === "card"}
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
                          required={paymentTab === "card"}
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
                  disabled={payProcessing}
                  className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {payProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{paySuccess ? "Payment Settled!" : "Processing Secure Payment..."}</span>
                    </>
                  ) : (
                    <span>Pay ₹{selectedBooking.price} Now</span>
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
