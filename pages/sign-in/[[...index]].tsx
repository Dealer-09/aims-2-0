import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Link from 'next/link';

export default function SignInPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  useEffect(() => {
    // When the user signs in and loads successfully, our auth-redirect API endpoint 
    // will automatically handle redirecting to the appropriate page based on their role
    if (isLoaded && isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
      // The redirect will be handled by the /api/auth-redirect endpoint via the SignIn component
      console.log("User signed in successfully");
    }
  }, [isSignedIn, isLoaded, user]);

  return (
    <>
      <div className="header-wrapper" style={{
        background: 'var(--box-color)',
        padding: '1rem 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--main-color)' }}>
            AIMS
          </Link>
          <Link href="/request-access" className="btn1" style={{ 
            margin: 0, 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5rem',
            width: 'auto'
          }}>
            <i className='bx bx-user-plus'></i> Request Access
          </Link>
        </div>
      </div>
      
      <div style={{ 
        padding: "2rem", 
        maxWidth: "500px", 
        margin: "2rem auto",
        background: "rgba(23, 27, 60, 0.95)",
        borderRadius: "1.2rem",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        animation: "zoomIn 0.4s ease-out"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "2rem", 
          fontSize: "2.2rem",
          color: "#647bff"
        }}>
          Sign In to AIMS
        </h1>        <SignIn 
          redirectUrl="/api/auth-redirect"
        />
      </div>
      
      <style jsx>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}