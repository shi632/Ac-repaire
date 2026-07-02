'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ExternalLink, Star, ThumbsUp, MessageSquare, Award } from 'lucide-react'

export default function Justdial() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  const justdialUrl = 'https://jsdl.in/DT-19GQMT2BJCA'

  return (
    <section className="section-padding bg-primary-900 text-white" ref={ref}>
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              Trusted Platform
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trusted by Customers on{' '}
              <span className="text-accent-light">Justdial</span>
            </h2>

            <p className="text-lg text-white/80 mb-8">
              We are a verified and highly-rated business on Justdial. Our customers trust us for reliable AC repair and maintenance services. Check out our profile and reviews.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-white/70">Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">200+</p>
                <p className="text-sm text-white/70">Reviews</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <MessageSquare className="w-8 h-8 text-accent-light mx-auto mb-2" />
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-white/70">Testimonials</p>
              </div>
            </div>

            <a
              href={justdialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View Our Justdial Profile
            </a>
          </motion.div>

          {/* Review Cards Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Sample Review Cards */}
            {[
              { name: 'Rahul M.', text: 'Very professional service. Fixed my AC in no time!', rating: 5 },
              { name: 'Anita K.', text: 'Great experience with the installation team. Highly recommended.', rating: 5 },
              { name: 'Suresh P.', text: 'Affordable pricing and quality work. Will use again.', rating: 5 },
            ].map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{review.name}</span>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-white/80 text-sm">"{review.text}"</p>
              </motion.div>
            ))}

            <p className="text-center text-white/60 text-sm mt-4">
              Verified reviews from Justdial platform
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}