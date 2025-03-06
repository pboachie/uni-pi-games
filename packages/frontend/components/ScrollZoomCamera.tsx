// packages/frontend/components/ScrollZoomCamera.tsx
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpaceSpeedProvider } from './SpaceSpeedContext';

interface ScrollZoomCameraProps {
  children: ReactNode;
}

const ScrollZoomCamera: React.FC<ScrollZoomCameraProps> = ({ children }) => {
  const { camera } = useThree();
  const [spaceSpeed, setSpaceSpeed] = useState<number>(1);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 50)); // Starting position
  const currentPosition = useRef(new THREE.Vector3(0, 0, 50));
  const velocity = useRef(new THREE.Vector3(0, 0, 0)); // 3D for X, Y, Z inertia
  const lastSpeedUpdate = useRef<number>(Date.now());
  const touchStartDistance = useRef<number | null>(null);
  const touchCenter = useRef<THREE.Vector2 | null>(null);
  const isInteracting = useRef(false);

  // Throttle speed changes for smoothness (from old version)
  const throttleSpeedChange = (newSpeed: number) => {
    const now = Date.now();
    if (now - lastSpeedUpdate.current > 50) {
      setSpaceSpeed((prev) => {
        const diff = newSpeed - prev;
        const smoothChange = diff * 0.1; // Gradual adjustment
        return Math.max(0.5, Math.min(5, prev + smoothChange));
      });
      lastSpeedUpdate.current = now;
    }
  };

  // Event handlers
  useEffect(() => {
    // Wheel handler (desktop)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      isInteracting.current = true;
      const scrollIntensity = Math.abs(e.deltaY) / 100;
      const scrollDelta = e.deltaY * 0.5; // Increased from 0.1 for faster response
      targetPosition.current.z -= scrollDelta;
      // targetPosition.current.z = Math.max(-900, Math.min(50, targetPosition.current.z));
      velocity.current.z = -scrollDelta * 10; // Add inertia (tuned for feel)
      throttleSpeedChange(e.deltaY > 0 ? 1 + scrollIntensity : Math.max(0.5, 1 - scrollIntensity / 2));
    };

    // Touch handlers (mobile pinch-to-zoom)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isInteracting.current = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
        touchCenter.current = new THREE.Vector2(
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistance.current !== null && touchCenter.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const pinchRatio = currentDistance / touchStartDistance.current;
        const pinchDelta = (pinchRatio - 1) * 200; // Increased sensitivity
        targetPosition.current.z -= pinchDelta;
        // targetPosition.current.z = Math.max(-900, Math.min(50, targetPosition.current.z));
        velocity.current.z = -pinchDelta * 5; // Add inertia for pinch
        throttleSpeedChange(pinchRatio > 1 ? 1 + pinchRatio - 1 : Math.max(0.5, 1 - (pinchRatio - 1)));

        // Optional: Move X/Y based on pinch center
        const newCenter = new THREE.Vector2(
          (e.touches[0].clientX + e.touches[1].clientX) / 2,
          (e.touches[0].clientY + e.touches[1].clientY) / 2
        );
        const moveSpeed = 0.05;
        targetPosition.current.x += (touchCenter.current.x - newCenter.x) * moveSpeed;
        targetPosition.current.y -= (touchCenter.current.y - newCenter.y) * moveSpeed;

        touchStartDistance.current = currentDistance;
        touchCenter.current = newCenter;
      }
    };

    const handleTouchEnd = () => {
      isInteracting.current = false;
      touchStartDistance.current = null;
      touchCenter.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Animation with inertia
  useFrame((_, delta) => {
    if (!isInteracting.current) {
      targetPosition.current.addScaledVector(velocity.current, delta);
      velocity.current.multiplyScalar(0.95); // Damping for inertia
      if (velocity.current.lengthSq() < 0.01) velocity.current.set(0, 0, 0);
    }
    // targetPosition.current.z = Math.max(-900, Math.min(50, targetPosition.current.z));
    targetPosition.current.z -= delta * (spaceSpeed - 1) * 10; 
    currentPosition.current.lerp(targetPosition.current, 0.1); // Smooth transition
    camera.position.copy(currentPosition.current);

    // Optional: Gradually reset speed when not interacting
    if (!isInteracting.current && Math.abs(spaceSpeed - 1) > 0.05) {
      setSpaceSpeed((prev) => (prev > 1 ? prev - 0.05 : prev + 0.05));
    }
  });

  return (
    <SpaceSpeedProvider value={{ spaceSpeed }}>
      {children}
    </SpaceSpeedProvider>
  );
};

export default ScrollZoomCamera;