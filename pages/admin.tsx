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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const querySnapshot = await getDocs(collection(db, "access_requests")); // ✅ Fixed collection name
        const requestsData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          email: doc.data().email || "Unknown",
          status: doc.data().status || "pending",
        }));
        setRequests(requestsData);
      } catch (error) {
        console.error("Firestore Error:", error);
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "access_requests", id), { status });
      setRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === id ? { ...req, status } : req))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {requests.length > 0 ? (
        requests.map((req) => (
          <div key={req.id} className="border p-3 mb-2 rounded">
            <p>Email: <strong>{req.email}</strong></p>
            <p>Status: <span className={`font-semibold ${req.status === "pending" ? "text-yellow-500" : req.status === "approved" ? "text-green-500" : "text-red-500"}`}>{req.status}</span></p>

            {req.status === "pending" && (
              <div className="mt-2">
                <button onClick={() => updateStatus(req.id, "approved")} className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                  Approve
                </button>
                <button onClick={() => updateStatus(req.id, "rejected")} className="bg-red-500 text-white px-2 py-1 rounded">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        !loading && <p>No pending requests.</p>
      )}
    </div>
  );
}
