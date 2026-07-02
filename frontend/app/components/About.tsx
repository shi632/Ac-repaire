'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Shield, Users, Award, ThumbsUp } from 'lucide-react'

export default function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  const stats = [
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Award, value: '15+', label: 'Years Experience' },
    { icon: Shield, value: '100%', label: 'Genuine Parts' },
    { icon: ThumbsUp, value: '4.9/5', label: 'Customer Rating' },
  ]

  return (
    <section id="about" className="section-padding bg-white" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50 aspect-[4/3]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-800 mb-2">Trusted Service</h3>
                  <p className="text-secondary-600">Since 2009</p>
                </div>
              </div>
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white rounded-2xl p-6 shadow-xl">
              <p className="text-4xl font-bold">15+</p>
              <p className="text-sm opacity-90">Years of Excellence</p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              About Our Company
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
              Your Trusted Partner for{' '}
              <span className="text-gradient">AC Solutions</span>
            </h2>
            
            <p className="text-lg text-secondary-600 mb-6 leading-relaxed">
              We provide professional AC repair and maintenance services for residential and commercial customers. Our trained technicians provide quick solutions for all AC problems.
            </p>
            
            <p className="text-secondary-600 mb-8 leading-relaxed">
              With over 15 years of experience in the industry, we have built a reputation for reliability, quality workmanship, and exceptional customer service. Our team of certified technicians is equipped to handle all major AC brands and models.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="bg-secondary-50 rounded-xl p-4 text-center hover:bg-primary-50 transition-colors"
                >
                  <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}