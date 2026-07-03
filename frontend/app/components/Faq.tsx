'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { FAQS } from '../config/constants'
import { useInView } from 'react-intersection-observer'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="section-padding bg-slate-50 relative overflow-hidden animate-fade-in" ref={ref}>
      {/* Decorative blurry circles */}
      <div className="absolute top-1/2 left-[-10%] w-[350px] h-[350px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-cyan-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-custom relative z-10 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Support Center</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Got queries about our services? Find quick answers here to help you get your AC cooling in no time.
          </p>
        </motion.div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-3xl border border-slate-100/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-slate-50/50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-slate-900 text-base sm:text-lg pr-4 leading-snug">
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
