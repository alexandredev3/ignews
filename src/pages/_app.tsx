import type { AppProps } from 'next/app';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

import '../styles/global.scss';

import { Header } from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthSessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthSessionProvider>
  );
}

export default MyApp
