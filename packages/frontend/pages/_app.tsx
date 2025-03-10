// packages/frontend/pages/_app.tsx
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import '../styles/globals.css';
import '../styles/custom-responsive.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [piSdkError, setPiSdkError] = useState(false);

  // If the script hasn’t loaded after 5s, show the error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sdkLoaded) {
        console.log('Timeout fired, sdkLoaded is still false');
        setPiSdkError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [sdkLoaded]);

  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('SDK loaded successfully');
          setSdkLoaded(true);
          setPiSdkError(false);
        }}
        onError={() => {
          console.log('Error loading SDK');
          setPiSdkError(true);
        }}
      />

      {piSdkError ? (
        <div className="error-message">
          Unable to access site. Please check your internet connection.
        </div>
      ) : !sdkLoaded ? (
        <div className="loading-message">
          <div className="loading-logo"></div>
          <div className="loading-scaffold-header"></div>
          <div className="loading-header"></div>
          <div className="loading-scaffold-sidebar"></div>
          <div className="loading-sidebar"></div>
          <div className="loading-scaffold-main"></div>
          <div className="loading-main"></div>
          <div className="loading-scaffold-footer"></div>
          <div className="loading-footer"></div>
          <div className="loading-text">Site loading...</div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;
