import React, { useEffect, useRef, useState } from 'react';
import { LyricLine } from '../types';
import { Volume2, VolumeX, Music, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Live custom Westlife "Beautiful in White" style lyrics sync
const ROMANTIC_LYRICS: LyricLine[] = [
  { time: 0, en: "🎶 Soft romantic melody is starting... ✨", id: "🎶 Alunan melodi romantis dimulai... ✨" },
  { time: 5, en: "Not sure if you know this, but when we first met...", id: "Mungkin kamu belum tahu, tapi saat kita pertama berjumpa..." },
  { time: 10, en: "I got so nervous, I couldn't speak...", id: "Aku sangat gugup, hingga lidahku kaku..." },
  { time: 15, en: "In that very moment, I found the one...", id: "Tepat di detik itu, aku tahu telah menemukan belahan jiwaku..." },
  { time: 21, en: "And my life had just begun...", id: "Dan hidupku yang sebenarnya baru saja dimulai..." },
  { time: 26, en: "You look so beautiful in white...", id: "Kamu terlihat begitu cantik berbalut gaun putih..." },
  { time: 31, en: "And from now till my very last breath...", id: "Dan mulai detik ini hingga hembusan nafas terakhirku..." },
  { time: 36, en: "I will love you and hold you...", id: "Aku akan selalu mencintaimu dan mendekap jiwamu..." },
  { time: 41, en: "And as long as I live I will love you...", id: "Dan sepanjang hidupku, hanya kamu yang akan kucinta..." },
  { time: 46, en: "💖 Yes, with all of my heart... 💖", id: "💖 Ya, dengan seluruh segenap jiwaku... 💖" },
  { time: 52, en: "So please, walk with me into this journey...", id: "Jadi maukah kamu melangkah bersamaku di perjalanan ini..." },
  { time: 58, en: "💖 Forever and always. 💖", id: "💖 Selamanya dan untuk selamanya. 💖" }
];

interface AudioLyricsPlayerProps {
  isPlaying: boolean;
}

export default function AudioLyricsPlayer({ isPlaying }: AudioLyricsPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

  // Play and progressive volume fade-in
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.volume = 0;
      audio.play().catch((err) => {
        console.warn('Audio play request interrupted/prevented by browser security:', err);
      });

      // Gradually fade-in audio volume to 0.70 over 3 seconds
      let vol = 0;
      const fadeInterval = setInterval(() => {
        vol += 0.05;
        if (vol >= 0.7) {
          audio.volume = 0.7;
          clearInterval(fadeInterval);
        } else {
          audio.volume = vol;
        }
      }, 200);

      return () => clearInterval(fadeInterval);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync lyrics to audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Find matched lyric according to index bounds
      let matchedIndex = 0;
      for (let i = 0; i < ROMANTIC_LYRICS.length; i++) {
        if (time >= ROMANTIC_LYRICS[i].time) {
          matchedIndex = i;
        } else {
          break;
        }
      }
      setCurrentLyricIndex(matchedIndex);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const activeLyric = ROMANTIC_LYRICS[currentLyricIndex] || ROMANTIC_LYRICS[0];

  return (
    <div className="w-full relative z-30 select-none">
      {/* Hidden audio element loading beautiful, fast preview CDN stream */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3"
        loop
      />

      {/* Floating Mini Controller at the top-right margins */}
      <div className="fixed top-4 right-4 z-40 bg-white/75 backdrop-blur-md border border-rose-100 px-3 py-2 rounded-full shadow-md flex items-center gap-3.5">
        <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-xs tracking-wide">
          <Music className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Westlife - Beautiful in White</span>
          <span className="sm:hidden font-display">Special Song</span>
        </div>

        {/* Pulsing visualizer bars */}
        {isPlaying && !isMuted && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-[2px] bg-rose-400 h-2 animate-bounce rounded-full" />
            <span className="w-[2px] bg-rose-500 h-3 animate-bounce rounded-full delay-100" />
            <span className="w-[2px] bg-rose-450 h-1.5 animate-bounce rounded-full delay-300" />
          </div>
        )}

        <button
          onClick={toggleMute}
          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full transition cursor-pointer"
          id="btn-toggle-mute"
          title={isMuted ? 'Buka Suara' : 'Senyap'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Subtitles Overlay Panel (displayed nicely below primary interactive content) */}
      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={currentLyricIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg mx-auto bg-rose-950/60 backdrop-blur-xl border border-rose-500/10 p-5 rounded-2xl shadow-xl text-center space-y-2 relative"
            id="lyrics-subtitles-bar"
          >
            {/* Ambient small pulsing heart signifiers */}
            <div className="absolute top-2 left-4 text-rose-400/20">
              <Heart className="w-6 h-6 animate-pulse-slow fill-current" />
            </div>

            {/* English original lyric line */}
            <p className="font-display font-medium text-pink-100 text-sm sm:text-base leading-relaxed tracking-wide">
              {activeLyric.en}
            </p>
            
            {/* Indonesian translation */}
            <p className="font-sans text-[11px] sm:text-xs text-rose-200/70 font-semibold italic">
              {activeLyric.id}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
