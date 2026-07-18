'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Menu, X, Snowflake, Sun, Moon, Palette, Check } from 'lucide-react'
import { COMPANY_CONFIG } from '../config/constants'

type ThemeColor = "default" | "theme-emerald" | "theme-rose" | "theme-cyber";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Dark mode & theme color state
  const [isDark, setIsDark] = useState(false)
  const [activeTheme, setActiveTheme] = useState<ThemeColor>("default")
  const [isThemeOpen, setIsThemeOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)

    // Load persisted state
    const savedDark = localStorage.getItem("theme-dark") === "true";
    const savedTheme = (localStorage.getItem("theme-color") as ThemeColor) || "default";

    setIsDark(savedDark);
    setActiveTheme(savedTheme);

    if (savedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const allThemes: ThemeColor[] = ["theme-emerald", "theme-rose", "theme-cyber"];
    allThemes.forEach((t) => document.documentElement.classList.remove(t));
    if (savedTheme !== "default") {
      document.documentElement.classList.add(savedTheme);
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme-dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme-dark", "false");
    }
  };

  const selectTheme = (theme: ThemeColor) => {
    setActiveTheme(theme);
    const allThemes: ThemeColor[] = ["theme-emerald", "theme-rose", "theme-cyber"];
    allThemes.forEach((t) => document.documentElement.classList.remove(t));

    if (theme !== "default") {
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme-color", theme);
    } else {
      localStorage.setItem("theme-color", "default");
    }
    setIsThemeOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
    { name: 'Track Status', href: '#track-status' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-md py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isScrolled
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105'
                : 'bg-white/10 text-white group-hover:bg-white/20'
              }`}>
              <Snowflake className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-2xl tracking-tight leading-none transition-colors duration-300 ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'
                }`}>
                {COMPANY_CONFIG.brandName}
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 transition-colors duration-300 ${isScrolled ? 'text-blue-600 dark:text-blue-400' : 'text-blue-200'
                }`}>
                AC SERVICES
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group py-2 ${isScrolled
                    ? 'text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
                    : 'text-white/90 hover:text-white'
                  }`}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop controls & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme controls */}
            <div className="flex items-center gap-3 relative mr-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${isScrolled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 border-transparent dark:text-amber-400'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Theme Palette Toggle */}
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className={`p-2.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${isScrolled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 border-transparent dark:text-slate-200'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                title="Select Theme Color"
              >
                <Palette className="w-4.5 h-4.5" />
              </button>

              {/* Color swatches dropdown */}
              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 top-14 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-xl flex gap-2.5 z-50"
                  >
                    {[
                      { id: "default" as ThemeColor, colorClass: "bg-blue-600", label: "Ocean Blue" },
                      { id: "theme-emerald" as ThemeColor, colorClass: "bg-emerald-600", label: "Emerald Mint" },
                      { id: "theme-rose" as ThemeColor, colorClass: "bg-rose-600", label: "Sunset Rose" },
                      { id: "theme-cyber" as ThemeColor, colorClass: "bg-purple-600", label: "Cyber Purple" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => selectTheme(t.id)}
                        className={`w-7 h-7 rounded-full ${t.colorClass} border border-white/20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm`}
                        title={t.label}
                      >
                        {activeTheme === t.id && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href={`tel:${COMPANY_CONFIG.phoneRaw}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md hover:scale-105 active:scale-[0.98] ${isScrolled
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
            className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled
                ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
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
            className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-900 shadow-xl overflow-hidden"
          >
            <div className="container-custom py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      const section = document.querySelector(link.href);
                      if (section) {
                        section.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 250);
                  }}
                  className="block py-3 px-4 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-900/50 rounded-2xl font-semibold text-sm transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}

              {/* Mobile theme switcher controls */}
              <div className="py-4 border-t border-b border-slate-100 dark:border-slate-800/80 space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appearance</span>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-xs border border-transparent dark:border-slate-800 cursor-pointer"
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Theme Color</span>
                  <div className="flex gap-3">
                    {[
                      { id: "default" as ThemeColor, colorClass: "bg-blue-600", label: "Ocean Blue" },
                      { id: "theme-emerald" as ThemeColor, colorClass: "bg-emerald-600", label: "Emerald Mint" },
                      { id: "theme-rose" as ThemeColor, colorClass: "bg-rose-600", label: "Sunset Rose" },
                      { id: "theme-cyber" as ThemeColor, colorClass: "bg-purple-600", label: "Cyber Purple" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => selectTheme(t.id)}
                        className={`w-9 h-9 rounded-full ${t.colorClass} border border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md`}
                        title={t.label}
                      >
                        {activeTheme === t.id && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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