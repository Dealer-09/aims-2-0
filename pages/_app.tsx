import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css'; // ✅ Ensure global styles load
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* ✅ Load Boxicons & Other Styles */}
        <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
