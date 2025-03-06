//packages/frontend/components/SpaceSpeedContext.tsx
import { createContext, useContext, ReactNode } from 'react';

interface SpaceSpeedContextType {
  spaceSpeed: number;
}

const SpaceSpeedContext = createContext<SpaceSpeedContextType | undefined>(undefined);

export const SpaceSpeedProvider: React.FC<{ value: SpaceSpeedContextType; children: ReactNode }> = ({ value, children }) => (
  <SpaceSpeedContext.Provider value={value}>
    {children}
  </SpaceSpeedContext.Provider>
);

export const useSpaceSpeed = (): SpaceSpeedContextType => {
  const context = useContext(SpaceSpeedContext);
  if (!context) {
    throw new Error('useSpaceSpeed must be used within a SpaceSpeedProvider');
  }
  return context;
};