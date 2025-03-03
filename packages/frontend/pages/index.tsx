// packages/frontend/pages/index.tsx
import React, { useState, useEffect } from 'react';
import GameLoader from '../components/GameLoader';
import { User } from 'shared/src/types';

const availableGames = ['some-game'];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  // Example: Fetch user data (implement as needed)
  // useEffect(() => { fetch('/user').then(res => res.json()).then(setUser); }, []);

  return (
    <div className="container mx-auto p-4 font-game">
      <h1 className="text-3xl mb-6">Uni Pi Games</h1>
      {availableGames.map((game) => (
        <div key={game} className="my-4 p-4 border rounded-lg shadow-md">
          <h2 className="text-xl mb-2 capitalize">{game.replace(/-/g, ' ')}</h2>
          <GameLoader gameName={game} />
        </div>
      ))}
    </div>
  );
}