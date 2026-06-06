import React, { useEffect, useRef, useState } from 'react';
import { Camera as CamIcon, Sparkles, AlertCircle, Play, Heart, Gift, HelpCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebcamTrackerProps {
  onGestureDetected: (coordinates: { x: number; y: number } | null) => void;
  isGestureActive: boolean;
  onProceedToProposal: () => void;
}

export default function WebcamTracker({
  onGestureDetected,
  isGestureActive,
  onProceedToProposal,
}: WebcamTrackerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [showHelper, setShowHelper] = useState(true);
  const [detectionCount, setDetectionCount] = useState(0);

  // Check if MediaPipe scripts exist in window
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if ((window as any).Hands && (window as any).Camera) {
        setScriptsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout up to 6 seconds, if fails we will activate fallback mode automatically
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!(window as any).Hands) {
        console.warn('MediaPipe library load timed out. Running in simulation fallback mode.');
        setLoading(false);
      }
    }, 6000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Set up MediaPipe hands
  useEffect(() => {
    if (!scriptsLoaded) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    const HandsClass = (window as any).Hands;
    const CameraClass = (window as any).Camera;
    const drawConnectors = (window as any).drawConnectors;
    const drawLandmarks = (window as any).drawLandmarks;
    const handsConnection = (window as any).HAND_CONNECTIONS;

    if (!HandsClass || !CameraClass) {
      setLoading(false);
      return;
    }

    try {
      const hands = new HandsClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        setLoading(false);

        // Clear canvas
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];

          // Auto-scale canvas on detection to match video dimensions
          if (canvasElement.width !== videoElement.videoWidth) {
            canvasElement.width = videoElement.videoWidth || 640;
            canvasElement.height = videoElement.videoHeight || 480;
          }

          // Draw custom romance neon connections instead of default green dots
          ctx.save();
          // Draw connecting bones
          if (drawConnectors && handsConnection) {
            drawConnectors(ctx, landmarks, handsConnection, {
              color: 'rgba(244, 63, 94, 0.45)', // soft rose bone links
              lineWidth: 3,
            });
          }

          // Draw custom hearts on fingertips!
          landmarks.forEach((landmark: any, index: number) => {
            const x = landmark.x * canvasElement.width;
            const y = landmark.y * canvasElement.height;

            // Fingertip indices in MediaPipe are 4, 8, 12, 16, 20
            const isFingertip = [4, 8, 12, 16, 20].includes(index);

            if (isFingertip) {
              // Draw small glowing pink circle
              ctx.shadowColor = '#e11d48';
              ctx.shadowBlur = 8;
              ctx.fillStyle = '#f43f5e';
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.fill();

              // Tiny heart shape on index fingertip (8)
              if (index === 8) {
                ctx.fillStyle = '#ff1256';
                ctx.font = '14px serif';
                ctx.fillText('❤️', x - 7, y - 8);
              }
            } else {
              ctx.shadowBlur = 0;
              ctx.fillStyle = 'rgba(253, 164, 175, 0.8)';
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          });
          ctx.restore();

          // Standard middle finger landmark coordinates
          const triggerLandmark = landmarks[8]; // Index fingertips
          if (triggerLandmark) {
            // Signal gesture coordinates back up
            onGestureDetected({ x: 1 - triggerLandmark.x, y: triggerLandmark.y }); // invert x because of mirroring
            setDetectionCount((prev) => prev + 1);
          }
        } else {
          // No hand detected
          onGestureDetected(null);
        }
      });

      handsInstanceRef.current = hands;

      // Start webcam loop
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          const camera = new CameraClass(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsInstanceRef.current) {
                await handsInstanceRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          camera.start();
          cameraInstanceRef.current = camera;
          setLoading(false);
        })
        .catch((err) => {
          console.error('Camera access denied or missing device:', err);
          setPermissionError(true);
          setLoading(false);
        });
    } catch (e) {
      console.error('Failed to initialize MediaPipe Hands', e);
      setLoading(false);
    }

    return () => {
      // Cleanup loops
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (handsInstanceRef.current) {
        try {
          handsInstanceRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [scriptsLoaded]);

  // Handle simulation activation directly (when user wants fallback or has camera problems)
  const handleTriggerMockGesture = () => {
    // Mock key coordinates near the center
    onGestureDetected({ x: 0.5 + Math.random() * 0.1 - 0.05, y: 0.4 + Math.random() * 0.1 - 0.05 });
    setDetectionCount((prev) => prev + 5);
  };

  const handleStopMockGesture = () => {
    onGestureDetected(null);
  };

  return (
    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-rose-100 rounded-3xl p-6 shadow-xl shadow-rose-100/35 relative z-20 flex flex-col items-center select-none">
      
      {/* Decorative tag */}
      <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-rose-50 border border-rose-100/60 rounded-full text-rose-500 mb-4 inline-flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />
        <span>Fase 2: AI Sensor Cinta</span>
      </span>

      {/* Guide Header */}
      <div className="text-center mb-6">
        <h2 className="font-display font-extrabold text-2xl text-gray-800 tracking-tight leading-snug">
          Hai Manis, <span className="text-rose-500">Tunjukkan Jarimu</span> ✨
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
          Kamera depanmu akan mendeteksi jari atau telapak tanganmu secara langsung untuk meluncurkan efek mawar & sakura romantis.
        </p>
      </div>

      {/* The Webcam Viewport */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 border border-rose-100/80 shadow-md">
        
        {/* Mirror effect overlay for natural webcam usage */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100`}
        />

        {/* MediaPipe AR Skeleton Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 z-10"
        />

        {/* Shimmer loading mask */}
        {loading && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-md flex flex-col items-center justify-center text-rose-100 p-6 text-center z-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="mb-4"
            >
              <RefreshCw className="w-8 h-8 text-rose-400" />
            </motion.div>
            <h3 className="font-display font-semibold text-base mb-1">Menghubungkan Sensor Cinta...</h3>
            <p className="text-xs text-rose-300/80 max-w-xs">AI sedang mengunduh library deteksi jari langsung di browsermu.</p>
          </div>
        )}

        {/* Permission Blocked / Missing Camera */}
        {permissionError && (
          <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-md flex flex-col items-center justify-center text-rose-200 p-6 text-center z-20">
            <div className="bg-rose-500/15 p-4 rounded-full border border-rose-400/20 mb-4 animate-bounce">
              <AlertCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">Akses Kamera Dinonaktifkan</h3>
            <p className="text-xs text-rose-300 max-w-md leading-relaxed mb-6">
              Aplikasi ini membutuhkan akses kamera depan untuk melacak interaksi tanganmu. Jangan khawatir, kami tidak menyimpan data videomu sama sekali.
            </p>
            <button
              onClick={handleTriggerMockGesture}
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-rose-600/40 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Gunakan Simulasi Digital</span>
            </button>
          </div>
        )}

        {/* Tracking overlay states */}
        <AnimatePresence>
          {isGestureActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 border-4 border-rose-500/80 pointer-events-none z-10 flex items-center justify-center bg-rose-500/5"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="bg-rose-600/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 border border-rose-400"
              >
                <Heart className="w-4 h-4 fill-white animate-pulse" />
                <span>GERAKAN JARI TERDETEKSI!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Webcam instructional helper pop-up */}
        {showHelper && !loading && !permissionError && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-rose-100 p-3.5 rounded-xl shadow-lg z-20 flex items-start gap-3">
            <span className="p-2 bg-rose-50 text-rose-500 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            </span>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-gray-800">Petunjuk Interaksi:</h4>
              <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
                Pastikan wajahmu kelihatan jelas dan lambungkan/angkat satu jari telunjukmu ☝️ atau tunjukkan telapak tanganmu di depan kamera.
              </p>
            </div>
            <button
              onClick={() => setShowHelper(false)}
              className="text-xs text-gray-300 hover:text-gray-500 font-bold ml-auto leading-none cursor-pointer self-center"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Control panel & Proceed buttons */}
      <div className="w-full mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-rose-50/40 border border-rose-100/40 p-4 rounded-2xl">
        <div className="text-left shrink-0">
          <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isGestureActive ? 'bg-green-500 animate-ping' : 'bg-rose-400'}`} />
            Status Sensor: <span className="font-bold">{isGestureActive ? 'Terhubung (Aktif)' : 'Mencari Jari...'}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Total keajaiban romantis dipicu: <span className="font-semibold text-rose-500">{detectionCount}x</span>
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          {/* Simulation Toggle Switch */}
          <button
            onMouseDown={handleTriggerMockGesture}
            onMouseUp={handleStopMockGesture}
            onTouchStart={handleTriggerMockGesture}
            onTouchEnd={handleStopMockGesture}
            className="flex-1 sm:flex-initial bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 active:scale-[0.98] transition px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer shadow-sm flex items-center justify-center gap-1.5 selection:bg-transparent"
            title="Klik dan tahan untuk memicu efek bunga tanpa kamera!"
          >
            <Gift className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Simulasi Cinta</span>
          </button>

          {/* Proceed button (Always enabled but becomes highly emphasized when user has active tracking going) */}
          <button
            id="btn-lihat-surat"
            onClick={onProceedToProposal}
            className={`flex-1 sm:flex-initial text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
              detectionCount > 0
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-300/45 animate-pulse-slow'
                : 'bg-rose-400 hover:bg-rose-500'
            }`}
          >
            <span>Lihat Pesan Cinta</span>
            <Play className="w-3.5 h-3.5 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
