import React, { useState, useEffect } from 'react';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import PiWalletModal from 'components/PiWalletModal';
import GameLoader from 'components/GameLoader';
import BackgroundAnimation from 'components/BackgroundAnimation';
import { User } from 'shared/src/types';

const availableGames = ['some-game'];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
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
        {/* Background Animation with PI Coins */}
        <BackgroundAnimation />
        {/* Logo at the Top with increased z-index and dynamic responsive title */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-20">
          <div className="text-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider">
            UNI PI GAMES
          </div>
        </div>
        {/* Login Button*/}
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="mt-[50vh] sm:mt-[50vh] md:mt-[50vh]">
            <button
              onClick={handleLogin}
              className="z-10 bg-white text-orange-500 px-6 py-3 sm:px-10 sm:py-5 rounded-lg text-2xl sm:text-3xl font-sans font-bold hover:bg-gray-100 shadow-md"
            >
              Login with Pi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAnimation />
      <Header setIsSidebarOpen={setIsSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} availableGames={availableGames}/>
      <PiWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {availableGames.map((game) => (
          <div key={game} className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl mb-2 capitalize">{game.replace(/-/g, ' ')}</h2>
            <GameLoader gameName={game} />
          </div>
        ))}
      </main>
    </div>
  );
}