'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote, User } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'Excellent service! The technician arrived on time and fixed my split AC cooling issue within an hour. Very professional and affordable pricing. Highly recommended!',
    service: 'AC Repair',
  },
  {
    name: 'Priya Sharma',
    location: 'Noida',
    rating: 5,
    text: 'Got my new AC installed by CoolAir team. They did a fantastic job with proper installation and cleanup. The team was very courteous and knowledgeable.',
    service: 'AC Installation',
  },
  {
    name: 'Amit Patel',
    location: 'Gurgaon',
    rating: 5,
    text: 'Regular maintenance service was thorough and detailed. My AC is running like new now. Will definitely use their services again for annual maintenance.',
    service: 'AC Maintenance',
  },
  {
    name: 'Sunita Verma',
    location: 'Faridabad',
    rating: 5,
    text: 'Had a gas leakage issue in my AC. They detected the problem quickly and refilled the gas with genuine refrigerant. Very satisfied with the service quality.',
    service: 'Gas Filling',
  },
  {
    name: 'Vikram Singh',
    location: 'Delhi',
    rating: 5,
    text: 'Called them for emergency AC repair at midnight. They responded quickly and fixed the issue. Truly 24/7 service as promised. Great job!',
    service: 'Emergency Repair',
  },
  {
    name: 'Neha Gupta',
    location: 'Noida',
    rating: 5,
    text: 'Very professional team. They uninstalled my AC safely and reinstalled it at my new apartment without any damage. Reasonable charges too.',
    service: 'AC Shifting',
  },
]

export default function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="reviews" className="section-padding bg-secondary-50" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            Customer Reviews
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            What Our <span className="text-gradient">Customers</span> Say
          </h2>
          <p className="text-lg text-secondary-600">
            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary-100">
                <Quote className="w-10 h-10" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-secondary-700 mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-secondary-100">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                  <p className="text-sm text-secondary-500">{testimonial.location} • {testimonial.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-bold text-secondary-900">4.9</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-secondary-900">Average Rating</p>
              <p className="text-sm text-secondary-500">Based on 500+ reviews</p>
            </div>
            <div className="h-10 w-px bg-secondary-200" />
            <div className="text-left">
              <p className="font-semibold text-secondary-900">5000+</p>
              <p className="text-sm text-secondary-500">Services Completed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}