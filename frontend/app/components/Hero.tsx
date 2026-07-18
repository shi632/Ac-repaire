'use client'

import { motion } from 'framer-motion'
import { Phone, Calendar, MessageCircle, Star, Clock, MapPin, CheckCircle, ShieldCheck } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

export default function Hero() {
  const whatsappMessage = encodeURIComponent(COMPANY_CONFIG.whatsappMessage)

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Floating Sparkles/Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-cyan-400/20 rounded-full"
            animate={{
              y: [0, -40, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 16}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Content Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-left space-y-6"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-2xl text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>Same Day Service Available</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Premium AC Services <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                At Your Doorstep
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Professional, certified technicians providing reliable repairs, precision installations, and comprehensive maintenance solutions. 100% satisfaction guaranteed.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={`tel:${COMPANY_CONFIG.phoneRaw}`}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-sm"
              >
                <Phone className="w-3 h-3" />
                <span>Call Now</span>
              </a>
              <a
                href="#contact"
                className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-white font-bold rounded-2xl transition-all text-sm"
              >
                <Calendar className="w-3 h-3" />
                <span>Book Service</span>
              </a>
              <a
                href={`https://wa.me/${COMPANY_CONFIG.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-sm"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900 max-w-lg">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-1">
                  {COMPANY_CONFIG.rating} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 inline" />
                </span>
                <span className="text-xs text-slate-400 mt-1">Average Rating</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {COMPANY_CONFIG.completedServices}
                </span>
                <span className="text-xs text-slate-400 mt-1">Jobs Completed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {COMPANY_CONFIG.experienceYears}
                </span>
                <span className="text-xs text-slate-400 mt-1">Years Experience</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            {/* Visual Glass Box */}
            <div className="relative p-8 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl">
              {/* Cool air effect visualization */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 opacity-60" />

              <div className="space-y-6">
                {/* Tech card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Dispatch</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Mohali</span>
                </div>

                {/* Main illustration graphics with Real Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full border border-slate-800/80 mb-6 group">
                  <img
                    src="/images/hero.png"
                    alt="AC Technician Servicing Unit"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                    <p className="font-extrabold text-base text-white">Certified Technicians</p>
                    <p className="text-xs text-slate-300 mt-0.5">Background checked & insured pros</p>
                  </div>
                </div>

                {/* Bottom detail stats */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Response Guarantee</span>
                    <span className="font-bold text-cyan-400">Within 60 Mins</span>
                  </div>
                  <div className="h-px bg-slate-900" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Service Coverage Warranty</span>
                    <span className="font-bold text-teal-400">30-Day Free Cover</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Float badge 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white text-slate-950 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
            >
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div>
                <p className="text-sm font-black leading-none">100% Genuine</p>
                <p className="text-[10px] text-slate-500 mt-0.5">OEM Spare Parts Used</p>
              </div>
            </motion.div>

            {/* Float badge 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white text-slate-950 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100"
            >
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Clock className="w-3 h-3" />
              </div>
              <div>
                <p className="text-sm font-black leading-none">24/7 Support</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Always there to assist</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-16 w-full">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full min-w-[1440px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-white-wave transition-colors duration-500"
          />
        </svg>
      </div>
    </section>
  )
}