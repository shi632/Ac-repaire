"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

export default function FloatingButtons() {
  const whatsappMessage = encodeURIComponent(COMPANY_CONFIG.whatsappMessage);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${COMPANY_CONFIG.whatsapp}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-white animate-pulse-slow"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.a>

      {/* Call Button */}
      <motion.a
        href={`tel:${COMPANY_CONFIG.phoneRaw}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all cursor-pointer text-white"
      >
        <Phone className="w-7 h-7" />
      </motion.a>
    </div>
  );
}