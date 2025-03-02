// plugins/games/some-game/SomeGameComponent.tsx
import React from 'react';

const SomeGameComponent = () => {
  return (
    <div style={{ padding: '20px', border: '2px solid blue', borderRadius: '8px' }}>
      <h3>This is Some Game</h3>
      <p>Game content goes here...</p>
      <button onClick={() => alert('Game action!')}>Play</button>
    </div>
  );
};

export default SomeGameComponent;