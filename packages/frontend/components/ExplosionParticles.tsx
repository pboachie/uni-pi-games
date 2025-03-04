// packages/frontend/components/ExplosionParticles.tsx
import React from 'react';
import { motion } from 'framer-motion';

const ExplosionParticles: React.FC = () => {
  // Explosion particles: fast-moving, fiery debris
  const explosionParticles = Array.from({ length: 30 }, () => ({
    size: Math.random() * 6 + 3, // 3–9px
    color: `hsl(${Math.random() * 30 + 15}, 100%, 50%)`, // Yellow (45) to red (15)
    duration: Math.random() * 0.5 + 0.3, // 0.3–0.8s
    direction: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }, // Random direction
  }));

  // Smoke particles: slower, lingering smoke
  const smokeParticles = Array.from({ length: 15 }, () => ({
    size: Math.random() * 10 + 5, // 5–15px
    color: `rgba(100, 100, 100, ${Math.random() * 0.3 + 0.1})`, // Gray, 10–40% opacity
    duration: Math.random() * 2 + 1, // 1–3s
    direction: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 }, // Slower spread
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Central flash/glow */}
      <motion.div
        className="absolute w-24 h-24 bg-yellow-300 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ filter: 'blur(10px)' }}
      />
      {/* Explosion particles */}
      {explosionParticles.map((p, i) => (
        <motion.div
          key={`explosion-${i}`}
          className="absolute top-1/2 left-1/2"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: p.direction.x * 150,
            y: p.direction.y * 150,
            opacity: 0,
          }}
          transition={{ duration: p.duration }}
        />
      ))}
      {/* Smoke particles */}
      {smokeParticles.map((p, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute top-1/2 left-1/2"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 0.5 }}
          animate={{
            x: p.direction.x * 50,
            y: p.direction.y * 50,
            opacity: 0,
          }}
          transition={{ duration: p.duration, delay: 0.3 }}
        />
      ))}
    </div>
  );
};

export default ExplosionParticles;