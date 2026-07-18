"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  LogOut,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Layers,
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff,
  MessageSquare,
  Copy,
  ExternalLink,
  Coins,
  ArrowRight,
  Loader2,
  UserPlus,
  PlusCircle,
  Tag,
  CreditCard,
  Star,
  Activity,
  Map,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCcw,
  Sliders,
  FileText,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  X
} from "lucide-react";

interface Technician {
  id: number;
  name: string;
  phone: string;
  rating: number;
  avatar: string;
  status: string;
}

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  is_active: boolean;
}

interface InventoryItem {
  id: number;
  name: string;
  stock_level: number;
  unit_price: number;
  description: string | null;
}

interface Complaint {
  id: number;
  booking_id: number;
  description: string;
  status: string;
  created_at: string;
  booking: Booking | null;
}

interface AuditLog {
  id: number;
  user: string;
  role: string;
  action: string;
  timestamp: string;
}

interface PricingFactor {
  id: number;
  name: string;
  multiplier: number;
  flat_fee: number;
  is_active: boolean;
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
  technician: {
    id: number;
    name: string;
    phone: string;
    rating: number;
    avatar: string;
  } | null;
  created_at: string;
  before_photo: string | null;
  after_photo: string | null;
  checklist_completed: boolean;
  customer_signature: string | null;
  repair_notes: string | null;
}

type AdminRole = "super_admin" | "dispatcher" | "support";
type DashboardTab = "bookings" | "live_map" | "analytics" | "technicians" | "inventory" | "complaints" | "refunds" | "pricing" | "audit_logs";

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Role State
  const [adminRole, setAdminRole] = useState<AdminRole>("super_admin");
  const [activeTab, setActiveTab] = useState<DashboardTab>("bookings");

  // Core Data Lists
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pricingFactors, setPricingFactors] = useState<PricingFactor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch Loaders
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [newTech, setNewTech] = useState({ name: "", phone: "", rating: "4.9" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "10" });
  const [newInventory, setNewInventory] = useState({ name: "", stock: "10", price: "200", desc: "" });
  const [activeMapBooking, setActiveMapBooking] = useState<Booking | null>(null);
  const [refundProcessingId, setRefundProcessingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check role-based tab restrictions and redirect if needed
  useEffect(() => {
    if (adminRole === "dispatcher" && !["bookings", "live_map", "technicians"].includes(activeTab)) {
      setActiveTab("bookings");
    } else if (adminRole === "support" && !["bookings", "complaints", "refunds"].includes(activeTab)) {
      setActiveTab("bookings");
    }
  }, [adminRole]);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const fetchAllData = () => {
    fetchBookings();
    fetchTechnicians();
    fetchCoupons();
    fetchInventory();
    fetchComplaints();
    fetchPricingFactors();
    fetchAuditLogs();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setBookings([]);
    setSelectedBooking(null);
  };

  // API fetches
  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/bookings?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {}
    setLoading(false);
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTechnicians(await res.json());
    } catch (err) {}
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCoupons(await res.json());
    } catch (err) {}
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setInventory(await res.json());
    } catch (err) {}
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setComplaints(await res.json());
    } catch (err) {}
  };

  const fetchPricingFactors = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/pricing-factors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPricingFactors(await res.json());
    } catch (err) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {}
  };

  // Mutators
  const handleUpdateStatus = async (bookingId: number, status: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/status?status=${status}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
        fetchAuditLogs();
      }
    } catch (err) {}
    setUpdatingId(null);
  };

  const handleTogglePayment = async (bookingId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/payment?payment_status=${nextStatus}`, {
        method: "PUT"
      });
      if (res.ok) {
        fetchBookings();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleAssignTechnician = async (bookingId: number, technicianId: string) => {
    if (!technicianId) return;
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/assign?technician_id=${technicianId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_URL}/admin/technicians?name=${encodeURIComponent(newTech.name)}&phone=${encodeURIComponent(newTech.phone)}&rating=${newTech.rating}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setNewTech({ name: "", phone: "", rating: "4.9" });
        fetchTechnicians();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_URL}/admin/coupons?code=${encodeURIComponent(newCoupon.code)}&discount_percent=${newCoupon.discount}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setNewCoupon({ code: "", discount: "10" });
        fetchCoupons();
        fetchAuditLogs();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to create coupon");
      }
    } catch (err) {}
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_URL}/admin/inventory?name=${encodeURIComponent(newInventory.name)}&stock_level=${newInventory.stock}&unit_price=${newInventory.price}&description=${encodeURIComponent(newInventory.desc)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        setNewInventory({ name: "", stock: "10", price: "200", desc: "" });
        fetchInventory();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleUpdateStock = async (itemId: number, nextStock: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/inventory/${itemId}?stock_level=${nextStock}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchInventory();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleResolveComplaint = async (complaintId: number, nextStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/complaints/${complaintId}/status?status=${nextStatus}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchComplaints();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleApproveRefund = async (bookingId: number) => {
    setRefundProcessingId(bookingId);
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}/payment?payment_status=refunded`, {
          method: "PUT"
        });
        if (res.ok) {
          fetchBookings();
          fetchAuditLogs();
        }
      } catch (err) {}
      setRefundProcessingId(null);
    }, 1800);
  };

  const handleUpdatePricing = async (factorId: number, multiplier: number, flat: number, active: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/pricing-factors/${factorId}?multiplier=${multiplier}&flat_fee=${flat}&is_active=${active}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPricingFactors();
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Delete booking permanently?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
        fetchAuditLogs();
        setSelectedBooking(null);
      }
    } catch (err) {}
  };

  // Mappers and Helpers
  const filteredBookings = bookings.filter((b) => {
    const statusMatch = filterStatus === "all" || b.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchTerm.toLowerCase();
    const textMatch =
      b.name.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      b.service.toLowerCase().includes(query) ||
      b.address.toLowerCase().includes(query);
    return statusMatch && textMatch;
  });

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (normalized === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Clock className="w-3 h-3 animate-pulse" /> Confirmed
        </span>
      );
    }
    if (normalized === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
        <AlertTriangle className="w-3 h-3" /> Pending
      </span>
    );
  };

  // Get GPS map position based on addresses
  const getMapPosition = (address: string) => {
    const text = address.toLowerCase();
    if (text.includes("35")) return { name: "Sector 35, Chd", x: 75, y: 35, color: "bg-blue-500" };
    if (text.includes("22")) return { name: "Sector 22, Chd", x: 70, y: 25, color: "bg-cyan-500" };
    if (text.includes("15")) return { name: "Sector 15, Chd", x: 60, y: 15, color: "bg-indigo-500" };
    if (text.includes("70")) return { name: "Sector 70, Mohali", x: 25, y: 70, color: "bg-amber-500" };
    if (text.includes("62")) return { name: "Sector 62, Mohali", x: 35, y: 60, color: "bg-orange-500" };
    if (text.includes("3b2") || text.includes("phase 3")) return { name: "Phase 3B2, Mohali", x: 45, y: 50, color: "bg-emerald-500" };
    
    // Fallback based on text hash
    const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { name: "Sectors Boundary", x: 40 + (hash % 30), y: 30 + (hash % 40), color: "bg-slate-500" };
  };

  // Booking stats
  const estimatedRevenue = bookings
    .filter((b) => b.status === "completed" && b.payment_status === "paid")
    .reduce((sum, b) => sum + b.price, 0);

  const pendingRefunds = bookings.filter((b) => b.status === "cancelled" && b.payment_status === "paid");
  
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const highlightKeyword = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/30 text-yellow-250 rounded px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleCopyDetails = (b: Booking) => {
    const details = `Booking ID: #${b.id}\nCustomer: ${b.name}\nPhone: ${b.phone}\nService: ${b.service}\nAddress: ${b.address}\nPrice: ₹${b.price}\nPayment: ${b.payment_status}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans relative overflow-hidden p-4">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 sm:p-8 space-y-6 text-left shadow-[0_0_50px_rgba(37,99,235,0.08)] relative z-10"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto shadow-inner relative group">
              <span className="absolute inset-0 rounded-2xl bg-blue-500/5 animate-ping" />
              <ShieldCheck className="w-6 h-6 text-blue-400 z-10" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase font-sans">CoolAir Control Desk</h2>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-1">Operator Auth Gate</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
              Enter secure authorization credentials to manage bookings, dispatches, and diagnostics.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 text-rose-400 text-[10px] font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Operator Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-xs text-white outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Access Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-xs text-white outline-none transition-all placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 active:scale-98"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing Key...</span>
                </>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>
          </form>

          {/* Symmetrical footer return option */}
          <div className="border-t border-slate-850 pt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Return to Website Home
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="bg-slate-900/30 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Layers className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">AC Service</span>
              <span className="text-[10px] block text-blue-400 font-bold tracking-widest uppercase mt-0.5">Control Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role dropdown selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider hidden sm:inline">Permission Role:</span>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as AdminRole)}
                className="bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-blue-400 px-3 py-1.5 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="super_admin">⚙️ Super Admin</option>
                <option value="dispatcher">📡 Dispatcher</option>
                <option value="support">🎧 Support Agent</option>
              </select>
            </div>

            <a
              href="/"
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              Go to Website
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        
        {/* Navigation Tabs (Filtered by Role permissions) */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-900 w-fit">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
              activeTab === "bookings" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            Bookings
          </button>
          {["super_admin", "dispatcher"].includes(adminRole) && (
            <button
              onClick={() => setActiveTab("live_map")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "live_map" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Live Map
            </button>
          )}
          {adminRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "analytics" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Analytics
            </button>
          )}
          {["super_admin", "dispatcher"].includes(adminRole) && (
            <button
              onClick={() => setActiveTab("technicians")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "technicians" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Technicians
            </button>
          )}
          {adminRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "inventory" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Inventory
            </button>
          )}
          {["super_admin", "support"].includes(adminRole) && (
            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "complaints" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Complaints ({complaints.filter(c => c.status !== "resolved").length})
            </button>
          )}
          {["super_admin", "support"].includes(adminRole) && (
            <button
              onClick={() => setActiveTab("refunds")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "refunds" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Refunds ({pendingRefunds.length})
            </button>
          )}
          {adminRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "pricing" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Pricing Rules
            </button>
          )}
          {adminRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("audit_logs")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === "audit_logs" ? "bg-blue-600 text-white" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Audit Logs
            </button>
          )}
        </div>

        {/* Tab 1: Bookings List */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Filter and Table Section */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl text-left">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 pb-6 border-b border-slate-800/80">
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl w-full md:w-auto border border-slate-900">
                  {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-450 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-grow-0">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, phone, address..."
                      className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={fetchBookings}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {loading && bookings.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-sm">Loading service bookings...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-20 text-center text-slate-500 border border-dashed border-slate-850 rounded-2xl space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-slate-655" />
                  <p className="font-bold text-slate-450 text-sm">No bookings found</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Bookings List */}
                  <div className="lg:col-span-8 space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {filteredBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          onClick={() => setSelectedBooking(booking)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            selectedBooking?.id === booking.id
                              ? "bg-slate-900 border-blue-500/40 ring-1 ring-blue-500/20"
                              : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-850"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-extrabold text-white text-sm leading-snug">
                                {highlightKeyword(booking.name, searchTerm)}
                              </h3>
                              <span className="text-slate-550 text-[9px] mt-0.5 block font-bold">
                                Booked: {new Date(booking.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${
                                booking.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {booking.payment_status.toUpperCase()}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-350 mt-3 border-t border-slate-900 pt-2.5">
                            <div className="flex items-center gap-2 text-slate-450 font-semibold">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{highlightKeyword(booking.phone, searchTerm)}</span>
                            </div>
                            <div className="font-extrabold text-blue-400 text-right capitalize">
                              {highlightKeyword(booking.service, searchTerm)}
                            </div>
                            <div className="col-span-2 flex items-start gap-2 text-slate-450 text-[11px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{highlightKeyword(booking.address, searchTerm)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Booking Details Sidebar */}
                  <div className="lg:col-span-4">
                    {selectedBooking ? (
                      <motion.div
                        key={selectedBooking.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-905 border border-slate-800 rounded-3xl p-5 space-y-4 sticky top-24 shadow-xl text-left"
                      >
                        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="text-base font-black text-white">Booking Details</h3>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">ID: #{selectedBooking.id}</span>
                          </div>
                          {getStatusBadge(selectedBooking.status)}
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Customer Name</span>
                            <span className="text-white font-extrabold text-xs block">{selectedBooking.name}</span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Contact Phone</span>
                            <a
                              href={`tel:${selectedBooking.phone}`}
                              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg w-fit transition-all text-[11px]"
                            >
                              <Phone className="w-3 h-3" /> {selectedBooking.phone}
                            </a>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Payment / Price Info</span>
                            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                              <span className="text-white font-extrabold text-xs">₹{selectedBooking.price} ({selectedBooking.payment_status.toUpperCase()})</span>
                              {["super_admin", "support"].includes(adminRole) && (
                                <button
                                  onClick={() => handleTogglePayment(selectedBooking.id, selectedBooking.payment_status)}
                                  className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold rounded-lg text-[9px] transition-all cursor-pointer"
                                >
                                  Toggle
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Assigned Technician</span>
                            <div className="flex flex-col gap-2">
                              {selectedBooking.technician ? (
                                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs">
                                  <div>
                                    <p className="text-white font-extrabold text-[11px]">{selectedBooking.technician.name}</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{selectedBooking.technician.phone}</p>
                                  </div>
                                  <span className="text-[9px] text-amber-500 font-bold">⭐ {selectedBooking.technician.rating}</span>
                                </div>
                              ) : (
                                <p className="text-amber-500 text-[10px] font-bold italic">No technician assigned yet.</p>
                              )}

                              {["super_admin", "dispatcher"].includes(adminRole) && (
                                <select
                                  value={selectedBooking.technician_id || ""}
                                  onChange={(e) => handleAssignTechnician(selectedBooking.id, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-white focus:border-blue-500 outline-none cursor-pointer"
                                >
                                  <option value="">Assign / Match Technician...</option>
                                  {technicians.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({t.status})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Service Address</span>
                            <span className="text-slate-350 font-semibold block leading-relaxed text-[11px]">{selectedBooking.address}</span>
                          </div>

                          {selectedBooking.status === "completed" && (
                            <div className="space-y-3 pt-3 border-t border-slate-800">
                              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Service Verification</span>
                              
                              {/* Repair Notes */}
                              {selectedBooking.repair_notes && (
                                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-350 leading-relaxed">
                                  <strong className="text-white block uppercase text-[8px] tracking-wider mb-1">Technician Repair Notes:</strong>
                                  {selectedBooking.repair_notes}
                                </div>
                              )}

                              {/* Before/After Photos */}
                              <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-bold text-slate-400">
                                <div className="space-y-1">
                                  <span className="block text-slate-500 uppercase text-[8px]">Before Job</span>
                                  {selectedBooking.before_photo ? (
                                    <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-900">
                                      <img src={selectedBooking.before_photo} className="w-full h-full object-cover" alt="Before" />
                                    </div>
                                  ) : (
                                    <div className="py-2.5 bg-slate-950 border border-slate-900 rounded-lg text-slate-600 italic">No photo</div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="block text-slate-500 uppercase text-[8px]">After Job</span>
                                  {selectedBooking.after_photo ? (
                                    <div className="relative aspect-video bg-slate-955 rounded-lg overflow-hidden border border-slate-900">
                                      <img src={selectedBooking.after_photo} className="w-full h-full object-cover" alt="After" />
                                    </div>
                                  ) : (
                                    <div className="py-2.5 bg-slate-950 border border-slate-900 rounded-lg text-slate-600 italic">No photo</div>
                                  )}
                                </div>
                              </div>

                              {/* Customer Signature Verification */}
                              {selectedBooking.customer_signature && (
                                <div className="bg-slate-950 p-2 border border-slate-900 rounded-xl flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500 font-bold uppercase text-[8px]">Customer Sign:</span>
                                  <span className="text-emerald-400 font-bold">✔️ Verified Digital Signature</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-4 border-t border-slate-800 space-y-3">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest font-sans">Actions</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {selectedBooking.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all cursor-pointer text-[10px]"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 font-bold rounded-lg transition-all cursor-pointer text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {selectedBooking.status === "confirmed" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer text-[10px]"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 font-bold rounded-lg transition-all cursor-pointer text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopyDetails(selectedBooking)}
                                className={`flex-grow py-2.5 border font-bold rounded-lg transition-all flex items-center justify-center gap-1 text-[10px] cursor-pointer ${
                                  copied
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-350"
                                }`}
                              >
                                <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy details"}
                              </button>

                              {adminRole === "super_admin" && (
                                <button
                                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                                  className="px-3 py-2.5 bg-slate-950 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="border border-dashed border-slate-850 rounded-3xl p-5 text-center text-slate-500 py-16 bg-slate-900/10">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        <span className="text-[11px]">Select a booking from the list to view details and manage dispatching.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: SVG Live Bookings Map */}
        {activeTab === "live_map" && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl text-left space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-500" /> Sector-wise Live Booking Board
              </h3>
              <p className="text-xs text-slate-500 mt-1">Simulated GPS grid detailing booking sectors and coordinate alignments across Chandigarh and Mohali.</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 items-stretch">
              {/* The Map Screen (3 cols) */}
              <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl min-h-[420px] relative overflow-hidden p-4 shadow-inner">
                {/* SVG Coordinate Grids */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-35" />

                {/* City Boundary Lines */}
                <div className="absolute top-[48%] left-0 right-0 border-t border-dashed border-blue-500/20 z-0 flex items-center justify-center">
                  <span className="bg-slate-950 px-3 text-[9px] text-blue-500/40 uppercase tracking-widest font-black font-sans">Chandigarh &harr; Mohali Border</span>
                </div>

                {/* Plot Pins */}
                {bookings.filter(b => b.status !== "cancelled").map((b) => {
                  const pos = getMapPosition(b.address);
                  return (
                    <button
                      key={b.id}
                      onClick={() => setActiveMapBooking(b)}
                      className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer hover:scale-125 z-10 shadow-md ${pos.color} flex items-center justify-center`}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      title={`${b.name} (${b.service})`}
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </button>
                  );
                })}

                <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-xl p-3 text-[10px] space-y-1.5 text-slate-400">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Chandigarh Sectors</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mohali Sectors</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Surge / High Demand</div>
                </div>
              </div>

              {/* Pin Details panel (1 col) */}
              <div className="lg:col-span-1 flex flex-col justify-between">
                {activeMapBooking ? (
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Map Pin Info</span>
                        <button onClick={() => setActiveMapBooking(null)} className="text-slate-650 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">{activeMapBooking.name}</h4>
                      <p className="text-[11px] text-blue-400 font-bold">{activeMapBooking.service}</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed"><strong className="text-slate-300">Address:</strong> {activeMapBooking.address}</p>
                      <p className="text-[10px] text-slate-450"><strong className="text-slate-300">Status:</strong> <span className="capitalize">{activeMapBooking.status}</span></p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBooking(activeMapBooking);
                        setActiveTab("bookings");
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer text-center"
                    >
                      Dispatch Operations
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-850 rounded-2xl p-6 text-center text-slate-500 h-full flex items-center justify-center">
                    <span className="text-xs">Click on any map pin to display active customer details and slot coordinates.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Analytics dashboard (Revenue, Customer, City-wise, Marketing) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {[
                { label: "Gross revenue", value: `₹${estimatedRevenue}`, change: "+15% vs last month", icon: <Coins className="text-teal-400" /> },
                { label: "Completed jobs", value: completedCount, change: "+24% vs last month", icon: <CheckCircle className="text-emerald-400" /> },
                { label: "Active coupons", value: coupons.length, change: "Seeded valid codes", icon: <Tag className="text-blue-400" /> },
                { label: "Raised complaints", value: complaints.length, change: `${complaints.filter(c=>c.status!=="resolved").length} open tickets`, icon: <AlertCircle className="text-rose-450" /> }
              ].map((card, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-md">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{card.label}</span>
                    <div className="p-1.5 bg-slate-950 border border-slate-850 rounded-xl">{card.icon}</div>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-white">{card.value}</span>
                    <span className="text-[10px] text-emerald-500 font-bold block mt-1">{card.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom SVG Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6 text-left">
              {/* Daily revenue bar chart */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <h4 className="text-sm font-extrabold text-white mb-4">Earnings History (Past 7 Days)</h4>
                
                {/* SVG Graph */}
                <div className="h-60 flex items-end justify-between gap-3 pt-6 px-4 bg-slate-950/60 border border-slate-850 rounded-2xl relative shadow-inner">
                  {/* Grid Lines */}
                  <div className="absolute top-1/4 left-0 right-0 border-t border-slate-850/60" />
                  <div className="absolute top-2/4 left-0 right-0 border-t border-slate-850/60" />
                  <div className="absolute top-3/4 left-0 right-0 border-t border-slate-850/60" />

                  {[
                    { day: "Mon", rev: 3200 },
                    { day: "Tue", rev: 4900 },
                    { day: "Wed", rev: 7100 },
                    { day: "Thu", rev: 5500 },
                    { day: "Fri", rev: 9200 },
                    { day: "Sat", rev: 11500 },
                    { day: "Sun", rev: 12900 }
                  ].map((d, idx) => {
                    const maxVal = 14000;
                    const heightPercent = Math.round((d.rev / maxVal) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10">
                        <span className="text-[8px] text-blue-400 font-bold">₹{d.rev}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.05 }}
                          className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg"
                          style={{ minHeight: "15px" }}
                        />
                        <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* City share Pie Chart and Customer Retention */}
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <h4 className="text-sm font-extrabold text-white mb-4">City Sales Distribution</h4>

                {/* Pie Chart Representation using SVG */}
                <div className="flex flex-col items-center justify-center space-y-6 py-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {/* Grey Circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="4.2" />
                      {/* Blue Circle (Mohali - 60% share) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="4.5"
                        strokeDasharray="60 40"
                        strokeDashoffset="0"
                      />
                      {/* Emerald Circle (Chandigarh - 40% share) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4.5"
                        strokeDasharray="40 60"
                        strokeDashoffset="-60"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-base font-black text-white">₹{estimatedRevenue}</span>
                      <span className="text-[8px] text-slate-500 block font-bold uppercase mt-0.5">Total Sales</span>
                    </div>
                  </div>

                  <div className="flex gap-6 text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Mohali (60%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Chandigarh (40%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Coupon Analytics */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl text-left space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-500" /> Marketing & Discount Performance
              </h4>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { code: "WELCOME10", usages: 8, saved: "₹2,400", conversion: "32% CTR" },
                  { code: "COOLAIR20", usages: 14, saved: "₹5,600", conversion: "56% CTR" },
                  { code: "FESTIVE30", usages: 3, saved: "₹1,850", conversion: "12% CTR" }
                ].map((cp, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 border border-slate-900 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <span className="font-black text-white uppercase tracking-widest">{cp.code}</span>
                      <p className="text-[10px] text-slate-500">Usages: {cp.usages} times</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-emerald-400 font-extrabold">{cp.saved} Saved</span>
                      <span className="text-[9px] text-slate-550 block font-bold">{cp.conversion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Technicians Scorecards */}
        {activeTab === "technicians" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Technician List & Scorecards */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" /> Technician Dispatch & Performance Scorecards
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {technicians.map((t) => {
                  // Calculate tech metrics
                  const techBookings = bookings.filter(b => b.technician_id === t.id);
                  const completed = techBookings.filter(b => b.status === "completed").length;
                  const rev = techBookings.filter(b => b.status === "completed" && b.payment_status === "paid").reduce((sum, b) => sum + b.price, 0);
                  
                  return (
                    <div key={t.id} className="bg-slate-950 p-5 border border-slate-900 rounded-2xl space-y-4 flex flex-col justify-between text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 overflow-hidden">
                          {t.avatar ? (
                            <img src={t.avatar} className="w-full h-full object-cover" alt={t.name} />
                          ) : (
                            <span className="font-extrabold text-blue-450 text-sm">{t.name.split(" ").map(n => n[0]).join("")}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-extrabold text-sm">{t.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{t.phone}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-900 py-3 text-[10px] text-slate-400">
                        <div>
                          <span className="block font-bold">Jobs Done</span>
                          <span className="text-sm font-black text-white mt-0.5 block">{completed} completed</span>
                        </div>
                        <div>
                          <span className="block font-bold">Rev Generated</span>
                          <span className="text-sm font-black text-teal-400 mt-0.5 block">₹{rev}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.status === "available" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-amber-500 font-extrabold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500" /> {t.rating} Rating
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Technician Form */}
            {adminRole === "super_admin" && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left">
                <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" /> Add Dispatcher Technician
                </h3>
                
                <form onSubmit={handleCreateTechnician} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newTech.name}
                      onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                      placeholder="e.g. Gurpreet Singh"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newTech.phone}
                      onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      required
                      value={newTech.rating}
                      onChange={(e) => setNewTech({ ...newTech, rating: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Add Technician Pro
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Inventory Stock Management */}
        {activeTab === "inventory" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Inventory List */}
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> HVAC Inventory Spare Parts
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {inventory.map((item) => {
                  const isLowStock = item.stock_level < 10;
                  const isOut = item.stock_level === 0;
                  
                  return (
                    <div key={item.id} className="bg-slate-950 p-5 border border-slate-900 rounded-2xl space-y-4 flex flex-col justify-between text-left relative overflow-hidden">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
                          <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-white font-extrabold text-sm">{item.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Price: ₹{item.unit_price} / unit</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          isOut ? "bg-rose-500/10 text-rose-400" : isLowStock ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {isOut ? "OUT OF STOCK" : isLowStock ? `LOW STOCK: ${item.stock_level} left` : `IN STOCK: ${item.stock_level} units`}
                        </span>

                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateStock(item.id, Math.max(0, item.stock_level - 1))}
                            className="w-6 h-6 hover:bg-slate-800 rounded-md font-bold text-white cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-black text-white text-[11px]">{item.stock_level}</span>
                          <button
                            onClick={() => handleUpdateStock(item.id, item.stock_level + 1)}
                            className="w-6 h-6 hover:bg-slate-800 rounded-md font-bold text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Inventory Form */}
            <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left">
              <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-500" /> Register Spare Part
              </h3>
              
              <form onSubmit={handleCreateInventory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Part Name</label>
                  <input
                    type="text"
                    required
                    value={newInventory.name}
                    onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
                    placeholder="e.g. Copper Pipe"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={newInventory.stock}
                      onChange={(e) => setNewInventory({ ...newInventory, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={newInventory.price}
                      onChange={(e) => setNewInventory({ ...newInventory, price: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 mt-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add Spare Item
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 6: Complaints Management */}
        {activeTab === "complaints" && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> Customer Support Complaint Tickets ({complaints.length})
              </h3>
              <p className="text-xs text-slate-500 mt-1">Review issues filed by customers, trace booking coordinates, assign inspectors, and close tickets.</p>
            </div>

            {complaints.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <CheckCircle className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="font-bold text-slate-400">All clean! No complaints raised.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {complaints.map((c) => (
                  <div key={c.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-600/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                          Complaint ID: #{c.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Booking: #{c.booking_id}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          c.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : c.status === "in_progress" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-450"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-350 leading-relaxed italic">"{c.description}"</p>
                    </div>

                    <div className="flex gap-2">
                      {c.status === "open" && (
                        <button
                          onClick={() => handleResolveComplaint(c.id, "in_progress")}
                          className="px-3.5 py-2 bg-blue-650 hover:bg-blue-600 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-sm"
                        >
                          Inspect Issue
                        </button>
                      )}
                      {c.status === "in_progress" && (
                        <button
                          onClick={() => handleResolveComplaint(c.id, "resolved")}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-sm"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {c.status === "resolved" && (
                        <span className="text-slate-500 text-[10px] font-bold italic">Resolved & Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Refund Approvals */}
        {activeTab === "refunds" && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-500" /> Cancelled Orders Refund Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-1">Review orders that were paid online but subsequently cancelled. Trigger simulated gateway refund operations.</p>
            </div>

            {pendingRefunds.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <CheckCircle className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="font-bold text-slate-400">All refunds settled! No pending payouts.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {pendingRefunds.map((refund) => (
                  <div key={refund.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white text-sm">Booking ID: #{refund.id}</h4>
                      <p className="text-[10px] text-slate-500">Customer: {refund.name} ({refund.phone})</p>
                      <p className="text-[10px] text-slate-550 font-bold">Paid Settle Value: ₹{refund.price}</p>
                    </div>

                    <button
                      onClick={() => handleApproveRefund(refund.id)}
                      disabled={refundProcessingId === refund.id}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {refundProcessingId === refund.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Issuing Settle Refund...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Approve Refund
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Dynamic Pricing Config */}
        {activeTab === "pricing" && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-500" /> Dynamic Pricing Surge Configs
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configure peak summer multipliers or weekend flat surcharges that dynamically sync with client-side checkout costs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingFactors.map((factor) => (
                <div key={factor.id} className="bg-slate-950 p-5 border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-extrabold text-white text-xs block">{factor.name}</span>
                    <input
                      type="checkbox"
                      checked={factor.is_active}
                      onChange={(e) => handleUpdatePricing(factor.id, factor.multiplier, factor.flat_fee, e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-800 bg-slate-950 outline-none focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-550 block font-bold">Multiplier Surcharge (e.g. 1.15)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        value={factor.multiplier}
                        onChange={(e) => handleUpdatePricing(factor.id, parseFloat(e.target.value) || 1.0, factor.flat_fee, factor.is_active)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-550 block font-bold">Flat Dispatch Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={factor.flat_fee}
                        onChange={(e) => handleUpdatePricing(factor.id, factor.multiplier, parseInt(e.target.value) || 0, factor.is_active)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-white text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: Audit Logs */}
        {activeTab === "audit_logs" && (
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Dashboard Audit Trail Logs
              </h3>
              <p className="text-xs text-slate-500 mt-1">Audit log records of admin status changes, dynamic pricing changes, complaints resolution, and stock adjustments.</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto pr-1 text-xs">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-950/90 text-slate-450 border-b border-slate-900 uppercase text-[9px] tracking-wider font-extrabold">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Operator User</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Action Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-900/60 hover:bg-slate-900/10 text-slate-350">
                        <td className="p-4 font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            day: "numeric",
                            month: "short"
                          })}
                        </td>
                        <td className="p-4 font-extrabold text-white">{log.user}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.role === "Super Admin" ? "bg-blue-500/10 text-blue-400" : log.role === "Dispatcher" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] leading-relaxed">{log.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Expert AC Repair Services Admin Portal. Secure Session.
      </footer>
    </div>
  );
}