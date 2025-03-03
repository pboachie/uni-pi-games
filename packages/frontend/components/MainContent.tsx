//packages/frontend/components/MainContent.tsx
import React from 'react';

const MainContent = () => {
  // Placeholder game data (replace with API data later)
  const games = [
    { name: 'Game 1', image: '/game1.png' },
    { name: 'Game 2', image: '/game2.png' },
    { name: 'Game 3', image: '/game3.png' },
  ];

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome to Uni Pi Games
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.name}
            className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow"
          >
            <img
              src={game.image} // TODO: Dynamically replace with actual game images
              alt={game.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800">{game.name}</h2>
            <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;