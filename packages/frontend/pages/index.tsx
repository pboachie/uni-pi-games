//packages/frontend/pages/index.tsx
import React, { useState } from 'react';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import PiWalletModal from 'components/PiWalletModal';
import GameLoader from 'components/GameLoader';
import BackgroundAnimation from 'components/BackgroundAnimation';
import PiAuthentication from 'components/PiAuthentication';
import { User } from 'shared/src/types';
import jwt from 'jsonwebtoken';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';

// Define props type to include initialUser
type HomeProps = {
  initialLoggedIn: boolean;
  initialUser: User | null;
};

const availableGames = ['some-game'];

export default function Home({ initialLoggedIn, initialUser }: HomeProps) {
  const [loggedIn, setLoggedIn] = useState<boolean>(initialLoggedIn);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(initialUser);

  // Callback triggered once authentication completes
  const handleAuthentication = (isAuth: boolean, userData: any) => {
    if (isAuth && userData) {
      setLoggedIn(true);
      setUser({ id: userData.uid, username: userData.username || 'PiUser' });
    } else {
      setLoggedIn(false);
      setUser(null);
    }
  };

  const handleBalanceUpdate = (updatedBalance: number) => {
    console.log('Updated Balance:', updatedBalance);
  };

  if (!loggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-transparent">
        <BackgroundAnimation enableControls={true} />
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-20">
          <div className="text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider">
            <center>
              WEL<span className="text-red-500">COME</span>
              <br />
              <span className="text-red-500">TO</span>
              <br />
              <span className="text-red-500">UNI PI </span>GAMES
            </center>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-screen mt-[20vh]">
          <PiAuthentication
            onAuthentication={handleAuthentication}
            isAuthenticated={loggedIn}
            onBalanceUpdate={handleBalanceUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundAnimation enableControls={false} />
      <Header setIsSidebarOpen={setIsSidebarOpen} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        availableGames={availableGames}
      />
      <PiWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {availableGames.map((game) => (
          <div key={game} className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl mb-2 capitalize">{game.replace(/-/g, ' ')}</h2>
            <GameLoader gameName={game} />
          </div>
        ))}
      </main>
    </div>
  );
}

interface JwtDecoded {
  uid: string;
  username?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = cookie.parse(context.req.headers.cookie || "");
  const token = cookies.token;
  console.log('Token:', token);
  if (token) {
    try {
      console.log('Verifying JWT...');
      const decoded = jwt.verify(
        token,
        process.env.JWT_PUBLIC_KEY || 'your-public-key-here',
        { algorithms: ['ES256'] }
      ) as JwtDecoded;
      console.log('Decoded JWT:', decoded);
      const user = {
        id: decoded.uid,
        username: decoded.username || 'PiUser',
      };
      console.log('User:', user);
      return {
        props: {
          initialLoggedIn: true,
          initialUser: user,
        },
      };
    } catch (e) {
      return {
        props: {
          initialLoggedIn: false,
          initialUser: null,
        },
      };
    }
  }
  return {
    props: {
      initialLoggedIn: false,
      initialUser: null,
    },
  };
};