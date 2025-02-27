import type { AppProps } from "next/app";
import "../styles/globals.css";  // ✅ Import Global Styles

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
