import { useState, useEffect, useRef } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);

  const handleRequest = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
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

      const data = await res.json();
      
      if (res.ok) {
        setStatus({ 
          type: "success", 
          text: data.message || "Request sent successfully! Please wait for admin approval." 
        });
        // Reset form
        setEmail("");
        // Reset captcha
        window.__hcaptchaToken = undefined;
        if (window.hcaptcha?.reset) {
          window.hcaptcha.reset();
        }
      } else {
        setStatus({ 
          type: "error", 
          text: data.error || "Request failed. Please try again." 
        });
      }
    } catch (error) {
      console.error("Request error:", error);
      setStatus({ 
        type: "error", 
        text: "Network error. Please check your connection and try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("hcaptcha-script")) {
      // Load hCaptcha script
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js";
      script.async = true;
      script.defer = true;
      script.id = "hcaptcha-script";
      document.body.appendChild(script);

      // Load callback handler
      const localScript = document.createElement("script");
      localScript.src = "/hcaptcha.js";
      localScript.async = true;
      localScript.defer = true;
      localScript.id = "hcaptcha-callback";
      document.body.appendChild(localScript);

      return () => {
        // Cleanup scripts on unmount
        document.getElementById("hcaptcha-script")?.remove();
        document.getElementById("hcaptcha-callback")?.remove();
      };
    }
  }, []);

  return (
    <section className="request-access container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        background: 'rgba(100, 123, 255, 0.08)',
        borderRadius: '1.2rem',
        boxShadow: '0 4px 24px rgba(100, 123, 255, 0.10)',
        padding: '2.5rem 2rem',
        maxWidth: 400,
        width: '100%',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 className="heading" style={{ fontSize: '2.2rem', marginBottom: '1.5rem', color: '#647bff', letterSpacing: 1 }}>Request Access</h2>
        <form ref={formRef} onSubmit={handleRequest} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '0.7rem',
              border: '1.5px solid #647bff',
              fontSize: '1.1rem',
              outline: 'none',
              background: '#f7f8ff',
              color: '#222231',
              transition: 'border 0.2s',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className="h-captcha"
              data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
              data-callback="onHCaptchaSuccess"
              data-theme="light"
            />
          </div>
          {captchaError && (
            <p style={{ color: '#e74c3c', fontSize: '0.98rem', margin: 0 }}>{captchaError}</p>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn1" 
            style={{
              width: '100%',
              padding: '0.8rem 0',
              fontSize: '1.1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '0.7rem',
              background: isSubmitting 
                ? 'linear-gradient(135deg, #666, #999)' 
                : 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
              color: '#fff',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 2px 8px rgba(100, 123, 255, 0.10)',
              letterSpacing: 1,
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Request Access'}
          </button>
        </form>
        {status && (
          <p style={{
            marginTop: '1.5rem',
            color: status.type === 'success' ? '#27ae60' : '#e74c3c',
            fontWeight: 500,
            fontSize: '1.05rem',
            textAlign: 'center',
            background: status.type === 'success' ? 'rgba(39, 174, 96, 0.08)' : 'rgba(231, 76, 60, 0.08)',
            borderRadius: '0.5rem',
            padding: '0.7rem 1rem',
            border: `1.5px solid ${status.type === 'success' ? '#27ae60' : '#e74c3c'}`,
            maxWidth: 350
          }}>
            {status.text}
          </p>
        )}
      </div>
    </section>
  );
};

export default RequestAccess;
