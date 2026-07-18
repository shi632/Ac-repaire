import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Snowflake } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Contact", href: "#contact" },
  ];

  const services = [
    "AC Repair Service",
    "AC Installation",
    "AC Maintenance",
    "AC Gas Filling",
    "AC Uninstallation",
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Snowflake className="w-5 h-5 animate-pulse-slow" />
              </div>
              <span className="font-extrabold text-white text-2xl tracking-tight leading-none">
                {COMPANY_CONFIG.brandName}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Professional, certified HVAC technicians providing transparent, quick, and reliable air conditioning solutions since 2014.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6">Our Services</h4>
            <ul className="space-y-3 text-sm">
              {services.map((service, index) => (
                <li key={index} className="hover:text-blue-500 transition-colors cursor-pointer">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{COMPANY_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href={`tel:${COMPANY_CONFIG.phoneRaw}`} className="hover:text-blue-500 transition-colors font-semibold">
                  {COMPANY_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a href={`mailto:${COMPANY_CONFIG.email}`} className="hover:text-blue-500 transition-colors">
                  {COMPANY_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900/60 bg-slate-950">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-row flex-wrap items-center justify-center gap-2 text-xs">
            <p className="text-slate-500">
              © {currentYear} {COMPANY_CONFIG.name}. All rights reserved.
            </p>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Created by</span>
              <span className="text-slate-200 font-bold hover:text-blue-400 transition-colors">Shivam Sharma</span>
              <span className="text-[10px] text-slate-500 font-medium">India</span>
              <div className="w-5 h-3.5 border border-slate-800/40 rounded-[2px] overflow-hidden flex flex-col flex-shrink-0 shadow-sm" title="India">
                <div className="bg-[#FF9933] h-1/3 w-full" />
                <div className="bg-[#FFFFFF] h-1/3 w-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full border-[0.5px] border-[#000080] flex-shrink-0 animate-spin-slow" />
                </div>
                <div className="bg-[#128807] h-1/3 w-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
            <Link href="/admin" className="hover:text-blue-500 transition-colors">Admin Portal</Link>
            <span className="text-slate-800">|</span>
            <Link href="/technician" className="hover:text-blue-500 transition-colors">Technician Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}