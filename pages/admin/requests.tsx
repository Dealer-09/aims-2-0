import { useEffect, useState } from "react";

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<{ email: string }[]>([]);

  useEffect(() => {
    fetch("/api/get-requests")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests));
  }, []);

  const handleApprove = async (email: string) => {
    await fetch("/api/approve-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setRequests(requests.filter((req) => req.email !== email));
  };

  const handleReject = async (email: string) => {
    await fetch("/api/reject-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setRequests(requests.filter((req) => req.email !== email));
  };

  return (
    <section className="admin container">
      <h2 className="heading">Pending Student Requests</h2>
      <ul>
        {requests.map((req) => (
          <li key={req.email}>
            {req.email}
            <button onClick={() => handleApprove(req.email)}>Approve ✅</button>
            <button onClick={() => handleReject(req.email)}>Reject ❌</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminRequests;
