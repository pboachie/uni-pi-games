//packages/frontend/components/GameLoader.tsx
import React, { useState, useEffect, JSX } from 'react';

interface GameLoaderProps {
  gameName: string;
}

export default function GameLoader({ gameName }: GameLoaderProps) {
  const [plugin, setPlugin] = useState<{ render: () => JSX.Element } | null>(null);

  useEffect(() => {
    // Use dynamic import with the correct path format
    import(`plugins/games/${gameName}/index.tsx`)
      .then(mod => setPlugin(mod.default))
      .catch(err => console.error("Error loading game plugin:", err));
  }, [gameName]);

  if (!plugin) return <div>Loading game...</div>;
  return plugin.render();
}