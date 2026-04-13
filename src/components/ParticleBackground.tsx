import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;       // % from left
  size: number;    // px
  duration: number; // seconds
  delay: number;   // seconds
  opacity: number;
}

interface ParticleBackgroundProps {
  accentColor?: string;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function ParticleBackground({ accentColor = '#818cf8' }: ParticleBackgroundProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3) * 100,
      size: 2 + seededRandom(i * 7) * 4,
      duration: 6 + seededRandom(i * 11) * 10,
      delay: seededRandom(i * 13) * -15,
      opacity: 0.15 + seededRandom(i * 17) * 0.35,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Radial gradient backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${accentColor}18 0%, transparent 70%)`,
      }} />

      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 ${p.size * 2}px ${accentColor}`,
          }}
          animate={{
            y: [0, -(window.innerHeight + 40)],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
