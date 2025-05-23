import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { db, collection, getDocs, query, where } from "../utils/firebase";
import styles from "../styles/study.module.css";

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
  const [activeTab, setActiveTab] = useState("materials");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  };  // Fetch PDFs for user's class/subject from MongoDB
  useEffect(() => {
    if (!approved || !userClass || !userSubject) return;
    setPdfsLoading(true);
    setPdfsError("");
    (async () => {
      try {
        console.log(`Fetching PDFs for class: ${userClass}, subject: ${userSubject}`);
        
        // Call our API endpoint that handles MongoDB PDF fetching
        const response = await fetch('/api/pdfs/get-student-pdfs');
        
        if (!response.ok) {
          // Try to get more detailed error information
          let errorDetail = "";
          try {
            const errorData = await response.json();
            errorDetail = errorData.error || errorData.details || "";
          } catch (jsonError) {
            // If we can't parse JSON, just use the status text
            errorDetail = response.statusText;
          }
          
          throw new Error(`Failed to fetch PDFs: ${response.status} ${errorDetail}`);
        }
        
        const data = await response.json();
        
        if (!data.pdfs || !Array.isArray(data.pdfs)) {
          console.error("Invalid PDF data format:", data);
          throw new Error("Server returned invalid data format");
        }
        
        console.log(`Successfully fetched ${data.pdfs.length} PDFs`);
        
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
        setPdfsError(error instanceof Error ? error.message : "Failed to load PDFs");
      } finally {
        setPdfsLoading(false);
      }
    })();
  }, [approved, userClass, userSubject]);  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your study portal...</p>
      </div>
    );
  }
    // Show error if there's a server configuration issue
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Service Error</h1>
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
          <p className={styles.errorHelp}>Please try again later or contact the administrator.</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
    if (!approved) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.lockIcon}>🔒</div>
          <h1>Access Denied</h1>
          <p>Your account has not been approved yet.</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }  return (
    <div className={`${styles.studyPortalContainer} ${styles.studyThemeVariables}`}>
      {/* Mobile Navigation Toggle */}
      <button 
        className={`${styles.mobileNavToggle} ${sidebarOpen ? styles.active : ''}`} 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <div className={styles.toggleLine}></div>
        <div className={styles.toggleLine}></div>
        <div className={styles.toggleLine}></div>
      </button>
        {/* Overlay for mobile navigation */}
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.visible : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Modern Sidebar */}
      <div className={`${styles.sidebar} ${styles.scrollbarStyles} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path fill="#647bff" d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
            </svg>
            <h1><span className={styles.logoPrimary}>AIMS</span> <span className={styles.logoSecondary}>Study</span></h1>
          </div>
          <button 
            className={styles.closeSidebar} 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>        </div>
        
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {user?.firstName?.[0] || "A"}
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{user?.fullName || "Student"}</h3>
            <p className={styles.userClass}>
              {userClass && userSubject 
                ? (
                  <>
                    <span className={styles.classBadge}>{userClass}</span>
                    <span className={styles.subjectText}>{userSubject}</span>
                  </>
                ) 
                : 'Student'}
            </p>
          </div>
        </div>
        
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === "materials" ? styles.active : ""}`} 
            onClick={() => {setActiveTab("materials"); setSidebarOpen(false);}}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V6.5C10.55,5.4 8.45,5 6.5,5Z" />
              </svg>
            </span>
            <span>Study Materials</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === "bookmarks" ? styles.active : ""}`} 
            onClick={() => {setActiveTab("bookmarks"); setSidebarOpen(false);}}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
              </svg>
            </span>
            <span>Bookmarks</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === "notes" ? styles.active : ""}`} 
            onClick={() => {setActiveTab("notes"); setSidebarOpen(false);}}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" />
              </svg>
            </span>
            <span>Notes</span>
          </button>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button onClick={() => router.push('/')} className={styles.homeButton}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>      </div>
      
      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Search bar moved here, left-aligned and spaced */}
        {activeTab === "materials" && (
          <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
            <div className={styles.searchBar}>
              <svg viewBox="0 0 24 24" width="18" height="18" className={styles.searchIcon}>
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <input type="text" placeholder="Search materials..." />
            </div>
          </div>
        )}
          <div className={styles.contentBody}>
          {activeTab === "materials" && (
            <div className={styles.materialsSection}>
              {pdfsLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingAnimation}>
                    <div className={styles.loadingCircle}></div>
                    <div className={styles.loadingCircle}></div>
                    <div className={styles.loadingCircle}></div>
                  </div>
                  <p>Loading your study materials...</p>
                </div>
              ) : pdfsError ? (
                <div className={styles.errorMsg}>
                  <div className={styles.errorIcon}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                  </div>
                  <p>{pdfsError}</p>
                </div>
              ) : pdfs.length > 0 ? (
                <div className={styles.materialsGrid}>
                  {pdfs.map((pdf, idx) => (
                    <a 
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={idx}
                      className={styles.materialCard}
                    >
                      <div className={styles.materialCardContent}>
                        <div className={styles.materialIcon}>
                          <svg viewBox="0 0 24 24" width="40" height="40">
                            <path fill="#647bff" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.96,18.22L9.91,17.17L11.79,15.29L9.91,13.41L10.96,12.36L13.89,15.29L10.96,18.22M13.04,12.36L14.09,13.41L12.21,15.29L14.09,17.17L13.04,18.22L10.11,15.29L13.04,12.36Z" />
                          </svg>
                        </div>
                        <div className={styles.materialInfo}>
                          <h3>{pdf.filename}</h3>
                          <p>PDF Document</p>
                        </div>
                      </div>
                      <div className={styles.materialActions}>
                        <button className={`${styles.actionButton} ${styles.bookmarkBtn}`} title="Bookmark">
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M17,18L12,15.82L7,18V5H17M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
                          </svg>
                        </button>
                        <button className={styles.actionButton} title="Open document">
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                          </svg>
                        </button>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIllustration}>
                    <svg width="120" height="120" viewBox="0 0 24 24">
                      <path fill="#647bff" d="M19,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10L12,6H19A2,2 0 0,1 21,8H21L4,8V18L6.14,10H23.21L20.93,18.5C20.7,19.37 19.92,20 19,20Z" />
                    </svg>
                  </div>
                  <h3>No Study Materials Yet</h3>
                  <p>Materials for your class will appear here once they're available.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "bookmarks" && (
            <div className={styles.bookmarksContainer}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIllustration}>
                  <svg width="120" height="120" viewBox="0 0 24 24">
                    <path fill="#647bff" d="M17,3A2,2 0 0,1 19,5V21L12,18L5,21V5C5,3.89 5.9,3 7,3H17M17,18L12,15.82L7,18V5H17V18Z" />
                  </svg>
                </div>
                <h3>No Bookmarks Yet</h3>
                <p>Your bookmarked study materials will appear here.</p>
              </div>
            </div>
          )}
          
          {activeTab === "notes" && (
            <div className={styles.notesContainer}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIllustration}>
                  <svg width="120" height="120" viewBox="0 0 24 24">
                    <path fill="#647bff" d="M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,5V19H19V12H12V5H5Z" />
                  </svg>
                </div>
                <h3>No Notes Yet</h3>
                <p>Your study notes will appear here.</p>
              </div>
            </div>
          )}
        </div>      </main>    </div>
  );
}
