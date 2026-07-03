'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Menu, X, Snowflake } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
              isScrolled 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105' 
                : 'bg-white/10 text-white group-hover:bg-white/20'
            }`}>
              <Snowflake className={`w-6 h-6 animate-pulse-slow`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-2xl tracking-tight leading-none transition-colors duration-300 ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                {COMPANY_CONFIG.brandName}
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors duration-300 ${
                isScrolled ? 'text-blue-600' : 'text-blue-200'
              }`}>
                AC SERVICES
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group py-2 ${
                  isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${COMPANY_CONFIG.phoneRaw}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md hover:scale-105 active:scale-[0.98] ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10'
                  : 'bg-white text-blue-700 hover:bg-slate-50 shadow-black/10'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isScrolled 
                ? 'text-slate-800 hover:bg-slate-100' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="container-custom py-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-slate-800 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl font-semibold text-sm transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={`tel:${COMPANY_CONFIG.phoneRaw}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-4 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform"
              >
                <Phone className="w-4 h-4" />
                <span>Call {COMPANY_CONFIG.phone}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}