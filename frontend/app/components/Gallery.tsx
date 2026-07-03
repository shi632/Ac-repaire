'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Camera, ShieldCheck, Sparkles, Fan, Snowflake, Droplets } from 'lucide-react'

const galleryItems = [
  {
    title: 'Precision Cooling Diagnostics',
    category: 'Repair',
    description: 'Technician checking pressure levels and circuit board parameters.',
    gradient: 'from-blue-600 to-cyan-500',
    icon: Snowflake
  },
  {
    title: 'Flawless Split AC Installation',
    category: 'Installation',
    description: 'Sleek wall mounting and pipeline concealment setups.',
    gradient: 'from-indigo-600 to-blue-500',
    icon: Fan
  },
  {
    title: 'Jet Pump Coil Deep Clean',
    category: 'Maintenance',
    description: 'High-pressure water washing for indoor unit evaporator coils.',
    gradient: 'from-teal-600 to-cyan-500',
    icon: Sparkles
  },
  {
    title: 'Eco-Friendly Gas Refill',
    category: 'Gas Filling',
    description: 'Recharging systems with premium, high-cooling refrigerants.',
    gradient: 'from-cyan-600 to-teal-500',
    icon: Droplets
  },
  {
    title: 'Condenser Unit Descaling',
    category: 'Maintenance',
    description: 'Clearing dirt and grime from the outdoor compressor unit.',
    gradient: 'from-blue-500 to-indigo-600',
    icon: ShieldCheck
  },
  {
    title: 'Multi-Point Safety Audit',
    category: 'Inspection',
    description: 'Electrical load test and wire isolation checks.',
    gradient: 'from-slate-800 to-slate-900',
    icon: Camera
  },
]

export default function Gallery() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="gallery" className="section-padding bg-white relative overflow-hidden" ref={ref}>
      {/* Decorative backgrounds */}
      <div className="absolute top-1/2 left-[-15%] w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Service Gallery</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Our Work in <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Take a look at our professional technicians at work delivering reliable solutions on-site.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative rounded-3xl overflow-hidden bg-slate-950 aspect-[4/3] cursor-pointer shadow-md hover:shadow-2xl border border-slate-100 hover:border-transparent transition-all duration-500"
              >
                {/* Visual Gradient Background Mockup */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${item.gradient} opacity-90 transition-transform duration-700 group-hover:scale-110 flex items-center justify-center p-8`}>
                  {/* Subtle decorative mesh overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_70%)]" />
                  
                  {/* Visual Art inside the box */}
                  <div className="text-center z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white mb-3 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Dark gradient overlay bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
                    {item.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">{item.title}</h3>
                  <p className="text-white/80 text-xs leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}