import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, Calendar, Award, Sparkles, Share2, Camera, Compass, RotateCcw } from 'lucide-react';

interface SuccessViewProps {
  onReset: () => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export default function SuccessView({ onReset }: SuccessViewProps) {
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Romance Names State
  const [senderName, setSenderName] = useState("Sayangku");
  const [receiverName, setReceiverName] = useState("Cintaku");
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Real-time counter of relationship starting from now / anniversary
  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(anniversaryDate).getTime();
      const difference = Math.max(0, now - start);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimePassed({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [anniversaryDate]);

  // Fireworks Animation Engine on success canvas
  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let listFire: { x: number; y: number; color: string; particles: FireworkParticle[] }[] = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#f43f5e', '#e11d48', '#fda4af', '#f43f5e', '#ff007f', '#a855f7', '#6366f1', '#fabad0'];

    function createFirework() {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.4) + height * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particles: FireworkParticle[] = [];

      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: Math.random() * 2.5 + 1.5
        });
      }

      listFire.push({ x, y, color, particles });
    }

    let animationFrameId: number;
    let spawnTimer = 0;

    const loop = () => {
      ctx.fillStyle = 'rgba(3, 0, 30, 0.12)'; // faint black-purple trail for gorgeous contrast
      ctx.fillRect(0, 0, width, height);

      spawnTimer++;
      if (spawnTimer % 35 === 0 && listFire.length < 8) {
        createFirework();
      }

      listFire.forEach((fire, fIdx) => {
        let activeParticles = 0;

        fire.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // gravity force
          p.alpha -= 0.012; // fade force

          if (p.alpha > 0) {
            activeParticles++;
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        // Remove firework once all particles fade
        if (activeParticles === 0) {
          listFire.splice(fIdx, 1);
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    // Spawn 3 instant fireworks for instant entry impact
    for (let index = 0; index < 3; index++) {
      createFirework();
    }
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cosmic-grid font-sans text-white px-4 py-12 flex flex-col items-center relative overflow-x-hidden select-none">
      
      {/* Absolute fullscreen firework canvas overlay */}
      <canvas
        ref={fireworksCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      <div className="w-full max-w-xl z-10 flex flex-col items-center text-center">
        
        {/* Glowing Hearts Ring Banner */}
        <motion.div
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative w-36 h-36 mb-6 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-2xl p-2 border-4 border-rose-100"
        >
          <Heart className="w-20 h-20 fill-white text-rose-500 animate-heartbeat" />
          
          <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 rounded-full text-xs font-black px-2.5 py-1 uppercase tracking-wide rotate-12 shadow-md flex items-center gap-1 border border-yellow-200">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Accepted</span>
          </div>
        </motion.div>

        {/* Triumphant message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display font-black text-4xl sm:text-5xl text-rose-400 tracking-tight leading-none uppercase drop-shadow-lg">
            Yeay! Kita Jadian! 💖
          </h1>
          <p className="text-pink-200/80 max-w-sm mx-auto text-sm mt-3 font-medium leading-relaxed">
            Terima kasih sudah memilihku untuk mengisi hari-hari indahmu. Aku janji akan selalu menjaga hatimu dengan penuh kasih.
          </p>
        </motion.div>

        {/* Live Relationship Counter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 mt-8 max-w-md shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-xs font-bold tracking-wider text-rose-300 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Hari Bahagia Kita</span>
            </span>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="bg-transparent border border-white/10 rounded px-2 py-0.5 text-xs text-rose-200 font-semibold cursor-pointer outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              title="Ubah tanggal jadian"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hari', val: timePassed.days },
              { label: 'Jam', val: timePassed.hours },
              { label: 'Menit', val: timePassed.minutes },
              { label: 'Detik', val: timePassed.seconds }
            ].map((unit, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <span className="font-display font-black text-2xl sm:text-3xl text-rose-300 drop-shadow-sm min-w-[45px]">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Digital Love Certificate */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative border-8 border-rose-50 mt-8 text-left overflow-hidden flex flex-col"
          id="digital-certificate-section"
        >
          {/* Certificate watermarked seals */}
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-rose-50 rounded-full -z-10 opacity-60"></div>
          <div className="absolute bottom-4 right-4 text-rose-50/70 p-4 shrink-0 -z-10 pointer-events-none">
            <Heart className="w-56 h-56 stroke-[1.5]" />
          </div>

          <div className="text-center border-b-2 border-dashed border-rose-100 pb-5 mb-5 relative">
            <Award className="w-8 h-8 text-rose-500 mx-auto mb-2 drop-shadow-sm" />
            <h2 className="font-display font-extrabold text-xl text-slate-800 tracking-tight">Sertifikat Cinta Sejati</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Nomor Registrasi: 001/CINTA/YOU-SPESIAL</p>
          </div>

          {/* Certificate body text */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p className="text-center italic">Dengan ini menyatakan secara romantis dan penuh kebahagiaan bahwa:</p>
            
            {/* Form interaction: click to customize names! */}
            {!isEditingNames ? (
              <div 
                onClick={() => setIsEditingNames(true)} 
                className="my-5 p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-slate-100 flex flex-col items-center cursor-pointer transition text-center"
                id="certificate-names-trigger"
                title="Klik untuk mengubah nama!"
              >
                <div className="font-display font-black text-xl text-rose-600 tracking-tight leading-none">
                  {senderName}
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest my-1.5">MENCINTAI SEPENUH HATI & MELINDUNGI</div>
                <div className="font-display font-black text-xl text-rose-600 tracking-tight leading-none">
                  {receiverName}
                </div>
                <span className="text-[9px] text-rose-400 font-medium underline mt-2">Diedit. Klik untuk ubah nama</span>
              </div>
            ) : (
              <div className="my-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 z-20 relative">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Kamu (Pemberi Cinta)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Masukkan Namamu"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Pasangan (Penerima Cinta)</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Masukkan Nama Dia"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-rose-400"
                  />
                </div>
                <button
                  onClick={() => setIsEditingNames(false)}
                  className="w-full bg-rose-500 text-white font-bold text-xs py-2 rounded-xl hover:bg-rose-600 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            )}

            <p className="text-center text-[11px] leading-normal italic text-slate-500">
              Mulai detik ini, kedua belah belahan jiwa sepakat untuk saling memberi kabar, melarang tidur dalam keadaan marah, serta selalu menghargai waktu bersinar bersama.
            </p>
          </div>

          {/* Certificate Footer Signature Block */}
          <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-100">
            <div className="text-center w-1/2">
              <div className="h-10 flex items-center justify-center italic text-rose-500 font-bold font-display text-sm">
                Signed with Love 💖
              </div>
              <div className="border-t border-slate-300 w-32 mx-auto pt-1">
                <p className="text-[10px] font-bold text-slate-500 leading-none">{senderName}</p>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">Pihak Pertama</p>
              </div>
            </div>

            <div className="text-center w-1/2">
              <div className="h-10 flex items-center justify-center italic text-rose-500 font-bold font-display text-sm">
                Accepted with Hugs 🥰
              </div>
              <div className="border-t border-slate-300 w-32 mx-auto pt-1">
                <p className="text-[10px] font-bold text-slate-500 leading-none">{receiverName}</p>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">Pihak Kedua</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info card footer actions */}
        <div className="mt-8 flex gap-3 text-xs w-full max-w-sm">
          <button
            onClick={() => {
              // Custom alert asking them to screenshot directly since iframe environment has security constraints with downloads
              alert("Selamat ya! ❤️ Silakan ambil tangkapan layar (screenshot/printscreen) halaman ini atau sertifikat di atas untuk dibagikan ke media sosial atau disimpan di galeri laptop/HPmu!");
            }}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-semibold cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-rose-450" />
            <span>Cara Simpan</span>
          </button>

          <button
            onClick={onReset}
            className="flex-1 bg-white hover:bg-rose-50 text-rose-600 py-3 px-4 rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Mulai Ulang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
