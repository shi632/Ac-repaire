"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot, Sparkles, AlertCircle, Wrench, CheckCircle } from "lucide-react";
import { COMPANY_CONFIG } from "../config/constants";

interface Message {
  sender: "user" | "bot";
  text: string;
  options?: string[];
  action?: { type: string; payload: string };
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial bot message
    setMessages([
      {
        sender: "bot",
        text: "Hello! I'm CoolAir AI, your virtual AC assistant. ❄️\n\nWhat issue are you experiencing with your air conditioner?",
        options: [
          "AC is not cooling",
          "AC is leaking water",
          "AC is making loud noise",
          "Check pricing rates",
          "Speak to a human",
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll chat window to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOptionClick = (option: string) => {
    // Add user response message
    const userMsg: Message = { sender: "user", text: option };
    setMessages((prev) => [...prev, userMsg]);

    // Handle actions (WhatsApp redirect, scroll to booking, etc.)
    handleActionClick(option);

    setTimeout(() => {
      processBotResponse(option);
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");

    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      processBotResponse(text);
    }, 600);
  };

  const processBotResponse = (text: string) => {
    const input = text.toLowerCase();
    let botMsg: Message = {
      sender: "bot",
      text: "I didn't quite catch that. Please select one of the quick options or describe your problem in simple words.",
      options: ["AC is not cooling", "AC is leaking water", "Check pricing rates", "Start over"],
    };

    if (input.includes("cool") || input.includes("not cooling") || input.includes("warm")) {
      botMsg = {
        sender: "bot",
        text: "If your AC is not cooling, try these troubleshooting steps:\n\n1. Check if the remote mode is set to **'COOL'** and the temperature is set low (e.g. 18-24°C).\n2. Verify if the indoor unit's air filter is clean. Dirty filters block cold airflow.\n3. Make sure all windows and doors are fully closed.\n\nIf these are correct, there might be a gas leak or compressor fault.",
        options: ["Book Repair Service", "Check pricing", "Speak to a human"],
      };
    } else if (input.includes("leak") || input.includes("water") || input.includes("dripping")) {
      botMsg = {
        sender: "bot",
        text: "Water leakage is usually caused by:\n\n1. **A blocked drain pipe** (dirt/grime blocking water exit).\n2. **Ice buildup** on the evaporator coils (due to low gas or restricted airflow).\n\nAvoid running the AC while leaking to prevent wall damage. We can perform a high-pressure jet wash to clear blocks.",
        options: ["Book Maintenance Wash", "Check pricing", "Speak to a human"],
      };
    } else if (input.includes("noise") || input.includes("loud") || input.includes("vibrat")) {
      botMsg = {
        sender: "bot",
        text: "AC unit noise usually stems from:\n\n1. **Loose paneling/cabinet screws** vibrating.\n2. **Debris or dirt** inside the outdoor unit fan.\n3. **Blower motor wear** or loose fan blades.\n\nWe recommend a quick technician checkup to tighten the internal components safely.",
        options: ["Book a Technician", "Speak to a human"],
      };
    } else if (input.includes("price") || input.includes("rate") || input.includes("cost") || input.includes("charge")) {
      botMsg = {
        sender: "bot",
        text: "Our starting prices (Indian Rupees) are:\n\n• **AC Repair / Diagnosis**: ₹349\n• **AC Wet/Dry Service**: ₹499\n• **AC Split Installation**: ₹1,199\n• **AC Gas Refill (Complete)**: ₹1,999\n\nAll services include a 30-day warranty and original spare parts.",
        options: ["Book Service Now", "Speak to a human"],
      };
    } else if (input.includes("book") || input.includes("appointment") || input.includes("schedul") || input.includes("technician")) {
      botMsg = {
        sender: "bot",
        text: "Let's schedule a certified HVAC technician to inspect your air conditioner. Fill out the quick request form on our homepage and we will call you back within 15 minutes.",
        action: { type: "SCROLL_TO_CONTACT", payload: "contact" },
        options: ["Click to scroll to booking form"],
      };
    } else if (input.includes("human") || input.includes("call") || input.includes("chat") || input.includes("support")) {
      botMsg = {
        sender: "bot",
        text: "You can speak to our dispatch desk directly:\n\n• **Call us**: +91 93899 82912\n• **WhatsApp Support**: Click below to chat live with our support coordinator.",
        options: ["Chat on WhatsApp", "Start over"],
      };
    } else if (input.includes("start over") || input.includes("reset") || input.includes("hello") || input.includes("hi")) {
      botMsg = {
        sender: "bot",
        text: "What issue are you experiencing with your air conditioner?",
        options: [
          "AC is not cooling",
          "AC is leaking water",
          "AC is making loud noise",
          "Check pricing rates",
          "Speak to a human",
        ],
      };
    }

    setMessages((prev) => [...prev, botMsg]);

    // Handle custom scroll actions automatically
    if (botMsg.action && botMsg.action.type === "SCROLL_TO_CONTACT") {
      executeScrollAction(botMsg.action.payload);
    }
  };

  const executeScrollAction = (id: string) => {
    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
    }, 1500);
  };

  const handleActionClick = (actionText: string) => {
    if (actionText.includes("scroll") || actionText.includes("Book") || actionText.includes("Technician")) {
      executeScrollAction("contact");
      
      // Prefill option if applicable
      let selectedOption = "";
      if (actionText.includes("Repair")) selectedOption = "AC Repair Service";
      else if (actionText.includes("Maintenance")) selectedOption = "AC Maintenance";
      else if (actionText.includes("Installation")) selectedOption = "AC Installation";
      
      if (selectedOption) {
        setTimeout(() => {
          const selectEvent = new CustomEvent("select-service", { detail: selectedOption });
          window.dispatchEvent(selectEvent);
        }, 1800);
      }
    } else if (actionText.includes("WhatsApp")) {
      window.open(`https://wa.me/${COMPANY_CONFIG.whatsapp}?text=Hi%20CoolAir,%20I%20need%20assistance.`, "_blank");
    } else if (actionText.includes("pricing") || actionText.includes("price")) {
      handleOptionClick("Check pricing rates");
    } else if (actionText.includes("human")) {
      handleOptionClick("Speak to a human");
    } else if (actionText.includes("over")) {
      handleOptionClick("Start over");
    }
  };

  return (
    <>
      {/* Chat Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
        title="Open AC Diagnostic Helper"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-50 w-[350px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/10 relative">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    CoolAir AI Helper <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">AC Diagnostics</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-thin">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className="max-w-[75%] space-y-3">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none font-semibold shadow-md"
                          : "bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none font-medium whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Option Chips inside message bubble */}
                    {msg.options && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleOptionClick(opt)}
                            className="px-3.5 py-2 bg-slate-950 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/30 text-blue-400 font-bold rounded-xl text-[10px] transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/60 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about AC repair..."
                className="flex-grow px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 active:scale-95 shadow-md shadow-blue-500/25"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
