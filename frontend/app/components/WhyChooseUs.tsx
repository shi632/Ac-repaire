'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  UserCheck, 
  Zap, 
  BadgeDollarSign, 
  Puzzle, 
  HeadphonesIcon, 
  Truck,
  CheckCircle2
} from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

const benefits = [
  {
    icon: UserCheck,
    title: 'Experienced Technicians',
    description: 'Certified professionals with years of hands-on experience in complex AC diagnostics and repairs.',
  },
  {
    icon: Zap,
    title: 'Same Day Service',
    description: 'Quick response times with same-day emergency slots for sudden cooling breakdowns.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Affordable Pricing',
    description: 'Completely transparent invoicing with zero hidden charges. Top value guaranteed.',
  },
  {
    icon: Puzzle,
    title: 'Genuine Spares',
    description: 'We install only original manufacturer components with full quality testing cycles.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Service Support',
    description: 'Round-the-clock telephone and WhatsApp support lines for troubleshooting assistance.',
  },
  {
    icon: Truck,
    title: 'Doorstep Convenience',
    description: 'Prompt service dispatch scheduled around your preferred hours and location.',
  },
]

export default function WhyChooseUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="why-us" className="section-padding bg-white relative overflow-hidden" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            The <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{COMPANY_CONFIG.brandName}</span> Advantage
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            We deliver exceptional craftsmanship, unmatched speed, and absolute clarity at every step.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group h-full"
            >
              <div className="bg-slate-50 rounded-[24px] p-8 h-full hover:bg-blue-50/40 transition-colors duration-300 border border-slate-100 hover:border-blue-100 flex flex-col">
                {/* Icon */}
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-100 text-blue-600">
                  <benefit.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{benefit.description}</p>

                {/* Hover Indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-[32px] p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl border border-slate-800"
        >
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Ready to Experience Premium Cooling?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join thousands of happy homeowners and businesses who trust our expert team for all their AC maintenance and installation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a
                href={`tel:${COMPANY_CONFIG.phoneRaw}`}
                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-lg shadow-black/10 hover:bg-slate-50 transition-all hover:scale-105 active:scale-[0.98] text-sm"
              >
                Call {COMPANY_CONFIG.phone}
              </a>
              <a
                href="#contact"
                className="px-8 py-4 bg-transparent text-white border border-slate-700 hover:border-slate-500 font-bold rounded-2xl transition-all hover:scale-105 active:scale-[0.98] text-sm"
              >
                Book Online Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}