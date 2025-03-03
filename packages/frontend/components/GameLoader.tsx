//packages/frontend/components/GameLoader.tsx
import { useState, useEffect } from 'react';
import { JSX } from 'react/jsx-runtime';

interface GameLoaderProps {
  gameName: string;
}

export default function GameLoader({ gameName }: GameLoaderProps) {
  const [plugin, setPlugin] = useState<{ render: () => JSX.Element } | null>(null);

  useEffect(() => {
    import(`plugins/games/${gameName}/index.tsx`)
      .then(mod => setPlugin(mod.default))
      .catch(err => console.error("Error loading game plugin:", err));
  }, [gameName]);

  if (!plugin) return <div>Loading game...</div>;
  return plugin.render();
}