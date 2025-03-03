//packages/frontend/components/Sidebar.tsx
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <h2 className="text-2xl font-bold">Menu</h2>
        <ul className="mt-4 space-y-3">
          {['Withdraw', 'Settings', 'Sign Out'].map((item) => (
            <li key={item}>
              <button className="w-full text-left py-2 px-3 hover:bg-gray-200 rounded">
                {item}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-8 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
}