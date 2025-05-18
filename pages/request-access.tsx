import { useState } from "react";

const RequestAccess: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | "" | null>("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", text: data.message });
      } else {
        setStatus({ type: "error", text: data.error || data.message });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    }
  };

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
        <form onSubmit={handleRequest} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
          <button type="submit" className="btn1" style={{
            width: '100%',
            padding: '0.8rem 0',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '0.7rem',
            background: 'linear-gradient(135deg, #4A00E0, #8E2DE2)',
            color: '#fff',
            cursor: 'pointer',
            marginTop: '0.5rem',
            boxShadow: '0 2px 8px rgba(100, 123, 255, 0.10)',
            letterSpacing: 1,
            transition: 'background 0.2s',
          }}>
            Request Access
          </button>
        </form>
        {status && typeof status !== "string" && (
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
          }}>{status.text}</p>
        )}
      </div>
    </section>
  );
};

export default RequestAccess;
