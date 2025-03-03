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

  // Set initial position
  React.useEffect(() => {
    if (spriteRef.current) {
      spriteRef.current.position.set(...initialPosition);
    }
  }, [initialPosition]);

  useFrame((_, delta) => {
    const s = spriteRef.current;
    if (!s) return;
    const radius = scale[0] / 2;
    const margin = radius; // enforce a margin equal to coin radius
    // Clamp delta to avoid teleportation
    const effectiveDelta = Math.min(delta, 0.05);

    // Updated multiplier from 60 to 80 for faster movement
    s.position.x += vx.current * effectiveDelta * 80;
    s.position.y += vy.current * effectiveDelta * 80;

    // Bounce off walls (with margin)
    if (s.position.x < left + margin) {
      s.position.x = left + margin;
      vx.current = Math.abs(vx.current);
    }
    if (s.position.x > right - margin) {
      s.position.x = right - margin;
      vx.current = -Math.abs(vx.current);
    }
    if (s.position.y < bottom + margin) {
      s.position.y = bottom + margin;
      vy.current = Math.abs(vy.current);
    }
    if (s.position.y > top - margin) {
      s.position.y = top - margin;
      vy.current = -Math.abs(vy.current);
    }

    // Check coin-to-coin collisions with separation
    globalCoins.current.forEach(other => {
      if (other === s) return;
      const dx = s.position.x - other.position.x;
      const dy = s.position.y - other.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = radius * 2; // desired separation distance
      if (distance < minDist && distance > 0) {
        const overlap = (minDist - distance) / 2;
        const nx = dx / distance;
        const ny = dy / distance;
        s.position.x += nx * overlap;
        s.position.y += ny * overlap;
        vx.current *= -1;
        vy.current *= -1;
      }
    });

    // Check collision with a hard-coded "button" region and separate
    const btnRect = {
      left: -50,
      right: 50,
      top: -viewport.height / 2 + 150,
      bottom: -viewport.height / 2 + 50,
    };
    const { x, y } = s.position;
    if (x > btnRect.left && x < btnRect.right && y > btnRect.bottom && y < btnRect.top) {
      // Push the coin out toward the closest edge of the button region
      const distLeft = Math.abs(x - btnRect.left);
      const distRight = Math.abs(btnRect.right - x);
      const distBottom = Math.abs(y - btnRect.bottom);
      const distTop = Math.abs(btnRect.top - y);
      const minWall = Math.min(distLeft, distRight, distBottom, distTop);
      if (minWall === distLeft) s.position.x = btnRect.left - margin;
      else if (minWall === distRight) s.position.x = btnRect.right + margin;
      else if (minWall === distBottom) s.position.y = btnRect.bottom - margin;
      else if (minWall === distTop) s.position.y = btnRect.top + margin;
      vx.current *= -1;
      vy.current *= -1;
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
  // Adjust coin count based on device screen size
  const isMobile = viewport.width < 768;
  const numCoins = isMobile
    ? Math.floor(Math.random() * 3) + 3 // 3 to 5 on smaller screens
    : Math.floor(Math.random() * 11) + 8; // 8 to 18 on larger screens

  // Shared ref for all coin sprites
  const coinRefs = React.useRef<THREE.Sprite[]>([]);
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
      style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      onCreated={(state) => state.gl.setClearColor(0xffffff, 0)}
    >
      <CameraUpdater />
      <ambientLight intensity={0.5} />
      <Coins />
    </Canvas>
  );
};

export default BackgroundAnimation;