// packages/frontend/pages/index.tsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!loggedIn) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [loggedIn]);

  const handleLogin = () => {
    setLoggedIn(true);
    setUser({ id: '1', username: 'PiUser' });
  };

  if (!loggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-transparent">
        <BackgroundAnimation />
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