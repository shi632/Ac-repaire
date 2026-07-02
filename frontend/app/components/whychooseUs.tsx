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

const benefits = [
  {
    icon: UserCheck,
    title: 'Experienced Technicians',
    description: 'Certified professionals with years of hands-on experience in AC repair and maintenance.',
  },
  {
    icon: Zap,
    title: 'Same Day Service',
    description: 'Quick response time with same-day service availability for urgent repairs.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Affordable Pricing',
    description: 'Transparent pricing with no hidden charges. Best rates guaranteed in the market.',
  },
  {
    icon: Puzzle,
    title: 'Genuine Parts',
    description: 'We use only original spare parts and high-quality components for all repairs.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Customer Support',
    description: 'Round-the-clock customer support to address your queries and concerns.',
  },
  {
    icon: Truck,
    title: 'Doorstep Service',
    description: 'Convenient doorstep service at your preferred time and location.',
  },
]

export default function WhyChooseUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="why-us" className="section-padding bg-white" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            The <span className="text-gradient">CoolAir</span> Advantage
          </h2>
          <p className="text-lg text-secondary-600">
            We go above and beyond to ensure your complete satisfaction with every service.
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
              className="relative group"
            >
              <div className="bg-secondary-50 rounded-2xl p-8 h-full hover:bg-primary-50 transition-colors duration-300 border border-transparent hover:border-primary-200">
                {/* Icon */}
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-primary-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-secondary-900 mb-3">{benefit.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{benefit.description}</p>

                {/* Hover Indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience Premium AC Service?
          </h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their cooling needs. Book your service today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+91XXXXXXXXXX" className="btn-primary bg-white text-primary-700 hover:bg-white/90">
              Call Now
            </a>
            <a href="#contact" className="btn-secondary border-white text-white hover:bg-white/10">
              Book Online
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}