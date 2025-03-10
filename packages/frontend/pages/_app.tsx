//packages/frontend/pages/_app.tsx
import React from 'react';
import Script from 'next/script';
import '../styles/globals.css';
import '../styles/custom-responsive.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
