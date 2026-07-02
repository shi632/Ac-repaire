'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
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
    description: 'Expert diagnosis and repair for all AC problems',
    features: [
      { icon: Thermometer, text: 'Cooling problems' },
      { icon: Droplets, text: 'Water leakage' },
      { icon: Volume2, text: 'Noise issues' },
      { icon: Power, text: 'AC not working' },
    ],
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
  },
  {
    icon: Settings,
    title: 'AC Installation',
    description: 'Professional installation by certified technicians',
    features: [
      { icon: Home, text: 'New AC installation' },
      { icon: Building2, text: 'Split AC installation' },
      { icon: Home, text: 'Window AC installation' },
    ],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: ClipboardCheck,
    title: 'AC Maintenance',
    description: 'Regular servicing to keep your AC running efficiently',
    features: [
      { icon: Sparkles, text: 'Regular servicing' },
      { icon: Droplets, text: 'Deep cleaning' },
      { icon: Gauge, text: 'Performance check' },
    ],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Wind,
    title: 'AC Gas Filling',
    description: 'Complete refrigerant solutions for optimal cooling',
    features: [
      { icon: Droplets, text: 'Gas leakage check' },
      { icon: Wind, text: 'Refrigerant refill' },
    ],
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: ArrowRightLeft,
    title: 'AC Uninstallation',
    description: 'Safe removal and shifting of your AC units',
    features: [
      { icon: Shield, text: 'Safe AC removal' },
      { icon: ArrowRightLeft, text: 'AC shifting service' },
    ],
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-50',
  },
]

export default function Services() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="services" className="section-padding bg-secondary-50" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <Settings className="w-4 h-4" />
            Our Services
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Comprehensive <span className="text-gradient">AC Solutions</span>
          </h2>
          <p className="text-lg text-secondary-600">
            From repair to installation, we offer complete air conditioning services to keep you cool and comfortable.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-secondary-100 hover:border-primary-200"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${service.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7 text-primary-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-secondary-900 mb-2">{service.title}</h3>
              <p className="text-secondary-600 mb-4">{service.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2 text-sm text-secondary-700">
                    <feature.icon className="w-4 h-4 text-primary-500" />
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#contact"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 font-semibold text-sm hover:gap-3 transition-all"
              >
                Book This Service
                <ArrowRightLeft className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}