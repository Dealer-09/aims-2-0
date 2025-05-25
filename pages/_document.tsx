import { Html, Head, Main, NextScript } from "next/document";
export default function Document() {
  return (
    <Html lang="en">      <Head>
        {/* Essential viewport meta tag for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Meta tags for better SEO and social sharing */}
        <meta name="description" content="AIMS - Amit Institute of Math's and Science. Join our science institute for quality education in mathematics and science." />
        <meta property="og:title" content="AIMS - Amit Institute of Math's and Science" />
        <meta property="og:description" content="Join AIMS for quality education in mathematics and science." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#647bff" />
        
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />
          {/* Icons and fonts */}
        <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
        
        {/* Accessibility improvements - viewport is handled by Next.js automatically */}
      </Head>
      <body>
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-to-main">Skip to main content</a>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
