import React, { useEffect, useRef } from 'react';

export interface ConfettiTrigger {
  id: number;
  x?: number;
  y?: number;
  intensity?: 'task' | 'grand';
}

interface ConfettiBurstProps {
  trigger: ConfettiTrigger | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  vr: number;
  tiltAngle: number;
  tiltSpeed: number;
  alpha: number;
  decay: number;
  shape: 'rect' | 'circle';
}

const PALETTE = [
  '#22d3ee', // cyan
  '#34d399', // emerald
  '#a855f7', // violet
  '#fbbf24', // amber
  '#38bdf8', // sky
  '#fb7185', // rose
];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const originX = trigger.x ?? width * 0.5;
    const originY = trigger.y ?? height * 0.45;
    const isGrand = trigger.intensity === 'grand';

    const spawn = (ox: number, oy: number, count: number, baseAngle: number, spread: number, speedMin: number, speedMax: number) => {
      for (let i = 0; i < count; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * spread;
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        particlesRef.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 6 + Math.random() * 5,
          h: 4 + Math.random() * 4,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.22,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: 0.08 + Math.random() * 0.08,
          alpha: 1,
          decay: isGrand ? 0.009 + Math.random() * 0.006 : 0.013 + Math.random() * 0.008,
          shape: Math.random() > 0.22 ? 'rect' : 'circle',
        });
      }
    };

    if (isGrand) {
      spawn(originX, originY, 55, -Math.PI / 2, Math.PI * 0.85, 6, 15);
      spawn(width * 0.2, height * 0.72, 35, -Math.PI / 3, Math.PI * 0.42, 8, 17);
      spawn(width * 0.8, height * 0.72, 35, (-2 * Math.PI) / 3, Math.PI * 0.42, 8, 17);
    } else {
      spawn(originX, originY, 48, -Math.PI / 2, Math.PI * 0.9, 5, 13);
    }

    const step = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      if (
        canvas.width !== Math.floor(currentWidth * dpr) ||
        canvas.height !== Math.floor(currentHeight * dpr)
      ) {
        canvas.width = Math.floor(currentWidth * dpr);
        canvas.height = Math.floor(currentHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, currentWidth, currentHeight);

      const nextParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.32; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.tiltAngle += p.tiltSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02 || p.y > currentHeight + 30) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const flutter = Math.cos(p.tiltAngle);
          ctx.fillRect(-p.w / 2, (-p.h * flutter) / 2, p.w, Math.max(1.5, Math.abs(p.h * flutter)));
        }
        ctx.restore();

        nextParticles.push(p);
      }

      particlesRef.current = nextParticles;
      if (nextParticles.length > 0) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, currentWidth, currentHeight);
        rafRef.current = null;
      }
    };

    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(step);
    }
  }, [trigger]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none w-full h-full"
    />
  );
};
