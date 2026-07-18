"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Phone, Star, MessageSquare, Award } from "lucide-react";

interface Technician {
  id: number;
  name: string;
  phone: string;
  rating: number;
  status: string;
  avatar: string;
}

const API_URL = "";

export default function TechniciansList() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    fetch(`${API_URL}/api/technicians`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTechs(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback static data if backend is offline during render
        setTechs([
          { id: 1, name: "Amit Kumar", phone: "+91 93899 82912", rating: 4.9, status: "available", avatar: "/images/about.png" },
          { id: 2, name: "Sandeep Singh", phone: "+91 98725 43210", rating: 4.8, status: "available", avatar: "/images/about.png" },
          { id: 3, name: "Gurpreet Singh", phone: "+91 88720 12345", rating: 4.9, status: "available", avatar: "/images/about.png" },
          { id: 4, name: "Vikram Jeet", phone: "+91 76960 98765", rating: 4.7, status: "available", avatar: "/images/about.png" }
        ]);
        setLoading(false);
      });
  }, []);

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\s+/g, "");
  };

  return (
    <section id="technicians" className="py-16 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-200/50 dark:border-slate-900/50 relative overflow-hidden" ref={ref}>
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>On-Demand Specialists</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Reach Out Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Expert Technicians</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-555 dark:text-slate-400 leading-relaxed">
            Directly connect with certified, background-verified AC specialists active in your sector.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-500 text-xs gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-650 animate-ping" /> Loading specialist list...
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {techs.map((tech, idx) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Avatar & Availability */}
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/45 rounded-2xl overflow-hidden border border-blue-500/10">
                      <img src={tech.avatar || "/images/about.png"} className="w-full h-full object-cover animate-pulse-slow" alt={tech.name} />
                    </div>
                    
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                      tech.status === "available"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-650 dark:text-amber-500"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${tech.status === "available" ? "bg-emerald-500" : "bg-amber-550"}`} />
                      {tech.status === "available" ? "Available Now" : "Busy on Job"}
                    </span>
                  </div>

                  {/* Profile info */}
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{tech.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">AC Diagnostics & Clean Specialist</p>
                    
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-2 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{tech.rating} Rating</span>
                    </div>
                  </div>
                </div>

                {/* Connect actions */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <a
                    href={`tel:${getCleanPhone(tech.phone)}`}
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm shadow-blue-500/5 text-center"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send/?phone=${getCleanPhone(tech.phone)}&text=Hi%20${encodeURIComponent(tech.name)}%2C%20I%20got%20your%20profile%20from%2520CoolAir.%20Are%20you%20available%20for%20AC%20repair%3F`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
