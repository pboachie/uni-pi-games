import React from 'react';

interface PiWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PiWalletModal({ isOpen, onClose }: PiWalletModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Pi Wallet</h2>
        {/* ...wallet content... */}
        <p>This is where your Pi Wallet will be implemented.</p>
        <button onClick={onClose} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
