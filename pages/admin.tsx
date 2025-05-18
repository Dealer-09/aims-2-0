import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/utils/firebase";
import { doc, collection, getDocs, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


type Request = {
  id: string;
  email: string;
  status: string;
};

type User = {
  id: string;
  email: string;
  role: string;
  class?: string;
  subject?: string;
};


type PDF = {
  id: string;
  url: string;
  filename: string;
  class: string;
  subject: string;
};

export default function AdminDashboard() {
  // PDF Management State
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);
  const [pdfsError, setPdfsError] = useState("");

  // Fetch PDFs for management
  useEffect(() => {
    async function fetchPdfs() {
      setPdfsLoading(true);
      setPdfsError("");
      try {
        const querySnapshot = await getDocs(collection(db, "pdfs"));
        const pdfsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PDF[];
        setPdfs(pdfsData);
      } catch {
        setPdfsError("Failed to load PDFs");
      } finally {
        setPdfsLoading(false);
      }
    }
    fetchPdfs();
  }, []);

  // Delete PDF
  const handleDeletePdf = async (pdfId: string) => {
    if (!window.confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await deleteDoc(doc(db, "pdfs", pdfId));
      setPdfs((prev) => prev.filter((p) => p.id !== pdfId));
      alert("PDF deleted.");
    } catch {
      alert("Failed to delete PDF.");
    }
  };
  const storage = typeof window !== "undefined" ? getStorage() : null;
  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfClass, setPdfClass] = useState("");
  const [pdfSubject, setPdfSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  // Handle PDF Upload
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");
    if (!pdfFile || !pdfClass || !pdfSubject) {
      setUploadError("Please select a PDF, class, and subject.");
      return;
    }
    // Server-side file type and size validation
    if (pdfFile.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }
    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError("PDF file size must be less than 10MB.");
      return;
    }
    // Sanitize class and subject
    const allowedClasses = ["Class 10", "Class 12"];
    const allowedSubjects = ["Math", "Physics"];
    if (!allowedClasses.includes(pdfClass) || !allowedSubjects.includes(pdfSubject)) {
      setUploadError("Invalid class or subject.");
      return;
    }
    setUploading(true);
    try {
      if (!storage) throw new Error("Firebase Storage not initialized");
      // Use a UUID for the filename to avoid info leakage
      const uuid = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const storageRef = ref(storage, `pdfs/${uuid}.pdf`);
      await uploadBytes(storageRef, pdfFile);
      const url = await getDownloadURL(storageRef);
      // Save metadata to Firestore
      await addDoc(collection(db, "pdfs"), {
        url,
        filename: pdfFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_"), // sanitized original name for display only
        class: pdfClass,
        subject: pdfSubject,
        uploadedAt: new Date().toISOString(),
      });
      setUploadSuccess("PDF uploaded successfully!");
      setPdfFile(null);
      setPdfClass("");
      setPdfSubject("");
    } catch (err) {
      if (err instanceof Error) {
        setUploadError("Failed to upload PDF: " + err.message);
      } else {
        setUploadError("Failed to upload PDF");
      }
    } finally {
      setUploading(false);
    }
  };
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState<{ [key: string]: string }>({});
  const [selectedSubject, setSelectedSubject] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    async function checkAdminRole() {
      const sessionToken = user?.id; // Use Clerk user ID as session token
      if (!sessionToken) {
        console.error("❌ No session token available.");
        router.push("/sign-in");
        return;
      }

      try {
        const res = await fetch("/api/get-user-role", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await res.json();

        if (data.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/study"); // 🚀 Redirect non-admins
        }
      } catch (error) {
        console.error("❌ Error fetching role:", error);
        router.push("/sign-in"); // 🚀 Redirect if error
      }
    }

    checkAdminRole();
  }, [isSignedIn, user, router]);


  useEffect(() => {
    async function fetchRequests() {
      try {
        const querySnapshot = await getDocs(collection(db, "access_requests"));
        const requestsData = querySnapshot.docs.map((doc) => ({
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

  // Fetch all users for management
  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
      } catch {
        // Firestore error fetching users
      }
    }
    fetchUsers();
  }, []);
  // Edit user class/subject or revoke access
  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, "users", userId), updates);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
      // Optionally send notification email here
      alert("User updated.");
    } catch {
      alert("Failed to update user.");
    }
  };

  // The _email parameter is required by the call signature but is intentionally unused.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUserRevoke = async (userId: string, _email: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: "revoked" });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: "revoked" } : u))
      );
      // Optionally send notification email here
      alert("User access revoked.");
    } catch {
      alert("Failed to revoke user.");
    }
  };

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

  if (!isAdmin) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <h3>Upload PDF</h3>
      <form onSubmit={handlePdfUpload} style={{ marginBottom: 24 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
        />
        <select value={pdfClass} onChange={(e) => setPdfClass(e.target.value)}>
          <option value="">Select Class</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 12">Class 12</option>
        </select>
        <select value={pdfSubject} onChange={(e) => setPdfSubject(e.target.value)}>
          <option value="">Select Subject</option>
          <option value="Math">Math</option>
          <option value="Physics">Physics</option>
        </select>
        <button type="submit" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
        {uploadSuccess && <p style={{ color: "green" }}>{uploadSuccess}</p>}
      </form>
      <h3>PDFs Uploaded</h3>
      {pdfsLoading ? <p>Loading PDFs...</p> : null}
      {pdfsError ? <p style={{ color: 'red' }}>{pdfsError}</p> : null}
      {pdfs.length > 0 ? (
        <ul style={{ marginBottom: 24 }}>
          {pdfs.map((pdf) => (
            <li key={pdf.id} style={{ marginBottom: 8 }}>
              <a href={pdf.url} target="_blank" rel="noopener noreferrer">{pdf.filename}</a>
              {` (Class: ${pdf.class}, Subject: ${pdf.subject}) `}
              <button style={{ marginLeft: 8 }} onClick={() => handleDeletePdf(pdf.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No PDFs uploaded yet.</p>
      )}

      <h3>Pending Access Requests</h3>
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

      <h3>Manage Approved Users</h3>
      {users.length > 0 ? (
        users.filter((u) => u.role === "student").map((u) => (
          <div key={u.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
            <p>Email: {u.email} | Class: {u.class || "-"} | Subject: {u.subject || "-"} | Role: {u.role}</p>
            <label>Edit Class:</label>
            <select
              value={u.class || ""}
              onChange={(e) => handleUserUpdate(u.id, { class: e.target.value })}
            >
              <option value="">Select Class</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 12">Class 12</option>
            </select>
            <label>Edit Subject:</label>
            <select
              value={u.subject || ""}
              onChange={(e) => handleUserUpdate(u.id, { subject: e.target.value })}
            >
              <option value="">Select Subject</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
            </select>
            <button style={{ marginLeft: 8 }} onClick={() => handleUserRevoke(u.id, u.email)}>
              Revoke Access
            </button>
          </div>
        ))
      ) : (
        <p>No approved users found.</p>
      )}
    </div>
  );
}