'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Camera, Image as ImageIcon } from 'lucide-react'

const galleryItems = [
  {
    title: 'AC Repair in Progress',
    category: 'Repair',
    description: 'Technician repairing split AC unit',
  },
  {
    title: 'AC Installation',
    category: 'Installation',
    description: 'Professional split AC installation',
  },
  {
    title: 'Maintenance Service',
    category: 'Maintenance',
    description: 'Deep cleaning and servicing',
  },
  {
    title: 'Gas Filling Service',
    category: 'Gas Filling',
    description: 'Refrigerant refill process',
  },
  {
    title: 'Before Service',
    category: 'Before/After',
    description: 'Dirty AC before cleaning',
  },
  {
    title: 'After Service',
    category: 'Before/After',
    description: 'Clean AC after servicing',
  },
]

export default function Gallery() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="gallery" className="section-padding bg-white" ref={ref}>
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-4">
            <Camera className="w-4 h-4" />
            Our Work
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Service <span className="text-gradient">Gallery</span>
          </h2>
          <p className="text-lg text-secondary-600">
            Take a look at our professional technicians at work and the quality of our services.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-secondary-100 aspect-[4/3] cursor-pointer"
            >
              {/* Placeholder Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-primary-300 mx-auto mb-2" />
                  <p className="text-primary-400 font-medium">{item.category}</p>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full mb-2">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}