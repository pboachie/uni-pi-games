//packages/frontend/pages/_app.tsx

import React from 'react';
import '../styles/globals.css';
import '../styles/custom-responsive.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
