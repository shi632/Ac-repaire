"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

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

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", service: "", address: "", message: "" });
      } else {
        setErrorMsg(data.error || "Failed to submit booking request. Please check details.");
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
      icon: <MapPin className="w-6 h-6" />,
      title: "Our Workshop",
      details: COMPANY_CONFIG.address,
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Direct",
      details: COMPANY_CONFIG.phone,
      link: `tel:${COMPANY_CONFIG.phoneRaw}`,
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      details: COMPANY_CONFIG.email,
      link: `mailto:${COMPANY_CONFIG.email}`,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Working Hours",
      details: COMPANY_CONFIG.workingHours,
    },
  ];

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="text-blue-600 font-bold text-sm uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full">
            Book Doorstep Service
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Schedule an <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AC Technician</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Fill out the request form below, and our certified repair team will contact you within 30 minutes to confirm your slot.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Contact Info & Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-between space-y-8"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:bg-blue-50/40 hover:border-blue-100 transition-all duration-300 group"
                >
                  <div className="text-blue-600 mb-4 bg-white shadow-sm border border-slate-100 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">{info.icon}</div>
                  <h3 className="font-extrabold text-slate-900 mb-1 text-base">{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
                      {info.details}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{info.details}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Google Map Integration */}
            <div className="bg-slate-50 border border-slate-150 rounded-3xl overflow-hidden h-72 relative shadow-inner">
              <iframe
                title="Service Area Map"
                src={COMPANY_CONFIG.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Booking Request Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-full"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center h-full flex flex-col items-center justify-center shadow-lg"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-emerald-600">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Booking Requested!</h3>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for booking with CoolAir. Our dispatch desk is assigning a certified technician. We will call you shortly on your number to finalize the schedule.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  Submit Another Booking
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-[32px] p-8 sm:p-10 shadow-lg flex flex-col justify-between h-full">
                <div className="space-y-5">
                  <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 mb-2">Request Service</h3>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-rose-700 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900"
                        placeholder="Enter 10-digit mobile"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900"
                        placeholder="name@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Service Needed *
                      </label>
                      <select
                        required
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900 cursor-pointer"
                      >
                        <option value="">Select a service</option>
                        <option value="AC Repair Service">AC Repair Service</option>
                        <option value="AC Installation">AC Installation</option>
                        <option value="AC Maintenance">AC Maintenance</option>
                        <option value="AC Gas Filling">AC Gas Filling</option>
                        <option value="AC Uninstallation">AC Uninstallation Service</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Doorstep Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900 resize-none"
                      placeholder="Enter full flat no, building name, and sector details"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Describe Problem (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm text-slate-900 resize-none"
                      placeholder="e.g. AC is leaking water / blowing warm air / making clicking noise..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Booking Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Book AC Technician Now</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}