import React, { useState } from 'react';
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

  const handleLogin = () => {
    setLoggedIn(true);
    setUser({ id: '1', username: 'PiUser' });
  };

  if (!loggedIn) {
    // Welcome page with login button; full-page background animation; no scrolling.
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-gray-100 pt-24">
        <BackgroundAnimation />
        <button
          onClick={handleLogin}
          className="z-10 bg-orange-500 text-white px-10 py-5 rounded-lg text-3xl font-bold hover:bg-orange-600"
        >
          Login with Pi
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAnimation />
      <Header setIsSidebarOpen={setIsSidebarOpen} openWalletModal={() => setIsWalletModalOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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