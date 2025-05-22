import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";

// Add hCaptcha type declaration
declare global {
  interface Window {
    hcaptcha?: {
      reset: () => void;
    };
    __hcaptchaToken?: string;
  }
}

const RequestAccess: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setStatus(null);
    setCaptchaError("");
    
    // Get hCaptcha token
    const captchaToken = window.__hcaptchaToken;
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA verification.");
      return;
    }
    
    // Log captcha token length for debugging
    console.log(`Submitting form with captcha token length: ${captchaToken.length}`);
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting request with token:", captchaToken.substring(0, 10) + "...");
      
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: email.trim(),
          captchaToken 
        })
      });

      // Enhanced error handling
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Request failed with status:", res.status);
        console.error("Error response:", errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          setStatus({ 
            type: "error", 
            text: errorJson.error || "Request failed. Please try again." 
          });
        } catch (parseError) {
          setStatus({ 
            type: "error", 
            text: `Request failed (${res.status}). Please try again.` 
          });
        }
        
        // Reset captcha
        window.__hcaptchaToken = undefined;
        if (window.hcaptcha?.reset) {
          window.hcaptcha.reset();
        }
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setStatus({ 
            type: "success", 
            text: data.message || "Request sent successfully! Please wait for admin approval." 
          });
        }, 1500);
          // Reset form
        setEmail("");
        // Reset captcha
        window.__hcaptchaToken = undefined;
        if (window.hcaptcha?.reset) {
          window.hcaptcha.reset();
        }
      } else {        setStatus({ 
          type: "error", 
          text: data.error || "Request failed. Please try again." 
        });
        // Reset captcha on error too
        window.__hcaptchaToken = undefined;
        if (window.hcaptcha?.reset) {
          window.hcaptcha.reset();
        }
      }
    } catch (error) {
      console.error("Request error:", error);
      setStatus({ 
        type: "error", 
        text: "Network error. Please check your connection and try again." 
      });
    } finally {
      setIsSubmitting(false);    }
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("hcaptcha-script")) {
      // First, load the callback handler to ensure it's available when hCaptcha loads
      const localScript = document.createElement("script");
      localScript.src = "/hcaptcha.js";
      localScript.id = "hcaptcha-callback";
      document.head.appendChild(localScript);
      
      // Wait briefly to ensure the callbacks are registered before loading hCaptcha
      setTimeout(() => {
        // Then load hCaptcha script
        const script = document.createElement("script");
        script.src = "https://js.hcaptcha.com/1/api.js";
        script.async = true;
        script.defer = true;
        script.id = "hcaptcha-script";
        document.head.appendChild(script);
      }, 100);      // Add a debug button to test API connectivity
      const debugButton = document.createElement("button");
      debugButton.id = "debug-api-button";
      debugButton.innerText = "Test API Connection";
      debugButton.style.display = "none"; // Hide in production
      debugButton.onclick = async () => {
        try {
          const res = await fetch("/api/check-approval?email=test@example.com");
          const data = await res.json();
          console.log("API test response:", data);
          alert("API Connection Test: " + (res.ok ? "Success" : "Failed"));
        } catch (err: any) {
          console.error("API test error:", err);
          alert("API Connection Error: " + (err.message || "Unknown error"));
        }
      };
      document.body.appendChild(debugButton);

      return () => {
        // Cleanup scripts on unmount
        document.getElementById("hcaptcha-script")?.remove();
        document.getElementById("hcaptcha-callback")?.remove();
        document.getElementById("debug-api-button")?.remove();
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Request Access - AIMS</title>
        <meta name="description" content="Request access to AIMS educational platform" />
      </Head>
      
      <div className="header-wrapper" style={{
        background: 'var(--box-color)',
        padding: '1rem 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--main-color)' }}>
            AIMS
          </Link>
          <Link href="/sign-in" className="btn1" style={{ 
            margin: 0, 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5rem',
            width: 'auto'
          }}>
            <i className='bx bx-log-in'></i> Sign In
          </Link>
        </div>
      </div>

      <section className="request-access container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: 'rgba(23, 27, 60, 0.95)',
          borderRadius: '1.2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          padding: '2.5rem 2rem',
          maxWidth: 450,
          width: '100%',
          margin: '2rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {showSuccessAnimation && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(23, 27, 60, 0.97)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#27ae60',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'scaleIn 0.5s ease-out'
              }}>
                <i className='bx bx-check' style={{ fontSize: '3rem', color: 'white' }}></i>
              </div>
              <p style={{ color: '#fff', marginTop: '1rem', fontWeight: 500 }}>Request Submitted!</p>
            </div>
          )}
          
          <h2 className="heading" style={{ 
            fontSize: '2.2rem', 
            marginBottom: '1.5rem', 
            color: '#647bff', 
            letterSpacing: 1,
            textAlign: 'center' 
          }}>
            Request Access
          </h2>
          
          <p style={{ 
            color: 'var(--bg-color)', 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            maxWidth: '350px',
            opacity: 0.9
          }}>
            Enter your email address to request access to AIMS study materials. You&apos;ll be notified once your request is approved.
          </p>
          
          <form 
            ref={formRef} 
            onSubmit={handleRequest} 
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
          >
            <div className="input-group" style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '1rem 1.1rem',
                  paddingLeft: '2.8rem',
                  borderRadius: '0.7rem',
                  border: '2px solid rgba(100, 123, 255, 0.3)',
                  fontSize: '1.1rem',
                  outline: 'none',
                  background: 'rgba(247, 248, 255, 0.05)',
                  color: '#fff',
                  width: '100%',
                  transition: 'all 0.3s',
                }}
                className="email-input"
              />
              <i className='bx bx-envelope' style={{ 
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--main-color)',
                fontSize: '1.2rem'
              }}></i>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
              <div
                className="h-captcha"
                data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                data-callback="onHCaptchaSuccess"
                data-expired-callback="onHCaptchaExpired"
                data-error-callback="onHCaptchaError"
                data-theme="dark"
                data-size="normal"
              />
            </div>
            
            {captchaError && (
              <p style={{ 
                color: '#e74c3c', 
                fontSize: '0.98rem', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem' 
              }}>
                <i className='bx bx-error-circle'></i>
                {captchaError}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn1" 
              style={{
                width: '100%',
                padding: '1rem 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.7rem',
                background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
                color: '#fff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 15px rgba(142, 45, 226, 0.2)',
                letterSpacing: 1,
                transition: 'all 0.3s',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="loading"></span>
                  Submitting...
                </>
              ) : (
                'Request Access'
              )}
            </button>
          </form>
          
          {status && (
            <div style={{
              marginTop: '1.5rem',
              color: status.type === 'success' ? '#27ae60' : '#e74c3c',
              fontWeight: 500,
              fontSize: '1.05rem',
              textAlign: 'center',
              background: status.type === 'success' ? 'rgba(39, 174, 96, 0.08)' : 'rgba(231, 76, 60, 0.08)',
              borderRadius: '0.5rem',
              padding: '0.7rem 1rem',
              border: `1.5px solid ${status.type === 'success' ? '#27ae60' : '#e74c3c'}`,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <i className={`bx ${status.type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}`}
                style={{ fontSize: '1.5rem' }}></i>
              <span>{status.text}</span>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        .email-input:focus {
          border-color: var(--main-color);
          box-shadow: 0 0 0 3px rgba(100, 123, 255, 0.15);
        }
        
        .loading {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid white;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default RequestAccess;
