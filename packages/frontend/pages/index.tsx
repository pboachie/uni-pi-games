// packages/frontend/pages/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import PiWalletModal from 'components/PiWalletModal';
import GameLoader from 'components/GameLoader';
import BackgroundAnimation from 'components/BackgroundAnimation';
import MeteoriteButton from 'components/MeteoriteButton';
import { User } from 'shared/src/types';

const availableGames = ['some-game'];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [spaceSpeed, setSpaceSpeed] = useState<number>(1);
  const lastSpeedUpdate = useRef<number>(Date.now());
  const touchStartDistance = useRef<number | null>(null);

  useEffect(() => {
    if (!loggedIn) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      // Throttle function to limit speed updates for smoother transitions
      const throttleSpeedChange = (newSpeed: number) => {
        const now = Date.now();
        if (now - lastSpeedUpdate.current > 50) { // 50ms throttle
          setSpaceSpeed(prev => {
            // Smooth transition by limiting change magnitude
            const diff = newSpeed - prev;
            const smoothChange = diff * 0.1; // Take only 10% of the change for smoothness
            return Math.max(0.5, Math.min(5, prev + smoothChange));
          });
          lastSpeedUpdate.current = now;
        }
      };

      // Reset the speed gradually when user stops interacting
      const startResetInterval = () => {
        const resetInterval = setInterval(() => {
          setSpaceSpeed(prev => {
            if (Math.abs(prev - 1) < 0.05) return 1;
            return prev > 1 ? prev - 0.05 : prev + 0.05;
          });
        }, 100);
        return resetInterval;
      };

      let resetInterval = startResetInterval();

      // Handle wheel events for mouse/trackpad
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        // Calculate target speed based on scroll intensity
        const scrollIntensity = Math.abs(e.deltaY) / 100;
        const targetSpeed = e.deltaY > 0 ?
          1 + scrollIntensity : // Scrolling down = faster
          Math.max(0.5, 1 - scrollIntensity/2); // Scrolling up = slower (minimum 0.5)

        throttleSpeedChange(targetSpeed);

        // Reset the reset interval to avoid immediate decay
        clearInterval(resetInterval);
        resetInterval = startResetInterval();
      };

      // Handle touch events for mobile pinch-zoom
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          // Store initial distance between two fingers
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          touchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistance.current !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);

          // Calculate pinch/zoom ratio
          const ratio = currentDistance / touchStartDistance.current;

          // Pinch in = faster, pinch out = slower
          const targetSpeed = ratio < 1 ?
            1 + (1 - ratio) * 3 : // Pinch in (faster)
            Math.max(0.5, 1 - (ratio - 1)); // Pinch out (slower)

          throttleSpeedChange(targetSpeed);

          // Update start distance for next move
          touchStartDistance.current = currentDistance;

          // Reset the reset interval
          clearInterval(resetInterval);
          resetInterval = startResetInterval();
        }
      };

      const handleTouchEnd = () => {
        touchStartDistance.current = null;
      };

      // Add event listeners
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        clearInterval(resetInterval);
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [loggedIn]);

  const handleLogin = () => {
    setLoggedIn(true);
    setUser({ id: '1', username: 'PiUser' });
  };

  if (!loggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-transparent">
        <BackgroundAnimation spaceSpeed={spaceSpeed} />
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-20">
          <div className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider">
            <center>
              WEL<span className="text-red-500">COME</span>
              <br />
              <span className="text-red-500">TO</span>
              <br />
              <span className="text-red-500">UNI PI </span>GAMES
            </center>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-screen mt-[20vh]">
          <div className="relative">
            <MeteoriteButton disabled={false} onClick={function (): void {
              handleLogin();
            } } />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAnimation />
      <Header setIsSidebarOpen={setIsSidebarOpen} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        availableGames={availableGames}
      />
      <PiWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {availableGames.map((game) => (
          <div
            key={game}
            className="p-4 border rounded-lg shadow-md bg-white"
          >
            <h2 className="text-xl mb-2 capitalize">
              {game.replace(/-/g, ' ')}
            </h2>
            <GameLoader gameName={game} />
          </div>
        ))}
      </main>
    </div>
  );
}