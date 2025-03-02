import { useState } from "react";

const RequestAccess: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <section className="request-access container">
      <h2 className="heading">Request Access</h2>
      <form onSubmit={handleRequest}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Request Access</button>
      </form>
      {status && <p>{status}</p>}
    </section>
  );
};

export default RequestAccess;
