//packages/frontend/components/Header.tsx
import React from 'react';
import { Menu } from '@headlessui/react';

interface HeaderProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  return (
    <nav className="bg-orange-500 p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-white font-retro text-2xl tracking-wider">
        Uni Pi Games
      </div>

      {/* Right side: Hamburger (mobile) + User Menu */}
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden text-white focus:outline-none"
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
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* User Menu Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="focus:outline-none">
            <img
              src="/profile-icon.png" // Replace with your profile icon
              alt="Profile"
              className="w-8 h-8 rounded-full bg-white"
            />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1">
            {['Deposit', 'Withdraw', 'Settings', 'Sign Out'].map((item) => (
              <Menu.Item key={item}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-orange-500 text-white' : 'text-gray-900'
                    } block w-full text-left px-4 py-2 text-sm`}
                  >
                    {item}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default Header;