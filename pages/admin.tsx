import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Request = {
  id: string;
  email: string;
  status: string;
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedClass, setSelectedClass] = useState<{ [key: string]: string }>({});
  const [selectedSubject, setSelectedSubject] = useState<{ [key: string]: string }>({});

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
    if (status === "approved" && (!selectedClass[id] || !selectedSubject[id])) {
      alert("Please select a class and subject before approving.");
      return;
    }

    try {
      if (status === "approved") {
        await updateDoc(doc(db, "users", email), { 
          role: "student",
          class: selectedClass[id], 
          subject: selectedSubject[id], 
        });

        await updateDoc(doc(db, "access_requests", id), { status });

        // ✅ Send approval email (HTML string format)
        const approvalEmailBody = `
          <html>
            <body>
              <p>Hello,</p>
              <p>Your request has been <strong>approved</strong>.</p>
              <p>You can now sign up and access study materials.</p>
              <a href="http://yourwebsite.com/sign-up">Sign Up Here</a>
            </body>
          </html>
        `;

        await resend.emails.send({
          from: "no-reply@yourdomain.com",
          to: email,
          subject: "Access Approved",
          html: approvalEmailBody, 
        });

      } else {
        await deleteDoc(doc(db, "access_requests", id));

        // ✅ Send rejection email (HTML string format)
        const rejectionEmailBody = `
          <html>
            <body>
              <p>Hello,</p>
              <p>Unfortunately, your request was <strong>not approved</strong>.</p>
              <p>If you believe this was a mistake, please contact support.</p>
            </body>
          </html>
        `;

        await resend.emails.send({
          from: "no-reply@yourdomain.com",
          to: email,
          subject: "Access Denied",
          html: rejectionEmailBody, 
        });
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
          <div key={req.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
            <p>Email: {req.email} | Status: {req.status}</p>
            {req.status === "pending" && (
              <>
                <label>Class:</label>
                <select onChange={(e) => setSelectedClass({ ...selectedClass, [req.id]: e.target.value })}>
                  <option value="">Select Class</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 12">Class 12</option>
                </select>

                <label>Subject:</label>
                <select onChange={(e) => setSelectedSubject({ ...selectedSubject, [req.id]: e.target.value })}>
                  <option value="">Select Subject</option>
                  <option value="Math">Math</option>
                  <option value="Physics">Physics</option>
                </select>

                <button onClick={() => handleApproval(req.id, req.email, "approved")}>
                  Approve
                </button>
                <button onClick={() => handleApproval(req.id, req.email, "rejected")}>
                  Reject
                </button>
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