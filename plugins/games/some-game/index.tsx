// plugins/games/some-game/index.tsx
import { GamePlugin } from 'shared/src/types';
import SomeGameComponent from './SomeGameComponent';
import React from 'react';

const gamePlugin: GamePlugin = {
  name: 'Some Game',
  render: () => <SomeGameComponent />,
};
export default gamePlugin;