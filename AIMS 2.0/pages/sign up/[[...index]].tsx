import { useState } from "react";
import { useRouter } from "next/router";
import { SignUp } from "@clerk/nextjs";

export default function CustomSignUp() {
  const [email, setEmail] = useState("");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const router = useRouter();

  const checkApproval = async () => {
    setError(""); // ✅ Reset error before new request
    setLoading(true); // ✅ Show loading state

    try {
      console.log("Checking approval for email:", email); // ✅ Debugging

      const res = await fetch(`/api/check-approval?email=${email}`);
      const data = await res.json();
      
      console.log("API Response:", data); // ✅ Debug API response

      if (data.approved) {
        setApproved(true);
      } else {
        setError("Your request is still pending admin approval.");
      }
    } catch (err) {
      console.error("Error checking approval:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // ✅ Hide loading state
    }
  };

  return (
    <div className="signup-container">
      {!approved ? (
        <>
          <h2>Check Approval</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <button className="btn1" onClick={checkApproval} disabled={loading}>
            {loading ? "Checking..." : "Check Approval"} {/* ✅ Loading UI */}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <>
          <p className="success">✅ Approved! You can now sign up.</p>
          <SignUp redirectUrl="/study" />
        </>
      )}
    </div>
  );
}
