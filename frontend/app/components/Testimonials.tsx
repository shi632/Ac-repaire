'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote, User } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Sector 70, Mohali',
    rating: 5,
    text: 'Excellent service! The technician arrived on time and fixed my split AC cooling issue within an hour. Very professional and affordable pricing. Highly recommended!',
    service: 'AC Repair',
  },
  {
    name: 'Priya Sharma',
    location: 'Sector 35, Chandigarh',
    rating: 5,
    text: 'Got my new AC installed by CoolAir team. They did a fantastic job with proper installation and cleanup. The team was very courteous and knowledgeable.',
    service: 'AC Installation',
  },
  {
    name: 'Amit Patel',
    location: 'Sector 62, Mohali',
    rating: 5,
    text: 'Regular maintenance service was thorough and detailed. My AC is running like new now. Will definitely use their services again for annual maintenance.',
    service: 'AC Maintenance',
  },
  {
    name: 'Sunita Verma',
    location: 'Sector 22, Chandigarh',
    rating: 5,
    text: 'Had a gas leakage issue in my AC. They detected the problem quickly and refilled the gas with genuine refrigerant. Very satisfied with the service quality.',
    service: 'Gas Filling',
  },
  {
    name: 'Vikram Singh',
    location: 'Phase 3B2, Mohali',
    rating: 5,
    text: 'Called them for emergency AC repair at midnight. They responded quickly and fixed the issue. Truly 24/7 service as promised. Great job!',
    service: 'Emergency Repair',
  },
  {
    name: 'Neha Gupta',
    location: 'Sector 15, Chandigarh',
    rating: 5,
    text: 'Very professional team. They uninstalled my AC safely and reinstalled it at my new apartment without any damage. Reasonable charges too.',
    service: 'AC Shifting',
  },
]

export default function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="reviews" className="section-padding bg-slate-50 relative overflow-hidden" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <Star className="w-4 h-4 text-blue-600" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            What Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Customers</span> Say
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Read real-world testimonials from our happy residential and commercial clients across Mohali & Chandigarh.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative border border-slate-100 flex flex-col justify-between"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 text-blue-100/50">
                <Quote className="w-10 h-10" />
              </div>

              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-8 relative z-10">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3.5 pt-5 border-t border-slate-100">
                <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm leading-none">{testimonial.name}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">{testimonial.location} • {testimonial.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-white rounded-3xl px-8 py-5 border border-slate-150 shadow-md">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse-slow" />
              <span className="text-3xl font-black text-slate-900 leading-none">{COMPANY_CONFIG.rating}</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-900 text-sm">Average Rating</p>
              <p className="text-xs text-slate-500 mt-0.5">Based on {COMPANY_CONFIG.reviewsCount} reviews</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-900 text-sm">{COMPANY_CONFIG.completedServices}</p>
              <p className="text-xs text-slate-500 mt-0.5">Services Completed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}