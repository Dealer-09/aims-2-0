
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { db, collection, getDocs, query, where } from "../utils/firebase";

export default function StudyPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState<Array<{ url: string; filename: string }>>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);
  const [pdfsError, setPdfsError] = useState("");
  const [userClass, setUserClass] = useState<string | null>(null);
  const [userSubject, setUserSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/");
      } else {
        checkApprovalAndFetchUser(user?.primaryEmailAddress?.emailAddress, user?.id);
      }
    }
  }, [isLoaded, isSignedIn, user, router]);
    // Check approval and get user class/subject
  const checkApprovalAndFetchUser = async (email: string | undefined, userId: string | undefined) => {
    if (!email || !userId) return;
    try {
      const res = await fetch(`/api/check-approval?email=${email}`);
      
      if (!res.ok) {
        console.error('Error checking approval:', res.status, res.statusText);
        if (res.status === 500) {          try {
            const errorData = await res.json();
            if (errorData.code === 'firebase_admin_init_failed' || errorData.error?.includes('Firebase Admin SDK missing required credentials')) {
              setError('Missing Firebase Admin configuration. Please contact the administrator with error code: ENV_MISSING');
              console.error('Firebase Admin environment variables are missing:', errorData.details?.missingEnvVars);
            } else {
              setError('Failed to check approval status. Please try again later.');
            }
          } catch (jsonError) {
            setError(`Server error (${res.status}). Please try again later.`);
          }
        } else {
          setError(`Server error (${res.status}). Please try again later.`);
        }
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setApproved(data.approved);
      
      if (data.note) {
        console.warn('API Note:', data.note);
      }
      
      if (data.approved) {
        // Fetch user class/subject from Firestore
        try {
          const userDocRes = await fetch(`/api/get-user-role?email=${email}`, {
            method: "GET",
            // Clerk will automatically add the auth header
          });
          
          if (!userDocRes.ok) {
            console.error('Error fetching user role:', userDocRes.status, userDocRes.statusText);
            throw new Error(`Server error: ${userDocRes.status}`);
          }
          
          const userDoc = await userDocRes.json();
          setUserClass(userDoc.class || null);
          setUserSubject(userDoc.subject || null);
        } catch (roleError) {
          console.error('Error fetching user role:', roleError);
          // Continue with default null values for class/subject
        }
      }
    } catch (error) {
      console.error('Error in approval check:', error);
      // Show appropriate user message for errors
      setApproved(false);
    } finally {
      setLoading(false);
    }
  };
  // Fetch PDFs for user's class/subject from MongoDB
  useEffect(() => {
    if (!approved || !userClass || !userSubject) return;
    setPdfsLoading(true);
    setPdfsError("");
    (async () => {
      try {
        // Call our new API endpoint that handles MongoDB PDF fetching
        const response = await fetch('/api/pdfs/get-student-pdfs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDFs: ${response.status}`);
        }
        
        const data = await response.json();
        setPdfs(
          data.pdfs.map((pdf: any) => {
            return {
              url: pdf.url,
              filename: pdf.filename,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        setPdfsError("Failed to load PDFs");
      } finally {
        setPdfsLoading(false);
      }
    })();
  }, [approved, userClass, userSubject]);
  if (loading) return <p>Loading...</p>;
  
  // Show error if there's a server configuration issue
  if (error) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center', 
        marginTop: '3rem',
        background: 'var(--body-color)'
      }}>
        <h1 style={{ color: 'var(--main-color)', fontSize: '2rem', marginBottom: '1.5rem' }}>Service Error</h1>
        <div style={{
          padding: '1.5rem',
          borderRadius: '8px',
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid #e74c3c',
          marginBottom: '2rem',
          color: '#c0392b'
        }}>
          <p>{error}</p>
        </div>
        <p style={{ marginBottom: '1.5rem' }}>Please try again later or contact the administrator.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'var(--main-color)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!approved) return <p>Access Denied. You are not approved.</p>;
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--body-color)'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        borderRadius: '10px',
        background: 'var(--box-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <h1 style={{ color: 'var(--main-color)', fontSize: '2rem' }}>AIMS Study Portal</h1>
        <div>
          <span style={{ color: 'var(--bg-color)', marginRight: '1rem' }}>
            {userClass && userSubject ? `${userClass} - ${userSubject}` : ''}
          </span>
          <button 
            onClick={() => router.push('/')}
            style={{
              background: 'var(--main-color)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Home
          </button>
        </div>
      </header>

      <div style={{
        padding: '2rem',
        borderRadius: '10px',
        background: 'var(--container-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s',
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          color: 'var(--bg-color)', 
          marginBottom: '1.5rem',
          borderBottom: '2px solid var(--main-color)',
          paddingBottom: '0.5rem'
        }}>
          Study Materials
        </h2>
        
        {pdfsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(100, 123, 255, 0.3)',
              borderRadius: '50%',
              borderTop: '4px solid var(--main-color)',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem' }}>Loading study materials...</p>
          </div>
        ) : null}
        
        {pdfsError ? (
          <div style={{ 
            background: 'rgba(231, 76, 60, 0.1)', 
            border: '1px solid #e74c3c', 
            borderRadius: '5px', 
            padding: '1rem', 
            color: '#e74c3c' 
          }}>
            {pdfsError}
          </div>
        ) : null}
        
        {pdfs.length > 0 ? (
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            {pdfs.map((pdf, idx) => (
              <li key={idx} style={{ 
                background: 'rgba(23, 27, 60, 0.5)', 
                padding: '1rem', 
                borderRadius: '8px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                border: '1px solid rgba(100, 123, 255, 0.2)'
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}>
                <a 
                  href={pdf.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.8rem',
                    color: 'var(--bg-color)',
                    textDecoration: 'none'
                  }}
                >
                  <span style={{ 
                    fontSize: '1.8rem', 
                    color: 'var(--main-color)' 
                  }}>
                    📄
                  </span>
                  <span style={{ flex: 1 }}>{pdf.filename}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            color: 'var(--bg-color)',
            opacity: 0.7,
            borderRadius: '8px',
            background: 'rgba(23, 27, 60, 0.3)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
            <p>No study materials found for your class/subject.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
