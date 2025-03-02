//packages/frontend/components/GameLoader.tsx
import React, { Suspense } from 'react';

const loadGame = (gameName: string) =>
  React.lazy(() => import(gameName).then((module) => ({ default: module.default.render })));

const GameLoader = ({ gameName }: { gameName: string }) => {
  const GameComponent = loadGame(gameName);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameComponent />
    </Suspense>
  );
};

export default GameLoader;