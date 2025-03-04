//packages/frontend/components/Header.tsx
import React from 'react';
import { Menu } from '@headlessui/react';

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  return (
    <header className="relative z-10 flex justify-between items-center p-4 bg-white shadow">
      <button onClick={() => setIsSidebarOpen(true)} className="text-2xl">☰</button>
      <div className="text-2xl font-bold"><span className="text-red-500">UNI PI</span> GAMES</div>
      <Menu as="div" className="relative">
        <Menu.Button>
          <img src="/profile-icon.png" alt="User" className="w-8 h-8 rounded-full" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1">
          {['Deposit', 'Withdraw', 'Settings', 'Sign Out'].map((item) => (
            <Menu.Item key={item}>
              {({ active }) => (
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    active ? 'bg-gray-100' : ''
                  }`}
                >
                  {item}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Menu>
    </header>
  );
};

export default Header;