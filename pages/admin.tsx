import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

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
        const querySnapshot = await getDocs(collection(db, "access_requests"));
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

  const handleApproval = async (id: string, email: string, status: string) => {
    try {
      if (status === "approved") {
        await updateDoc(doc(db, "access_requests", id), { status });
        await updateDoc(doc(db, "users", email), { role: "student" }); // Assign role
      } else {
        await deleteDoc(doc(db, "access_requests", id)); // Remove request if rejected
      }
      setRequests(requests.filter((req) => req.id !== id));
    } catch (error) {
      console.error("Error updating request:", error);
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
                <button onClick={() => handleApproval(req.id, req.email, "approved")}>Approve</button>
                <button onClick={() => handleApproval(req.id, req.email, "rejected")}>Reject</button>
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
