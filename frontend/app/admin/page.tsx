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
  MessageSquare
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    // Check for saved token on client mount
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

  // Metrics calculations
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-900 via-slate-900 to-indigo-950 px-4">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 mt-1.5">Sign in to manage AC repair bookings</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 flex gap-3 text-rose-300 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight">AC Repair</span>
              <span className="text-xs block text-cyan-400 font-semibold tracking-wider uppercase">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-slate-800 text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Logged as admin
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: totalCount, icon: <Layers className="text-cyan-400" />, bg: "bg-cyan-500/5 border-cyan-500/10" },
            { label: "Pending", value: pendingCount, icon: <Clock className="text-amber-400" />, bg: "bg-amber-500/5 border-amber-500/10" },
            { label: "Confirmed", value: confirmedCount, icon: <Calendar className="text-blue-400" />, bg: "bg-blue-500/5 border-blue-500/10" },
            { label: "Completed", value: completedCount, icon: <CheckCircle className="text-emerald-400" />, bg: "bg-emerald-500/5 border-emerald-500/10" },
            { label: "Cancelled", value: cancelledCount, icon: <XCircle className="text-rose-400" />, bg: "bg-rose-500/5 border-rose-500/10" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border ${stat.bg} flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                <div className="p-1.5 bg-slate-900 rounded-lg">{stat.icon}</div>
              </div>
              <span className="text-3xl font-extrabold text-white mt-1">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Filter and Table Section */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 pb-6 border-b border-slate-800/80">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl w-full md:w-auto">
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterStatus === status
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/20"
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
                  placeholder="Search by name, phone..."
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
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
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
              <span>Loading service bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-slate-400">No bookings found</p>
              <p className="text-xs text-slate-500 mt-1">Try tweaking your search keywords or filters.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Bookings List (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedBooking?.id === booking.id
                          ? "bg-slate-900 border-cyan-500/40 ring-1 ring-cyan-500/20"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base leading-snug">{booking.name}</h3>
                          <span className="text-slate-400 text-xs mt-1 block font-medium">
                            Booked: {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-300 mt-4 border-t border-slate-900 pt-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{booking.phone}</span>
                        </div>
                        <div className="font-bold text-cyan-400 text-right capitalize">
                          {booking.service}
                        </div>
                        <div className="col-span-2 flex items-start gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{booking.address}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Booking Details Sidebar (Right 1 col) */}
              <div className="lg:col-span-1">
                {selectedBooking ? (
                  <motion.div
                    key={selectedBooking.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold text-white">Booking Details</h3>
                      {getStatusBadge(selectedBooking.status)}
                    </div>

                    <div className="space-y-5 text-sm">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">Customer Name</span>
                        <span className="text-white font-medium">{selectedBooking.name}</span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">Contact Phone</span>
                        <a
                          href={`tel:${selectedBooking.phone}`}
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1.5"
                        >
                          <Phone className="w-4 h-4" /> {selectedBooking.phone}
                        </a>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">Requested Service</span>
                        <span className="text-cyan-400 font-bold capitalize">{selectedBooking.service}</span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">Service Address</span>
                        <span className="text-slate-300 font-medium block leading-relaxed">{selectedBooking.address}</span>
                      </div>

                      {selectedBooking.message && (
                        <div>
                          <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">Customer Message</span>
                          <div className="p-3 bg-slate-950 rounded-xl text-slate-300 text-xs italic flex gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span>"{selectedBooking.message}"</span>
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-800 space-y-3">
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Management Actions</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                              >
                                Confirm Order
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/30 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                              >
                                Cancel Service
                              </button>
                            </>
                          )}

                          {selectedBooking.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "completed")}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
                              >
                                Complete Order
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/30 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                              >
                                Cancel Service
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteBooking(selectedBooking.id)}
                          className="w-full py-2.5 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Booking Record
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 py-16">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    <span>Select a booking from the list to view full details and perform status actions.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Expert AC Repair Services Admin. Secure dashboard session.
      </footer>
    </div>
  );
}