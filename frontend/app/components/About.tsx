'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Shield, Users, Award, ThumbsUp, Snowflake } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

export default function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const stats = [
    {
      icon: Users,
      value: COMPANY_CONFIG.completedServices,
      label: 'Happy Customers',
    },
    {
      icon: Award,
      value: COMPANY_CONFIG.experienceYears,
      label: 'Years Experience',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Genuine Spares',
    },
    {
      icon: ThumbsUp,
      value: `${COMPANY_CONFIG.rating}/5`,
      label: 'Client Rating',
    },
  ]

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden bg-white py-16 lg:py-24"
    >
      <div className="absolute left-[-10%] top-1/2 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-2xl sm:p-6 lg:p-8">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.12),transparent_50%)]" />

              {/* TOP */}
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                  <Snowflake className="h-7 w-7 text-cyan-400 animate-spin-slow sm:h-8 sm:w-8" />
                </div>

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur sm:text-xs">
                  Trusted Partner
                </span>
              </div>

              {/* CENTER */}
              <div className="relative z-10 py-4 text-center sm:py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 sm:h-20 sm:w-20">
                  <Shield className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                </div>

                <h3 className="text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
                  Full Service Support
                </h3>

                <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                  Mohali & Chandigarh
                </p>
              </div>

              {/* BOTTOM */}
              <p className="relative z-10 text-[10px] text-slate-400 sm:text-xs">
                Established since 2014 • Certified HVAC Technicians
              </p>
            </div>

            {/* Desktop Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 right-6 hidden rounded-3xl border border-blue-500/30 bg-blue-600 p-6 text-white shadow-2xl lg:block"
            >
              <p className="text-4xl font-black">
                {COMPANY_CONFIG.experienceYears}+
              </p>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                Years of Excellence
              </p>
            </motion.div>

            {/* Mobile Badge */}
            <div className="mt-5 block lg:hidden">
              <div className="rounded-2xl bg-blue-600 p-4 text-center text-white shadow-xl">
                <p className="text-3xl font-black">
                  {COMPANY_CONFIG.experienceYears}+
                </p>

                <p className="text-xs uppercase tracking-wider">
                  Years of Excellence
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Award className="h-4 w-4" />
              About Our Company
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Your Trusted Partner for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                All AC Solutions
              </span>
            </h2>

            <p className="text-base leading-8 text-slate-600 sm:text-lg">
              At {COMPANY_CONFIG.name}, we provide top-tier residential and
              commercial air-conditioning services with experienced technicians,
              genuine spare parts, and transparent pricing.
            </p>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              From installation and gas refilling to repair and preventive
              maintenance, we ensure fast response, quality workmanship, and
              complete customer satisfaction.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: 0.4 + index * 0.1,
                  }}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center transition hover:border-blue-100 hover:bg-blue-50"
                >
                  <stat.icon className="mx-auto mb-3 h-7 w-7 text-blue-600" />

                  <h3 className="text-2xl font-black text-slate-900">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}