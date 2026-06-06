import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MailOpen, Heart, Sparkles, Volume2, Camera } from 'lucide-react';

interface LandingPageProps {
  onOpenLetter: () => void;
}

export default function LandingPage({ onOpenLetter }: LandingPageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    // Tiny delay to show opening envelope animation before entering main tracker
    setTimeout(() => {
      onOpenLetter();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-romantic-grid px-4 relative overflow-hidden font-sans">
      
      {/* Decorative ambient background hearts */}
      <div className="absolute inset-x-0 top-10 flex justify-around pointer-events-none opacity-40">
        <Heart className="text-pink-300 w-8 h-8 animate-float-slow" />
        <Heart className="text-rose-200 w-12 h-12 animate-float-medium delay-1000" />
        <Heart className="text-pink-200 w-6 h-6 animate-float-slow delay-2000" />
      </div>
      <div className="absolute inset-x-0 bottom-20 flex justify-between pointer-events-none opacity-40 px-12">
        <Heart className="text-rose-300 w-10 h-10 animate-float-medium delay-1500" />
        <Heart className="text-pink-300 w-8 h-8 animate-float-slow delay-500" />
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -30, transition: { duration: 0.6 } }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-rose-100 p-8 rounded-3xl shadow-xl shadow-rose-100/40 text-center relative z-20 flex flex-col items-center"
            id="envelope-card"
          >
            {/* Romantic branding badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm border border-rose-100/50">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-rose-400" />
              <span>You Spesial</span>
            </div>

            {/* Glowing Letter Container */}
            <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-pink-300 rounded-full opacity-15 blur-xl animate-pulse-slow"></div>
              
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="relative bg-white p-6 rounded-2xl shadow-lg border border-rose-50 flex items-center justify-center cursor-pointer group hover:shadow-xl transition-shadow duration-300"
                onClick={handleOpen}
                id="interactive-envelope"
              >
                <div className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-2 shadow-md">
                  <Heart className="w-4 h-4 fill-current animate-pulse" />
                </div>
                <MailOpen className="w-16 h-16 text-rose-400 stroke-[1.2] group-hover:text-rose-500 transition-colors" />
              </motion.div>
            </div>

            {/* Romance Header */}
            <h1 className="font-display font-extrabold text-3xl text-gray-800 tracking-tight leading-none mb-3">
              Ada surat cinta <br />
              <span className="text-rose-500 relative">
                spesial untukmu...
                <svg className="absolute -bottom-2.5 left-0 w-full h-2 text-rose-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,7 C30,2 70,2 100,7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mt-4 mb-8">
              Sebuah surat digital interaktif yang dirancang khusus untuk memberikan kejutan termanis hanya untuk dirimu.
            </p>

            {/* Button */}
            <button
              id="btn-buka-surat"
              onClick={handleOpen}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-4 px-6 rounded-2xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 skew-y-12 transition-transform duration-500"></div>
              <MailOpen className="w-5 h-5" />
              <span className="font-semibold tracking-wide">Buka Surat Cinta</span>
              <Heart className="w-4 h-4 fill-white text-rose-500 ml-1 group-hover:scale-125 transition-transform" />
            </button>

            {/* Informational icons */}
            <div className="flex justify-center items-center gap-6 mt-8 text-[11px] text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" /> Autoplay BGM
              </span>
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" /> Interactive Cam
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center max-w-sm absolute z-30"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="bg-rose-500/10 p-5 rounded-full mb-4 border border-rose-200"
            >
              <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
            </motion.div>
            <h2 className="font-display font-semibold text-lg text-rose-600 tracking-wide animate-pulse">
              Membuka segel cinta... ✨
            </h2>
            <p className="text-xs text-gray-400 mt-1">Mengaktifkan instrumen audio & melodi romantis</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
