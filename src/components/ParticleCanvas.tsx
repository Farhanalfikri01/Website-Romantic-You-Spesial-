import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface ParticleCanvasProps {
  intensity: 'low' | 'high';
  activeEmoji?: string;
  spawnPoint?: { x: number; y: number } | null;
}

export default function ParticleCanvas({ intensity, activeEmoji, spawnPoint }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial particles
    const initialCount = intensity === 'high' ? 80 : 30;
    particlesRef.current = [];
    for (let i = 0; i < initialCount; i++) {
      particlesRef.current.push(createParticle(Math.random() * width, Math.random() * height - height));
    }

    function createParticle(x: number, y: number, isBurst: boolean = false): Particle {
      const types: ('heart' | 'rose' | 'sakura')[] = ['heart', 'rose', 'sakura'];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        x,
        y,
        size: Math.random() * (type === 'heart' ? 18 : 12) + 6,
        speedX: (Math.random() * 2 - 1) + (isBurst ? (Math.random() * 6 - 3) : 0.5), // slight wind drift
        speedY: Math.random() * 1.5 + 1.2 + (isBurst ? -(Math.random() * 4 + 1) : 0),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 1.5 - 0.75) * 0.05,
        type,
        opacity: Math.random() * 0.4 + 0.6,
      };
    }

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Automatic spawn
      spawnTimerRef.current += 1;
      const spawnRate = intensity === 'high' ? 3 : 15;
      if (spawnTimerRef.current >= spawnRate) {
        spawnTimerRef.current = 0;
        if (particlesRef.current.length < (intensity === 'high' ? 150 : 60)) {
          particlesRef.current.push(createParticle(Math.random() * width, -20));
        }
      }

      // Spawn from specific point if provided (e.g. tracking hands)
      if (spawnPoint) {
        const px = spawnPoint.x * width;
        const py = spawnPoint.y * height;
        if (Math.random() < 0.4) {
          particlesRef.current.push(createParticle(px, py, true));
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Rose/sakura leaf fluttering logic
        if (p.type !== 'heart') {
          p.speedX += Math.sin(p.y * 0.02 + p.size) * 0.02;
        }

        // Check bounds
        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          // Recycle
          particlesRef.current[idx] = createParticle(Math.random() * width, -20);
        }

        // Draw individual particle shapes
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'heart') {
          // Draw heart svg path directly on canvas
          ctx.fillStyle = intensity === 'high' ? 'rgba(244, 63, 94, 0.9)' : 'rgba(251, 113, 133, 0.75)';
          ctx.slice ? ctx.slice() : null;
          ctx.beginPath();
          const d = p.size;
          ctx.moveTo(0, -d / 4);
          ctx.bezierCurveTo(-d / 2, -d * 0.8, -d * 1.2, -d / 3, 0, d);
          ctx.bezierCurveTo(d * 1.2, -d / 3, d / 2, -d * 0.8, 0, -d / 4);
          ctx.fill();
        } else if (p.type === 'rose') {
          // Draw a stylized rose petal (deep pink, slightly curved)
          ctx.fillStyle = 'rgba(225, 29, 72, 0.8)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Inner detail
          ctx.strokeStyle = 'rgba(190, 18, 60, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.5, 0);
          ctx.quadraticCurveTo(0, -p.size * 0.2, p.size * 0.5, 0);
          ctx.stroke();
        } else {
          // Sakura (cherry blossom petal - light pink, notched top)
          ctx.fillStyle = 'rgba(253, 164, 175, 0.85)';
          ctx.beginPath();
          ctx.moveTo(0, p.size * 0.8);
          ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.3, -p.size * 0.8, -p.size * 0.4, 0, -p.size * 0.5);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.4, p.size * 0.8, p.size * 0.3, 0, p.size * 0.8);
          ctx.fill();
          
          // Little fold line
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, p.size * 0.8);
          ctx.lineTo(0, -p.size * 0.2);
          ctx.stroke();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, spawnPoint]);

  return (
    <canvas
      id="particles-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
