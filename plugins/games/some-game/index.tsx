// plugins/games/some-game/index.tsx
import React from 'react';
import SomeGameComponent from './SomeGameComponent';

const GamePlugin = {
  name: 'Some Game',
  render: () => <SomeGameComponent />,
};

export default GamePlugin;