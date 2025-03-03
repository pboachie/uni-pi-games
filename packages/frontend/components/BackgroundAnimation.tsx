import React, { useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PiSpriteProps {
  initialPosition: [number, number, number];
  scale: [number, number, number];
  globalCoins: { current: THREE.Sprite[] };
}

const PiSprite: React.FC<PiSpriteProps> = ({ initialPosition, scale, globalCoins }) => {
  const spriteRef = React.useRef<THREE.Sprite>(null);
  const { viewport } = useThree();
  const left = -viewport.width / 2;
  const right = viewport.width / 2;
  const bottom = -viewport.height / 2;
  const top = viewport.height / 2;
  const vx = React.useRef(Math.random() * 0.3 - 0.15);
  const vy = React.useRef(Math.random() * 0.3 - 0.15);
  const texture = useLoader(THREE.TextureLoader, '/pi-symbol.png');

  // Register sprite in globalCoins
  React.useEffect(() => {
    if (spriteRef.current) {
      globalCoins.current.push(spriteRef.current);
    }
    return () => {
      globalCoins.current = globalCoins.current.filter(s => s !== spriteRef.current);
    };
  }, [globalCoins]);

  // Helper: simple circle collision check
  const checkCollision = (other: THREE.Sprite) => {
    if (!spriteRef.current || !other) return;
    const posA = spriteRef.current.position;
    const posB = other.position;
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = scale[0] / 2; // use scale as proxy for size
    return distance < radius * 2;
  };

  // Set initial position
  React.useEffect(() => {
    if (spriteRef.current) {
      spriteRef.current.position.set(...initialPosition);
    }
  }, [initialPosition]);

  useFrame((_, delta) => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;
      sprite.position.x += vx.current * delta * 60;
      sprite.position.y += vy.current * delta * 60;
      // Bounce when hitting viewport boundaries
      if (sprite.position.x < left || sprite.position.x > right) {
        vx.current *= -1;
      }
      if (sprite.position.y < bottom || sprite.position.y > top) {
        vy.current *= -1;
      }
      // Check collision with other coins
      globalCoins.current.forEach(other => {
        if (other !== spriteRef.current && checkCollision(other)) {
          vx.current *= -1;
          vy.current *= -1;
        }
      });
      // Check collision with a hard-coded "button" region
      // (Assume button area: centered at bottom of screen)
      const btnRect = {
        left: -50,
        right: 50,
        top: -viewport.height / 2 + 150,
        bottom: -viewport.height / 2 + 50,
      };
      const { x, y } = sprite.position;
      if (x > btnRect.left && x < btnRect.right && y > btnRect.bottom && y < btnRect.top) {
        vx.current *= -1;
        vy.current *= -1;
      }
    }
  });

  return (
    <sprite ref={spriteRef} scale={scale}>
      {/* Increased opacity for better visibility */}
      <spriteMaterial map={texture} color="#FF6B35" transparent opacity={0.8} />
    </sprite>
  );
};

const Coins: React.FC = () => {
  const { viewport } = useThree();
  // Shared ref for all coin sprites
  const coinRefs = React.useRef<THREE.Sprite[]>([]);
  const numCoins = Math.floor(Math.random() * 11) + 5; // between 5 and 15
  return (
    <>
      {Array.from({ length: numCoins }, (_, i) => {
        const scaleVal = Math.random() * 40 + 30; // 30 to 70 pixels
        // Random x,y within the viewport bounds
        const x = Math.random() * viewport.width - viewport.width / 2;
        const y = Math.random() * viewport.height - viewport.height / 2;
        return (
          <PiSprite
            key={i}
            globalCoins={coinRefs}
            initialPosition={[x, y, -5]}
            scale={[scaleVal, scaleVal, 1]}
          />
        );
      })}
    </>
  );
};

const CameraUpdater: React.FC = () => {
  const { camera, size } = useThree();
  React.useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.left = -size.width / 2;
      camera.right = size.width / 2;
      camera.top = size.height / 2;
      camera.bottom = -size.height / 2;
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);
  return null;
};

const BackgroundAnimation: React.FC = () => {
  return (
    <Canvas
      orthographic
      camera={{ near: 0.1, far: 1000, position: [0, 0, 100] }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      onCreated={(state) => state.gl.setClearColor(0xffffff, 0)}
    >
      <CameraUpdater />
      <ambientLight intensity={0.5} />
      <Coins />
    </Canvas>
  );
};

export default BackgroundAnimation;