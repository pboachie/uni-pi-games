// packages/frontend/components/Header.tsx
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  return (
    <header className="relative z-10 flex justify-between items-center p-4 bg-white shadow">
      <button onClick={() => setIsSidebarOpen(true)} className="text-2xl">
        ☰
      </button>
      <div className="text-2xl font-bold">
        <span className="text-red-500">UNI PI</span> GAMES
      </div>
      <Menu as="div" className="relative">
        <Menu.Button className="focus:outline-none">
          <img src="/profile-icon.png" alt="User" className="w-8 h-8 rounded-full" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-[100]">
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
        </Transition>
      </Menu>
    </header>
  );
};

export default Header;
