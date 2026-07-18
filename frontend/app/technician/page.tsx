"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Clock,
  Briefcase,
  TrendingUp,
  BookOpen,
  AlertOctagon,
  MapPin,
  Navigation,
  CheckSquare,
  Camera,
  Cpu,
  Edit3,
  CheckCircle,
  FileText,
  DollarSign,
  Star,
  Activity,
  Calendar,
  Zap,
  Phone,
  ArrowLeft,
  X,
  PlayCircle,
  Loader2,
  Lock,
  ArrowRight,
  UserCheck,
  CreditCard,
  Heart
} from "lucide-react";

interface Technician {
  id: number;
  name: string;
  phone: string;
  rating: number;
  avatar: string;
  status: string;
}

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
  created_at: string;
  repair_notes: string | null;
}

interface InventoryItem {
  id: number;
  name: string;
  stock_level: number;
  unit_price: number;
}

export default function TechnicianPortal() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  // Authentication states
  const [authVerified, setAuthVerified] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs: attendance, jobs, earnings, training
  const [activeTab, setActiveTab] = useState<"attendance" | "jobs" | "earnings" | "training">("jobs");

  // Attendance states
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");

  // Jobs states
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [activeJob, setActiveJob] = useState<Booking | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Checklist and verification states
  const [checklist, setChecklist] = useState({
    leakage: false,
    compressor: false,
    filter: false,
    voltage: false,
  });
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [scannedParts, setScannedParts] = useState<string[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [repairNotes, setRepairNotes] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);
  const [collectingPayment, setCollectingPayment] = useState(false);

  // Canvas drawing reference for Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // SOS state
  const [sosActive, setSosActive] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Pin database mappings based on first 5 digits of phones
  const TECH_PINS: { [key: number]: string } = {
    1: "93899", // Amit
    2: "98725", // Sandeep
    3: "88720", // Gurpreet
    4: "76960", // Vikram
  };

  useEffect(() => {
    fetchTechnicians();
    fetchInventory();
  }, []);

  // Fetch jobs when selected technician swaps
  useEffect(() => {
    if (selectedTech && authVerified) {
      fetchJobs(selectedTech.id);
      setActiveJob(null);
      setNavigating(false);
      resetChecklist();
    }
  }, [selectedTech, authVerified]);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API_URL}/api/technicians`);
      if (res.ok) {
        const data = await res.json();
        setTechs(data);
        if (data.length > 0) {
          setSelectedTech(data[0]);
        }
      }
    } catch (err) {}
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/inventory`);
      if (res.ok) {
        setInventoryItems(await res.json());
      }
    } catch (err) {}
  };

  const fetchJobs = async (techId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/technicians/${techId}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        
        // Auto-resume active accepted job if there is any
        const active = data.find((j: Booking) => ["confirmed", "on_the_way", "arrived", "in_progress"].includes(j.status));
        if (active) {
          setActiveJob(active);
        }
      }
    } catch (err) {}
  };

  const resetChecklist = () => {
    setChecklist({ leakage: false, compressor: false, filter: false, voltage: false });
    setBeforePhoto(null);
    setAfterPhoto(null);
    setScannedParts([]);
    setRepairNotes("");
    setHasSigned(false);
    clearSignature();
  };

  // Authenticate technician PIN
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    setTimeout(() => {
      if (selectedTech) {
        const correctPin = TECH_PINS[selectedTech.id] || "1234";
        if (pinCode === correctPin) {
          setAuthVerified(true);
          setPinCode("");
        } else {
          setAuthError("Incorrect Secure PIN Code. Try again.");
        }
      }
      setAuthLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setAuthVerified(false);
    setActiveJob(null);
    setNavigating(false);
    setPinCode("");
    setAuthError("");
  };

  // Attendance actions
  const handleToggleClock = async () => {
    if (!selectedTech) return;
    const action = clockedIn ? "clock_out" : "clock_in";
    try {
      const res = await fetch(`${API_URL}/api/technicians/${selectedTech.id}/attendance?action=${action}`, {
        method: "POST"
      });
      if (res.ok) {
        setClockedIn(!clockedIn);
        setClockTime(new Date().toLocaleTimeString());
      }
    } catch (err) {}
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Leave application submitted successfully for ${selectedTech?.name}. Reason: ${leaveReason}`);
    setLeaveReason("");
    setLeaveModal(false);
  };

  // Stepper Status progression
  const handleProgressStatus = async (nextStatus: string) => {
    if (!activeJob) return;
    try {
      const res = await fetch(`${API_URL}/api/technicians/jobs/${activeJob.id}/status?status=${nextStatus}`, {
        method: "PUT"
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveJob(updated);
        setBookingsStatusInList(updated.id, nextStatus);
      }
    } catch (err) {}
  };

  const setBookingsStatusInList = (bookingId: number, status: string) => {
    setJobs((prev) => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  // Accept booking
  const handleAcceptJob = async (bookingId: number) => {
    // When accepting, we mark the status as 'confirmed' and set it as active
    try {
      const res = await fetch(`${API_URL}/api/technicians/jobs/${bookingId}/status?status=confirmed`, {
        method: "PUT"
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveJob(updated);
        setBookingsStatusInList(bookingId, "confirmed");
      }
    } catch (err) {}
  };

  // Reject booking
  const handleRejectJob = async (bookingId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/technicians/jobs/${bookingId}/reject`, {
        method: "PUT"
      });
      if (res.ok) {
        setActiveJob(null);
        if (selectedTech) fetchJobs(selectedTech.id);
      }
    } catch (err) {}
  };

  // Settle payment (Cash collection)
  const handleCollectCash = async () => {
    if (!activeJob) return;
    setCollectingPayment(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${activeJob.id}/payment?payment_status=paid`, {
        method: "PUT"
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveJob(updated);
        setJobs(prev => prev.map(b => b.id === updated.id ? { ...b, payment_status: "paid" } : b));
      }
    } catch (err) {}
    setCollectingPayment(false);
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Mock Photo capture uploads
  const simulatePhotoUpload = (type: "before" | "after") => {
    if (type === "before") {
      setBeforePhoto("/images/about.png");
    } else {
      setAfterPhoto("/images/about.png");
    }
  };

  // Part scanning simulation
  const handleScanPart = async () => {
    if (!selectedPartId || !selectedTech) return;
    const partId = parseInt(selectedPartId);
    
    try {
      const res = await fetch(`${API_URL}/api/technicians/inventory-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technician_id: selectedTech.id,
          item_id: partId,
          qty: 1
        })
      });

      if (res.ok) {
        const item = inventoryItems.find(i => i.id === partId);
        if (item) {
          setScannedParts([...scannedParts, item.name]);
        }
        fetchInventory();
      } else {
        alert("Unable to scan part: Insufficient stock levels.");
      }
    } catch (err) {}
    setSelectedPartId("");
  };

  // Job complete handler
  const handleCompleteJob = async () => {
    if (!activeJob) return;
    setCompletingJob(true);

    try {
      const res = await fetch(`${API_URL}/api/technicians/jobs/${activeJob.id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          before_photo: beforePhoto,
          after_photo: afterPhoto,
          signature: "digital_signed",
          repair_notes: repairNotes
        })
      });

      if (res.ok) {
        setInvoiceOpen(true);
      }
    } catch (err) {}
    setCompletingJob(false);
  };

  const handleCloseInvoice = () => {
    setInvoiceOpen(false);
    setActiveJob(null);
    setNavigating(false);
    resetChecklist();
    if (selectedTech) {
      fetchJobs(selectedTech.id);
    }
  };

  // Dynamic route planner coordinate path
  const getSimulatedRoutePath = (address: string) => {
    const text = address.toLowerCase();
    if (text.includes("35")) return "M 35 180 Q 80 120, 160 80";
    if (text.includes("22")) return "M 35 180 Q 100 130, 180 50";
    if (text.includes("70")) return "M 35 180 Q 60 140, 100 120";
    return "M 35 180 Q 120 120, 150 90";
  };

  // Tech summary calculations
  const completedJobs = jobs.filter(j => j.status === "completed");
  const totalBasePay = completedJobs.length * 200;
  const ratingIncentive = selectedTech ? Math.round(completedJobs.length * (selectedTech.rating - 4.0) * 100) : 0;
  const totalEarnings = totalBasePay + ratingIncentive;

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col items-center justify-center py-10 relative overflow-hidden font-sans">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Technician App Frame Container */}
      <div className="w-full max-w-[390px] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-[780px] overflow-hidden flex flex-col justify-between relative z-10">
        
        {/* Device Top Speaker & Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 border-b border-r border-l border-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-800" />
          <div className="w-10 h-1 bg-slate-955 rounded-full" />
        </div>

        {!authVerified ? (
          /* Authentication Screen */
          <div className="flex-grow flex flex-col justify-between p-6 pt-12 text-left">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group mt-4">
                  <span className="absolute inset-0 rounded-2xl bg-blue-500/5 animate-ping" />
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider">Technician Portal</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Authorized Access Only</p>
                </div>
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 text-rose-400 text-[10px] font-bold">
                  <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="off">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block">Select Technician</label>
                  <select
                    value={selectedTech?.id || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const found = techs.find(t => t.id === id);
                      if (found) {
                        setSelectedTech(found);
                        setPinCode("");
                        setAuthError("");
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-none cursor-pointer"
                  >
                    {techs.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block">Enter Secure PIN</label>
                  <input
                    type="password"
                    maxLength={5}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 5-digit PIN"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white text-center tracking-widest outline-none font-bold"
                  />
                  <span className="text-[8px] text-slate-550 block leading-normal mt-1 text-center">
                    Hint: PIN matches the first 5 digits of the tech's phone number (e.g. Amit is 93899)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !pinCode}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 mt-4"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Credentials"}
                </button>
              </form>
            </div>

            <div className="border-t border-slate-850 pt-4 text-center">
              <a href="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-555 hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Return to Website Home
              </a>
            </div>
          </div>
        ) : (
          /* Dashboard View */
          <>
            {/* Top Header Selector */}
            <div className="pt-8 px-5 pb-4 bg-slate-950/60 backdrop-blur-md border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-blue-500/20 bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  {selectedTech?.avatar ? (
                    <img src={selectedTech.avatar} className="w-full h-full object-cover" alt={selectedTech.name} />
                  ) : (
                    <UserCheck className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white">{selectedTech?.name}</h4>
                  <span className="text-[9px] block text-slate-500 font-bold uppercase tracking-wider">AC Specialist</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl text-[9px] cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => {
                    setSosActive(true);
                    setTimeout(() => setSosActive(false), 3000);
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-xl text-[9px] uppercase tracking-widest cursor-pointer"
                >
                  SOS
                </button>
              </div>
            </div>

            {/* Active Tab Screen Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-5 custom-scrollbar bg-slate-900/30">
              
              {/* Tab 1: Attendance Shift Logs */}
              {activeTab === "attendance" && (
                <div className="space-y-4 text-left">
                  <div className="p-5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-4">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-blue-500" /> Daily Shift Logs
                    </h3>
                    
                    <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                      <div>
                        <p className="font-bold text-white">Attendance Duty</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {clockedIn ? `Clocked In at ${clockTime}` : "Off Duty"}
                        </p>
                      </div>
                      <button
                        onClick={handleToggleClock}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          clockedIn
                            ? "bg-rose-500/15 border border-rose-500/20 text-rose-450"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        {clockedIn ? "Clock Out" : "Clock In"}
                      </button>
                    </div>
                  </div>

                  {/* Leave Management card */}
                  <div className="p-5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-3">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-blue-500" /> Leave Management
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Request planned leaves or report sick hours directly to dispatch operations.
                    </p>
                    <button
                      onClick={() => setLeaveModal(true)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-855 border border-slate-850 text-slate-350 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Apply Leave Request
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Jobs List & Verification */}
              {activeTab === "jobs" && (
                <div className="space-y-4 text-left">
                  {!clockedIn && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-505 rounded-2xl flex gap-2 text-xs font-semibold leading-normal">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Clock in under Attendance Tab to start receiving active jobs.</span>
                    </div>
                  )}

                  {clockedIn && !activeJob && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block pl-1">Assigned Booking Tickets</span>
                      
                      {jobs.filter(j => j.status !== "completed" && j.status !== "cancelled").length === 0 ? (
                        <div className="py-12 border border-dashed border-slate-850 rounded-2xl text-center space-y-2">
                          <Briefcase className="w-6 h-6 text-slate-700 mx-auto" />
                          <p className="text-xs text-slate-500 font-bold">No active jobs assigned</p>
                        </div>
                      ) : (
                        jobs.filter(j => j.status !== "completed" && j.status !== "cancelled").map((job) => (
                          <div key={job.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400">
                                {job.service}
                              </span>
                              <span className="text-[10px] text-white font-extrabold">ID: #{job.id}</span>
                            </div>
                            
                            <p className="text-[11px] text-slate-350 leading-normal"><strong className="text-slate-500 uppercase text-[9px] tracking-wider block mb-0.5">Address:</strong> {job.address}</p>

                            <div className="flex gap-2 pt-2 border-t border-slate-900">
                              <button
                                onClick={() => handleAcceptJob(job.id)}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] cursor-pointer text-center active:scale-95 transition-all"
                              >
                                Accept Job
                              </button>
                              <button
                                onClick={() => handleRejectJob(job.id)}
                                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 font-bold rounded-lg text-[10px] cursor-pointer text-center active:scale-95 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Active Accepted Job Sheet */}
                  {clockedIn && activeJob && (
                    <div className="space-y-4">
                      {/* Job card header */}
                      <div className="p-4 bg-slate-950 border border-blue-500/20 rounded-2xl relative overflow-hidden flex justify-between items-center">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 animate-pulse" />
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{activeJob.service}</h4>
                          <p className="text-[10px] text-slate-550 mt-1">Client: {activeJob.name} ({activeJob.phone})</p>
                        </div>
                        <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {activeJob.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Stepper Status controllers: On the Way -> Arrived -> In Progress -> Completed */}
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Update Job Progress Status</span>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {activeJob.status === "confirmed" && (
                            <button
                              onClick={() => handleProgressStatus("on_the_way")}
                              className="col-span-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] text-center cursor-pointer active:scale-95 transition-transform"
                            >
                              Dispatch: Set On the Way &rarr;
                            </button>
                          )}

                          {activeJob.status === "on_the_way" && (
                            <button
                              onClick={() => handleProgressStatus("arrived")}
                              className="col-span-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] text-center cursor-pointer active:scale-95 transition-transform"
                            >
                              Arrived: Set Arrived at Client &rarr;
                            </button>
                          )}

                          {activeJob.status === "arrived" && (
                            <button
                              onClick={() => handleProgressStatus("in_progress")}
                              className="col-span-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] text-center cursor-pointer active:scale-95 transition-transform"
                            >
                              Service: Start In Progress Work &rarr;
                            </button>
                          )}

                          {["on_the_way", "arrived", "in_progress"].includes(activeJob.status) && (
                            <div className="col-span-3 flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-900 pt-2.5">
                              <span>Currently: <strong className="text-white capitalize">{activeJob.status.replace(/_/g, " ")}</strong></span>
                              <button
                                onClick={() => handleRejectJob(activeJob.id)}
                                className="text-rose-400 hover:text-rose-300 font-bold"
                              >
                                Cancel/Release Job
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cash Collect Trigger */}
                      {activeJob.status === "in_progress" && activeJob.payment_status === "unpaid" && (
                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Unpaid Cash Bill</span>
                            <span className="text-sm font-black text-amber-500">Collect ₹{activeJob.price} Cash</span>
                          </div>
                          <button
                            onClick={handleCollectCash}
                            disabled={collectingPayment}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10 active:scale-95"
                          >
                            {collectingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                            Collect Cash
                          </button>
                        </div>
                      )}

                      {/* Dynamic Route GPS planner simulation */}
                      {["confirmed", "on_the_way"].includes(activeJob.status) && (
                        <div className="bg-slate-955 border border-slate-850 rounded-2xl overflow-hidden p-4 space-y-3 shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Daily Route GPS navigation</span>
                            <button
                              onClick={() => setNavigating(!navigating)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                navigating ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-600 text-white"
                              }`}
                            >
                              <Navigation className="w-3 h-3" /> {navigating ? "Voice Active" : "Start Route"}
                            </button>
                          </div>

                          <div className="h-28 bg-slate-950 border border-slate-900 rounded-xl relative overflow-hidden p-3 flex flex-col justify-between">
                            {/* Grid background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />
                            
                            {navigating && (
                              <>
                                {/* Route line */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0">
                                  <path d={getSimulatedRoutePath(activeJob.address)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 3" />
                                </svg>
                                <div className="z-10 bg-slate-900/90 backdrop-blur-xs border border-slate-800 p-2 rounded-lg w-fit text-[9px] text-slate-350">
                                  🗺️ Navigate: Head Sector-wise to doorstep.
                                </div>
                              </>
                            )}

                            {!navigating && (
                              <div className="z-10 m-auto text-[10px] text-slate-500 italic font-bold">
                                Click Start Route to plot customer navigation coordinates.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Checklist & Spare Parts Scan & Verification */}
                      {activeJob.status === "in_progress" && (
                        <div className="p-5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-4">
                          <h4 className="font-extrabold text-xs text-white border-b border-slate-900 pb-2 flex items-center gap-1.5">
                            <CheckSquare className="w-4 h-4 text-blue-500" /> Digital Service Checklist
                          </h4>

                          {/* Checkboxes */}
                          <div className="space-y-2.5 text-xs text-slate-350">
                            {[
                              { key: "leakage" as const, label: "AC Gas Leakage test completed" },
                              { key: "compressor" as const, label: "Compressor startup load check" },
                              { key: "filter" as const, label: "Blower filter screen cleanup" },
                              { key: "voltage" as const, label: "Input voltage levels verified" }
                            ].map((item) => (
                              <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checklist[item.key]}
                                  onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                                  className="w-4 h-4 rounded text-blue-600 border-slate-850 bg-slate-950 outline-none focus:ring-blue-500"
                                />
                                <span>{item.label}</span>
                              </label>
                            ))}
                          </div>

                          {/* Photos upload mock */}
                          <div className="border-t border-slate-900 pt-4 space-y-3">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Before / After Verification Photos</span>
                            
                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={() => simulatePhotoUpload("before")}
                                  className="w-full py-2.5 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Upload Before
                                </button>
                                {beforePhoto && (
                                  <div className="relative w-12 h-12 border border-slate-805 rounded-lg mx-auto overflow-hidden">
                                    <img src={beforePhoto} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={() => simulatePhotoUpload("after")}
                                  className="w-full py-2.5 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Upload After
                                </button>
                                {afterPhoto && (
                                  <div className="relative w-12 h-12 border border-slate-850 rounded-lg mx-auto overflow-hidden">
                                    <img src={afterPhoto} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Repair Notes text area */}
                          <div className="border-t border-slate-900 pt-4 space-y-1.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Service & Repair Notes</span>
                            <textarea
                              rows={2}
                              value={repairNotes}
                              onChange={(e) => setRepairNotes(e.target.value)}
                              placeholder="Cleaned condenser coil, filled AC R32 gas..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-650 focus:border-blue-500 outline-none transition-all resize-none"
                            />
                          </div>

                          {/* Spare Parts Scans */}
                          <div className="border-t border-slate-900 pt-4 space-y-2">
                            <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block">Scan HVAC Spare Parts used</span>
                            <div className="flex gap-2">
                              <select
                                value={selectedPartId}
                                onChange={(e) => setSelectedPartId(e.target.value)}
                                className="flex-grow px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-450 outline-none"
                              >
                                <option value="">Select Spare Part...</option>
                                {inventoryItems.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} (Stock: {item.stock_level})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={handleScanPart}
                                disabled={!selectedPartId}
                                className="px-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                              >
                                Scan
                              </button>
                            </div>
                            {scannedParts.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {scannedParts.map((p, idx) => (
                                  <span key={idx} className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[8px] font-bold">
                                    ✔️ {p} applied
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Customer Signature Pad using Canvas */}
                          <div className="border-t border-slate-900 pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Customer Digital Signature</span>
                              <button
                                type="button"
                                onClick={clearSignature}
                                className="text-[9px] text-slate-500 hover:text-slate-200 font-bold cursor-pointer"
                              >
                                Clear Sign
                              </button>
                            </div>

                            <div className="bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner">
                              <canvas
                                ref={canvasRef}
                                width={320}
                                height={100}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full bg-slate-100 cursor-crosshair h-[100px]"
                              />
                              {!hasSigned && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] text-slate-500 font-bold italic">
                                  Draw signature here
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Complete Button */}
                          <button
                            onClick={handleCompleteJob}
                            disabled={completingJob || !hasSigned || !checklist.compressor || !checklist.filter}
                            className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-650 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                          >
                            {completingJob ? (
                              <>
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                <span>Closing Service Order...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" /> Complete & Settle Billing
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Earnings & incentives */}
              {activeTab === "earnings" && (
                <div className="space-y-4 text-left">
                  {/* Total earnings block */}
                  <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-400" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-550 block font-bold uppercase tracking-wider">Total Earnings</span>
                      <span className="text-xl font-black text-white">₹{totalEarnings}</span>
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-teal-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Tally list */}
                  <div className="p-5 bg-slate-955 border border-slate-850 rounded-2xl space-y-3.5 text-xs text-slate-350">
                    <h3 className="font-extrabold text-sm text-white mb-2 pb-2 border-b border-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4.5 h-4.5 text-blue-500" /> Incentives & Metrics
                    </h3>

                    <div className="flex justify-between">
                      <span>Completed Jobs:</span>
                      <span className="font-bold text-white">{completedJobs.length} ticket(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Booking Commission:</span>
                      <span className="font-bold text-white">₹{totalBasePay}</span>
                    </div>
                    <div className="flex justify-between text-emerald-455 font-bold">
                      <span>Rating average incentives:</span>
                      <span>+₹{ratingIncentive}</span>
                    </div>

                    <div className="border-t border-slate-900 pt-3 flex justify-between text-xs font-black text-white">
                      <span>Total Paycheck:</span>
                      <span className="text-teal-450">₹{totalEarnings}</span>
                    </div>
                  </div>

                  {/* Performance Score circular indicators */}
                  {selectedTech && (
                    <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-white">Performance Rating</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">Score calculated from verified customer feedback reviews.</p>
                      </div>
                      <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-800 rounded-full shadow-inner">
                        <span className="text-sm font-black text-amber-500">{selectedTech.rating}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Training Tutorial clips */}
              {activeTab === "training" && (
                <div className="space-y-4 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block">Pro Skill Training Videos</span>
                  
                  {[
                    { title: "Split AC Gas Charging Pro Steps", duration: "12 mins", level: "Intermediate" },
                    { title: "Inverter AC Diagnostic Guide", duration: "18 mins", level: "Advanced" },
                    { title: "HVAC Condenser Capacitors Replacement", duration: "6 mins", level: "Beginner" }
                  ].map((vid, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-white leading-snug">{vid.title}</h4>
                        <div className="flex gap-2 text-[9px] text-slate-500 font-bold uppercase mt-1">
                          <span>⏱️ {vid.duration}</span>
                          <span>•</span>
                          <span className="text-blue-500">{vid.level}</span>
                        </div>
                      </div>

                      <button className="text-slate-550 hover:text-blue-450 transition-colors cursor-pointer flex-shrink-0">
                        <PlayCircle className="w-8 h-8" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Global Tab Bar Header */}
            <div className="py-2.5 bg-slate-955 border-t border-slate-850 flex items-center justify-around rounded-b-[2.5rem]">
              {[
                { id: "jobs" as const, icon: <Briefcase className="w-4.5 h-4.5" />, label: "Jobs" },
                { id: "attendance" as const, icon: <Clock className="w-4.5 h-4.5" />, label: "Clock" },
                { id: "earnings" as const, icon: <TrendingUp className="w-4.5 h-4.5" />, label: "Payout" },
                { id: "training" as const, icon: <BookOpen className="w-4.5 h-4.5" />, label: "Learn" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    activeTab === tab.id ? "text-blue-500" : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  {tab.icon}
                  <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

      </div>

      {/* SOS Flash overlay */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-600/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <AlertOctagon className="w-20 h-20 text-white animate-bounce" />
            <h3 className="text-2xl font-black uppercase mt-6 tracking-wider">EMERGENCY SOS ACTIVE</h3>
            <p className="text-sm font-semibold max-w-sm mt-3 text-rose-100 leading-relaxed">
              Help broadcasted! Your live GPS coordinates have been sent to base operations. Emergency dispatch is responding.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal Details */}
      <AnimatePresence>
        {invoiceOpen && activeJob && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-slate-350 text-left relative"
            >
              <div className="text-center space-y-2 border-b border-slate-850 pb-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Service Invoice</h3>
                <p className="text-[10px] text-slate-550">Order Completed Successfully</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Booking ID:</span>
                  <span className="font-extrabold text-white">#{activeJob.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550 font-bold">Customer:</span>
                  <span className="font-bold text-white">{activeJob.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550 font-bold">Service:</span>
                  <span className="font-bold text-blue-400">{activeJob.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550 font-bold">Settle Price:</span>
                  <span className="font-extrabold text-teal-400">₹{activeJob.price}</span>
                </div>
                {activeJob.repair_notes && (
                  <div className="flex justify-between">
                    <span className="text-slate-550 font-bold">Repair Notes:</span>
                    <span className="font-bold text-white">{activeJob.repair_notes}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-850 pt-3 text-slate-500 font-bold">
                  <span>Sign Completed:</span>
                  <span className="text-emerald-400">Digital Trackpad verified</span>
                </div>
              </div>

              <button
                onClick={handleCloseInvoice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
