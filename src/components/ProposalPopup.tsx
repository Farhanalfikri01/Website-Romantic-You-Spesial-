import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, AlertTriangle, Smile } from 'lucide-react';

interface ProposalPopupProps {
  onAccept: () => void;
}

// Funny rejection phrases
const REJECTION_PHRASES = [
  "Tidak 💔",
  "Yakin? 🥺",
  "Coba pikir lagi 🔍",
  "Kok jahat sih? 😭",
  "Nggak kena blee 😜",
  "Error 404: No option not found",
  "Yakin tidak menyesal?",
  "Pasti kepencet kan?",
  "Jangan dong sayang... 💕",
  "Mau aja ya? Please...",
];

export default function ProposalPopup({ onAccept }: ProposalPopupProps) {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [isMoved, setIsMoved] = useState(false);
  const [noText, setNoText] = useState("Tidak");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [popIn, setPopIn] = useState(false);

  useEffect(() => {
    // Elegant entrance timeout
    const t = setTimeout(() => setPopIn(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Magical repositioning handler
  const handleRepelNoButton = (e: React.MouseEvent | React.TouchEvent) => {
    // We prevent touch scrolling or default actions on mobile to make the teleport instant
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    // Generate a random viewport coordinate, keeping it reasonably inside screen bounds (20% to 80%)
    const margin = 20; // percent margin
    const randomX = Math.floor(Math.random() * (100 - 2 * margin)) + margin - 50; // percentage shift relative to center
    const randomY = Math.floor(Math.random() * (100 - 2 * margin)) + margin - 50; // percentage shift relative to center

    setNoPosition({ x: randomX, y: randomY });
    setIsMoved(true);

    // Rotate phrases
    const nextIndex = (phraseIndex + 1) % REJECTION_PHRASES.length;
    setPhraseIndex(nextIndex);
    setNoText(REJECTION_PHRASES[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/40 backdrop-blur-md font-sans">
      <AnimatePresence>
        {popIn && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full max-w-lg bg-gradient-to-b from-white to-rose-50/50 p-8 rounded-3xl border border-rose-100 shadow-2xl relative overflow-hidden"
            id="proposal-popup-card"
          >
            {/* Soft decorative visual background elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-rose-100 rounded-full blur-xl opacity-60"></div>

            {/* Glowing Icon Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-400 rounded-full opacity-15 blur-md animate-pulse"></div>
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                  className="bg-rose-500 text-white rounded-full p-4.5 shadow-lg shadow-rose-200"
                >
                  <Heart className="w-9 h-9 fill-current text-white animate-heartbeat" />
                </motion.div>
                
                {/* Sprinkles decoration */}
                <Sparkles className="absolute -top-1 -right-1 text-yellow-400 w-5 h-5 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 text-amber-400 w-4 h-4 animate-bounce" />
              </div>

              {/* Main Proposal Call-out Question */}
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-800 leading-snug tracking-tight mb-2">
                Apa kamu mau <br className="hidden sm:inline" />
                <span className="text-rose-500 relative inline-block">
                  jadi pacarku? ❤️
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-rose-200/40 -z-10 rounded"></span>
                </span>
              </h2>

              <p className="text-gray-500 text-sm max-w-sm mt-3 leading-relaxed">
                Setiap petik melodi dan desiran musim mawar hari ini hanyalah awal, aku ingin melangkah maju bersamamu di hatiku.
              </p>
            </div>

            {/* Interactive Decision Button Grid */}
            <div className="mt-8 flex flex-col items-center gap-4 relative min-h-[140px] justify-center">
              
              {/* Trigger "Mau / Accept" Option */}
              <motion.button
                id="btn-proposal-accept"
                onClick={onAccept}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-xs relative bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4.5 px-8 rounded-2xl shadow-xl shadow-rose-300/45 hover:shadow-rose-400/60 transition-all duration-200 text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer z-20"
              >
                <Heart className="w-5 h-5 fill-white text-rose-500 animate-heartbeat" />
                <span>MAU! MAU BANGET! 🥰</span>
              </motion.button>

              {/* Magical Repelling "Tidak / Rejection" Option */}
              <motion.button
                id="btn-proposal-reject"
                onMouseEnter={handleRepelNoButton}
                onMouseMove={handleRepelNoButton}
                onTouchStart={handleRepelNoButton}
                onFocus={handleRepelNoButton}
                onClick={handleRepelNoButton}
                animate={isMoved ? {
                  x: `${noPosition.x}vw`,
                  y: `${noPosition.y}px`,
                  scale: 0.9
                } : {}}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 25
                }}
                className={`absolute select-none py-3.5 px-6 rounded-xl text-xs font-semibold tracking-wider cursor-pointer border ${
                  isMoved 
                    ? 'bg-rose-50/90 text-rose-600 border-rose-200/70 shadow-lg shadow-rose-200/20 z-30' 
                    : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                }`}
                style={!isMoved ? { position: 'relative' } : {}}
              >
                {noText}
              </motion.button>

            </div>

            {/* Cute bottom safety notice */}
            <div className="flex justify-center items-center gap-1.5 mt-4 text-[10px] text-gray-400 font-medium italic">
              <Smile className="w-3.5 h-3.5 text-rose-400" />
              <span>Satu-satunya pilihanmu hanya kebahagiaan sejati!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
