import { useEffect } from "react";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import PageLoader from "../components/PageLoader";
import "../styles/globals.css";
import "../styles/responsiveness.css";

export default function App({ Component, pageProps }: AppProps) {
  // Add any global app initializations here
  useEffect(() => {
    // Remove the server-side injected CSS (for Material-UI or other libraries)
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <PageLoader />
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
