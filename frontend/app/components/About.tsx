'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Shield, Users, Award, ThumbsUp, Snowflake } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

export default function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  const stats = [
    { icon: Users, value: COMPANY_CONFIG.completedServices, label: 'Happy Customers' },
    { icon: Award, value: COMPANY_CONFIG.experienceYears, label: 'Years Experience' },
    { icon: Shield, value: '100%', label: 'Genuine Spares' },
    { icon: ThumbsUp, value: `${COMPANY_CONFIG.rating}/5`, label: 'Client Rating' },
  ]

  return (
    <section id="about" className="section-padding bg-white relative overflow-hidden" ref={ref}>
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image/Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Visual Box container */}
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-tr from-slate-900 to-slate-800 aspect-[4/3] shadow-2xl p-8 flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]" />
              
              {/* Box Top */}
              <div className="flex justify-between items-start z-10">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-cyan-400">
                  <Snowflake className="w-8 h-8 animate-spin-slow" />
                </div>
                <span className="text-[10px] font-bold px-3 py-1 bg-white/10 text-white rounded-full uppercase tracking-wider backdrop-blur-md border border-white/5">
                  Trusted Partner
                </span>
              </div>

              {/* Box Center */}
              <div className="text-center z-10 my-auto py-6">
                <div className="w-20 h-20 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Full Service Support</h3>
                <p className="text-slate-400 text-xs mt-1">Mohali & Chandigarh</p>
              </div>

              {/* Box Bottom */}
              <div className="text-slate-400 text-[11px] text-balance ">
                Established since 2014 • Certified HVAC Technicians
              </div>
            </div>
            
            {/* Experience Floating Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-6 -right-4 sm:right-6 bg-blue-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-600/25 border border-blue-500/30"
            >
              <p className="text-4xl font-black leading-none">{COMPANY_CONFIG.experienceYears}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-1 opacity-90">Of Excellence</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
              <Award className="w-4 h-4 text-blue-600" />
              <span>About Our Company</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Your Trusted Partner for <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                All AC Solutions
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At {COMPANY_CONFIG.name}, we provide top-tier, reliable residential and commercial air conditioning services. Our fully qualified and verified technicians are dedicated to keeping you comfortable.
            </p>
            
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              With a legacy of professional service, we handle major system installations, rapid leak diagnoses, gas refills, and comprehensive preventive cleanings. We prioritize speed, safety, and transparent pricing.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-5 text-center border border-slate-100 hover:border-blue-100 transition-all duration-300 group"
                >
                  <stat.icon className="w-7 h-7 text-blue-600 mx-auto mb-2.5 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}