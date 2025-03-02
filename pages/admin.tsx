import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, getDocs, doc, updateDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Request = {
  id: string;
  email: string;
  status: string;
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const querySnapshot = await getDocs(collection(db, "accessRequests"));
        const requestsData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          email: doc.data().email || "Unknown",
          status: doc.data().status || "pending",
        }));
        setRequests(requestsData);
      } catch (error) {
        console.error("Firestore Error:", error);
      }
    }
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "accessRequests", id), { status });
      setRequests(requests.map((req) => (req.id === id ? { ...req, status } : req)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {requests.length > 0 ? (
        requests.map((req) => (
          <div key={req.id}>
            <p>Email: {req.email} | Status: {req.status}</p>
            {req.status === "pending" && (
              <>
                <button onClick={() => updateStatus(req.id, "approved")}>Approve</button>
                <button onClick={() => updateStatus(req.id, "rejected")}>Reject</button>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No pending requests.</p>
      )}
    </div>
  );
}