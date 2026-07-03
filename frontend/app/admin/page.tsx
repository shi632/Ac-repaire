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
  MessageSquare,
  Copy,
  ExternalLink,
  Coins,
  ArrowRight,
  Loader2
} from "lucide-react";

interface Booking {
  id: number;
  name: string;
  phone: string;
  service: string;
  address: string;
  message: string | null;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
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

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/bookings?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }

      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    if (!token) return;
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/status?status=${status}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
    } catch (err: any) {
      alert(err.message || "Error updating booking status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this booking record?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Error deleting booking");
    }
  };

  const handleCopyDetails = (booking: Booking) => {
    const text = `Name: ${booking.name}\nPhone: ${booking.phone}\nService: ${booking.service}\nAddress: ${booking.address}\nProblem Description: ${booking.message || "None"}\nStatus: ${booking.status}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics calculations
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  // Revenue estimation
  // e.g. Rs 1500 per completed booking, Rs 1000 per confirmed booking
  const estimatedRevenue = (completedCount * 1500) + (confirmedCount * 1000);

  // Demand breakdown
  const categoryCounts = bookings.reduce((acc: { [key: string]: number }, cur) => {
    acc[cur.service] = (acc[cur.service] || 0) + 1;
    return acc;
  }, {});

  // Filter & Search logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const highlightKeyword = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-blue-500 text-white rounded px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
        {/* Modern blur effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[32px] p-10 shadow-2xl relative z-10 space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 text-white border border-blue-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Secure sign in to manage service bookings</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background blobs */}
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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-slate-900 border border-slate-800 text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-400" /> Logged as admin
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Orders", value: totalCount, icon: <Layers className="text-blue-400" />, bg: "bg-blue-500/5 border-blue-500/10" },
            { label: "Pending", value: pendingCount, icon: <Clock className="text-amber-400" />, bg: "bg-amber-500/5 border-amber-500/10" },
            { label: "Confirmed", value: confirmedCount, icon: <Calendar className="text-sky-400" />, bg: "bg-sky-500/5 border-sky-500/10" },
            { label: "Completed", value: completedCount, icon: <CheckCircle className="text-emerald-400" />, bg: "bg-emerald-500/5 border-emerald-500/10" },
            { label: "Cancelled", value: cancelledCount, icon: <XCircle className="text-rose-400" />, bg: "bg-rose-500/5 border-rose-500/10" },
            { label: "Est. Revenue", value: `₹${estimatedRevenue}`, icon: <Coins className="text-teal-400" />, bg: "bg-teal-500/5 border-teal-500/10", highlight: true },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border ${stat.bg} flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg">{stat.icon}</div>
              </div>
              <span className={`text-2xl font-black mt-1 ${stat.highlight ? 'text-teal-400' : 'text-white'}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Analytics & Breakdown row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Bars (Left 2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Service Category Demand
            </h3>

            {totalCount === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">No service data loaded to compute metrics.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryCounts).map(([cat, val], idx) => {
                  const percentage = Math.round((val / totalCount) * 100);
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300 capitalize">{cat}</span>
                        <span className="text-blue-400">{val} jobs ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Notice card (Right 1 col) */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Pending Action Alert
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              There are currently <strong className="text-amber-400 font-bold">{pendingCount} booking requests</strong> waiting for dispatch validation. Please confirm slot coordinates before matching technicians.
            </p>
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 flex justify-between items-center text-xs">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-bold text-teal-400">SQLite Connected</span>
            </div>
          </div>
        </div>

        {/* Filter and Table Section */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 pb-6 border-b border-slate-800/80">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl w-full md:w-auto border border-slate-900">
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input and Refresh */}
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
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                title="Refresh Bookings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Bookings View Area */}
          {loading && bookings.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm">Loading service bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-2xl space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-bold text-slate-400 text-sm">No bookings found</p>
              <p className="text-xs text-slate-500 mt-1">Try tweaking your search keywords or filters.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Bookings List (Left 7 cols) */}
              <div className="lg:col-span-8 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        selectedBooking?.id === booking.id
                          ? "bg-slate-900 border-blue-500/40 ring-1 ring-blue-500/20"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-800"
                      }`}
                    >
                      {updatingId === booking.id && (
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-10">
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-snug">
                            {highlightKeyword(booking.name, searchTerm)}
                          </h3>
                          <span className="text-slate-500 text-[10px] mt-1 block font-bold">
                            Requested: {new Date(booking.created_at).toLocaleString()}
                          </span>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-300 mt-4 border-t border-slate-900 pt-3">
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{highlightKeyword(booking.phone, searchTerm)}</span>
                        </div>
                        <div className="font-extrabold text-blue-400 text-right capitalize">
                          {highlightKeyword(booking.service, searchTerm)}
                        </div>
                        <div className="col-span-2 flex items-start gap-2 mt-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{highlightKeyword(booking.address, searchTerm)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Booking Details Sidebar (Right 5 cols) */}
              <div className="lg:col-span-4">
                {selectedBooking ? (
                  <motion.div
                    key={selectedBooking.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 sticky top-24 shadow-xl"
                  >
                    <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-white">Booking Details</h3>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">ID: #{selectedBooking.id}</span>
                      </div>
                      {getStatusBadge(selectedBooking.status)}
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Customer Name</span>
                        <span className="text-white font-extrabold text-sm block">{selectedBooking.name}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Contact Phone</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${selectedBooking.phone}`}
                            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" /> {selectedBooking.phone}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Requested Service</span>
                        <span className="text-blue-400 font-bold text-sm block capitalize">{selectedBooking.service}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Service Address</span>
                        <span className="text-slate-300 font-semibold block leading-relaxed">{selectedBooking.address}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBooking.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-400 hover:underline font-bold"
                        >
                          View Map Directions <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {selectedBooking.message && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Customer Message</span>
                          <div className="p-3 bg-slate-950 border border-slate-900 rounded-2xl text-slate-300 italic flex gap-2 leading-relaxed">
                            <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <span>"{selectedBooking.message}"</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-800 space-y-4">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Management Actions</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
                              >
                                Confirm Order
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold rounded-xl transition-all cursor-pointer text-xs"
                              >
                                Cancel Service
                              </button>
                            </>
                          )}

                          {selectedBooking.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
                              >
                                Complete Order
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold rounded-xl transition-all cursor-pointer text-xs"
                              >
                                Cancel Service
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyDetails(selectedBooking)}
                            className={`flex-grow py-3 border font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer ${
                              copied
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-300"
                            }`}
                          >
                            <Copy className="w-3.5 h-3.5" /> {copied ? "Copied Info!" : "Copy Details"}
                          </button>

                          <button
                            onClick={() => handleDeleteBooking(selectedBooking.id)}
                            className="px-4 py-3 bg-slate-950 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer"
                            title="Delete Booking Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-dashed border-slate-850 rounded-3xl p-6 text-center text-slate-500 py-20 bg-slate-900/10">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    <span className="text-xs">Select a booking from the list to view full details and perform actions.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Expert AC Repair Services Admin Portal. Secure Session.
      </footer>
    </div>
  );
}