import type { AppProps } from "next/app";
<<<<<<< Updated upstream
import { ClerkProvider } from "@clerk/nextjs";
=======
>>>>>>> Stashed changes
import "../styles/globals.css";  

export default function App({ Component, pageProps }: AppProps) {
  return(
  <ClerkProvider {...pageProps}>
   <Component {...pageProps} />
   </ClerkProvider>
  );
}
