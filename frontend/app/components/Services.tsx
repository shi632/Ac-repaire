'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ServiceCard from './ui/ServiceCard'
import { 
   Wrench, 
   Settings, 
   ClipboardCheck, 
   Wind, 
   ArrowRightLeft,
   Droplets,
   Volume2,
   Power,
   Thermometer,
   Home,
   Building2,
   Sparkles,
   Gauge,
   Shield
} from 'lucide-react'

const services = [
  {
    icon: Wrench,
    title: 'AC Repair Service',
    description: 'Expert diagnosis and repair for cooling issues, leaks, electrical faults, and sensor breakdowns.',
    features: [
      { icon: Thermometer, text: 'Cooling diagnostics' },
      { icon: Droplets, text: 'Water leakage repair' },
      { icon: Volume2, text: 'Noise troubleshooting' },
      { icon: Power, text: 'Circuit board service' },
    ],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Settings,
    title: 'AC Installation',
    description: 'Precision mounting and pipeline routing for new or shifted split and window AC units.',
    features: [
      { icon: Home, text: 'New unit setup' },
      { icon: Building2, text: 'Split AC mounting' },
      { icon: Home, text: 'Window AC mounting' },
    ],
    color: 'from-blue-600 to-indigo-500',
    bgColor: 'bg-indigo-50/50',
  },
  {
    icon: ClipboardCheck,
    title: 'AC Maintenance',
    description: 'Deep filter cleaning, pressure tests, and optimization to lower electricity consumption.',
    features: [
      { icon: Sparkles, text: 'Filter & coil cleaning' },
      { icon: Droplets, text: 'Water tray cleaning' },
      { icon: Gauge, text: 'Refrigerant check' },
    ],
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Wind,
    title: 'AC Gas Filling',
    description: 'Professional leak testing and eco-friendly refrigerant top-ups for maximum cooling.',
    features: [
      { icon: Droplets, text: 'Nitrogen test check' },
      { icon: Wind, text: 'Refrigerant refill' },
    ],
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'bg-cyan-50',
  },
  {
    icon: ArrowRightLeft,
    title: 'AC Uninstallation',
    description: 'Safe dismantling of condenser and indoor units with refrigerant recovery mechanisms.',
    features: [
      { icon: Shield, text: 'Refrigerant locking' },
      { icon: ArrowRightLeft, text: 'Safe shifting service' },
    ],
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-blue-50/80',
  },
]

export default function Services() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const handleBookService = (title: string) => {
    // Scroll to the contact form smoothly
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
    // Dispatch custom event to auto-select option in booking form
    const selectEvent = new CustomEvent('select-service', { detail: title })
    window.dispatchEvent(selectEvent)
  }

  return (
    <section id="services" className="section-padding bg-slate-50 relative overflow-hidden" ref={ref}>
      {/* Decorative backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <Settings className="w-4 h-4 text-blue-600 animate-spin-slow" />
            <span>Our Services</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Comprehensive <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AC Solutions</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From emergency repairs and cooling diagnostics to professional setups, we keep your home and office perfectly cooled.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
                features={service.features}
                color={service.color}
                bgColor={service.bgColor}
                onBook={handleBookService}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}