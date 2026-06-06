import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppPhase } from './types';
import LandingPage from './components/LandingPage';
import WebcamTracker from './components/WebcamTracker';
import ParticleCanvas from './components/ParticleCanvas';
import ProposalPopup from './components/ProposalPopup';
import SuccessView from './components/SuccessView';
import AudioLyricsPlayer from './components/AudioLyricsPlayer';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LANDING);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [spawnPoint, setSpawnPoint] = useState<{ x: number; y: number } | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Triggered when landing page envelope is cracked open
  const handleOpenLetter = () => {
    setIsAudioPlaying(true);
    setPhase(AppPhase.TRACKING);
  };

  // Callback from MediaPipe webcam when coordinates exist
  const handleGestureDetected = (coords: { x: number; y: number } | null) => {
    if (coords) {
      setIsGestureActive(true);
      setSpawnPoint(coords);
    } else {
      setIsGestureActive(false);
      setSpawnPoint(null);
    }
  };

  const handleProceedToProposal = () => {
    setPhase(AppPhase.PROPOSAL);
  };

  const handleAcceptProposal = () => {
    setPhase(AppPhase.SUCCESS);
  };

  // Re-run standard loops
  const handleReset = () => {
    setPhase(AppPhase.LANDING);
    setIsGestureActive(false);
    setSpawnPoint(null);
    setIsAudioPlaying(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col font-sans select-none">
      
      {/* Immersive falling sakura and rose petals backdrop */}
      {/* Intensity escalates on tracking hand landmarks or inside Success celebratory phases */}
      <ParticleCanvas
        intensity={
          phase === AppPhase.SUCCESS || isGestureActive ? 'high' : 'low'
        }
        spawnPoint={spawnPoint}
      />

      {/* Synchronized Westlife Karaoke Lyrics sub-bar */}
      <AudioLyricsPlayer isPlaying={isAudioPlaying} />

      {/* Central View Switch Router */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {phase === AppPhase.LANDING && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <LandingPage onOpenLetter={handleOpenLetter} />
            </motion.div>
          )}

          {phase === AppPhase.TRACKING && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center py-8"
            >
              <WebcamTracker
                onGestureDetected={handleGestureDetected}
                isGestureActive={isGestureActive}
                onProceedToProposal={handleProceedToProposal}
              />
            </motion.div>
          )}

          {phase === AppPhase.PROPOSAL && (
            <motion.div
              key="proposal-parent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-8"
            >
              {/* Fallback to tracking UI in the background as the pop-up sits nicely over it */}
              <div className="opacity-40 pointer-events-none scale-95 blur-[2px] transition-all duration-700 w-full flex justify-center">
                <WebcamTracker
                  onGestureDetected={() => {}}
                  isGestureActive={false}
                  onProceedToProposal={() => {}}
                />
              </div>
              
              <ProposalPopup onAccept={handleAcceptProposal} />
            </motion.div>
          )}

          {phase === AppPhase.SUCCESS && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full flex justify-center py-8"
            >
              <SuccessView onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Tiny subtle watermark header, neat layout with absolutely no margin clutter, obeying Anti-AI-Slop */}
      <footer className="w-full text-center py-4 text-[10px] uppercase tracking-wider text-rose-350 z-25 font-bold relative shrink-0">
        <div id="footer-branding" className="text-rose-400/80 inline-flex items-center gap-1 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-rose-100/30">
          <span>You Spesial</span> 
          <Heart className="w-2.5 h-2.5 fill-current text-rose-500 animate-pulse" />
          <span>Made for One Heart</span>
        </div>
      </footer>
    </div>
  );
}
