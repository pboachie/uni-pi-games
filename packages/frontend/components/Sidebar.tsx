//packages/frontend/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  availableGames: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, availableGames }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex">
      {/* Backdrop: clicking here will close the sidebar */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      {/* Sidebar content */}
      <div className="relative z-40 w-64 bg-white p-4">
        <h2 className="text-2xl font-bold" onClick={onClose}>Menu</h2>
        <ul className="mt-4 space-y-3">
          {availableGames.map((game) => (
            <li key={game}>
              <button onClick={onClose} className="w-full text-left py-2 px-3 hover:bg-gray-200 rounded capitalize">
                {game.replace(/-/g, ' ')}
              </button>
            </li>
          ))}
          {['Withdraw', 'Settings', 'Sign Out'].map((item) => (
            <li key={item}>
              <button onClick={onClose} className="w-full text-left py-2 px-3 hover:bg-gray-200 rounded">
                {item}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-8 text-red-500">Close</button>
      </div>
    </div>
  );
};

export default Sidebar;