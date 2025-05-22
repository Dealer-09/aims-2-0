import { useState, useEffect } from 'react';
import Router from 'next/router';

const PageLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => {
      setLoading(true);
    };

    const end = () => {
      setLoading(false);
    };

    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', end);
    Router.events.on('routeChangeError', end);

    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', end);
      Router.events.off('routeChangeError', end);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="page-loader">
      <div className="loader"></div>
      
      <style jsx>{`
        .page-loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;          background: rgba(9, 10, 26, 0.95);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(100, 123, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--main-color);
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
