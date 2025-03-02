// packages/frontend/pages/index.tsx
import React, { useState, useEffect } from 'react';
import GameLoader from '../components/GameLoader';
import { User } from 'shared';

const availableGames = ['some-game'];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  // Example: Fetch user data (implement as needed)
//   useEffect(() => { fetch('/user').then(res => res.json()).then(setUser); }, []);

//   return <div>{user ? `Welcome, ${user.username}` : 'Loading...'}</div>;
    return (
        <div>
        <h1>Uni Pi Games</h1>
        {availableGames.map((game) => (
            <div key={game}>
            <h2>{game}</h2>
            <GameLoader gameName={game} />
            </div>
        ))}
        </div>
    );
}