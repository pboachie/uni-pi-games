//packages/frontend/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  // Placeholder game list (replace with API data later)
  const games = ['Game 1', 'Game 2', 'Game 3', 'Game 4'];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-100 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden mb-4 text-gray-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-lg font-bold mb-4">Available Games</h2>
          <ul>
            {games.map((game) => (
              <li key={game} className="py-2 text-gray-800 hover:text-orange-500">
                {game}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;