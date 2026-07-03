'use client'

import { LucideIcon, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Feature {
  icon: LucideIcon
  text: string
}

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: Feature[]
  color: string
  bgColor: string
  onBook: (title: string) => void
}

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  features,
  color,
  bgColor,
  onBook,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 relative overflow-hidden flex flex-col justify-between h-full"
    >
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />

      <div>
        {/* Icon Block */}
        <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 relative`}>
          <Icon className={`w-8 h-8 bg-gradient-to-r ${color} bg-clip-text text-blue-600`} />
        </div>

        {/* Header content */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* Feature List */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon
            return (
              <li
                key={index}
                className="flex items-center gap-3 text-slate-700 text-sm font-medium"
              >
                <div className={`p-1 rounded-md ${bgColor} text-blue-600`}>
                  <FeatureIcon className="w-3.5 h-3.5" />
                </div>
                <span>{feature.text}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Booking CTA Button */}
      <button
        onClick={() => onBook(title)}
        className="w-full py-3.5 px-4 bg-slate-50 group-hover:bg-blue-600 text-slate-800 group-hover:text-white rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-slate-100 group-hover:border-transparent active:scale-[0.98] cursor-pointer"
      >
        <span>Book Service Now</span>
        <svg
          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </motion.div>
  )
}
