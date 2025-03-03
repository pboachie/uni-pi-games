//packages/frontend/components/BackgroundAnimation.tsx
import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface PiSpriteProps {
  position: [number, number, number];
  speed: number;
  amplitude: number;
}

const PiSprite: React.FC<PiSpriteProps> = ({ position, speed, amplitude }) => {
  const spriteRef = useRef<THREE.Sprite>(null);

  useFrame(() => {
    if (spriteRef.current) {
      spriteRef.current.position.y = position[1] + Math.sin(Date.now() * speed) * amplitude;
    }
  });

  const texture = useLoader(THREE.TextureLoader, '/pi-symbol.png');

  return (
    <sprite ref={spriteRef} position={position} scale={[0.5, 0.5, 1]}>
      <spriteMaterial map={texture} color="#FF6B35" transparent opacity={0.2} />
    </sprite>
  );
};

const BackgroundAnimation = () => {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    >
      <ambientLight intensity={0.5} />
      {Array.from({ length: 5 }, (_, i) => {
        const speed = Math.random() * 0.001 + 0.0005;
        const amplitude = Math.random() * 0.5 + 0.2;
        return (
          <PiSprite
            key={i}
            position={[Math.random() * 10 - 5, Math.random() * 10 - 5, -5]}
            speed={speed}
            amplitude={amplitude}
          />
        );
      })}
    </Canvas>
  );
};

export default BackgroundAnimation;