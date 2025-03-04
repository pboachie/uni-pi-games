import React, { useState } from 'react';
import ExplosionParticles from './ExplosionParticles';

interface MeteoriteButtonProps {
  disabled: boolean;
  onClick: () => void;
}

const MeteoriteButton: React.FC<MeteoriteButtonProps> = ({ disabled, onClick }) => {
  const [showExplosion, setShowExplosion] = useState(false);

  const handleClick = () => {
    setShowExplosion(true);
    setTimeout(() => setShowExplosion(false), 3000); // Reset after 3s
  };

  return (
    <div className="relative flex justify-center items-center">
      <button
        disabled={disabled}
        onClick={handleClick}
        className="meteorite-button"
      >
        Login with Pi
      </button>
      {showExplosion && <ExplosionParticles />}
    </div>
  );
};

export default MeteoriteButton;