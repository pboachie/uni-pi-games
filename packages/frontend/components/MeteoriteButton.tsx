import React, { useState } from 'react';
import ExplosionParticles from './ExplosionParticles';

interface MeteoriteButtonProps {
  disabled: boolean;
  onClick: () => void;
}

const MeteoriteButton: React.FC<MeteoriteButtonProps> = ({ disabled, onClick }) => {
  const [showExplosion, setShowExplosion] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleClick = () => {
    setShowExplosion(true);
    // After 600ms, hide explosion and show "Fetching data..."
    setTimeout(() => {
      setShowExplosion(false);
      setFetching(true);
      // After 2 seconds, trigger login action and reset fetching state
      setTimeout(() => {
        setFetching(false);
        onClick();
      }, 2000);
    }, 220);
  };

  return (
    <div className="relative flex justify-center items-center">
      {/* Hide button text if explosion is active or fetching */}
      {!showExplosion && !fetching && (
        <button
          disabled={disabled}
          onClick={handleClick}
          className="meteorite-button"
        >
          Login with Pi
        </button>
      )}
      {/* Render nothing when explosion is active */}
      {showExplosion && <ExplosionParticles />}
      {fetching && (
        <div className="text-white text-xl font-bold">
          Fetching data...
        </div>
      )}
    </div>
  );
};

export default MeteoriteButton;