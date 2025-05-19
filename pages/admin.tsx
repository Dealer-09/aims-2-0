import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/utils/firebase";
import { doc, collection, getDocs, updateDoc, deleteDoc, addDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Request = {
  id: string;
  email: string;
  status: string;
  requestedAt: string;
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
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState<{ [key: string]: string }>({});
  const [selectedSubject, setSelectedSubject] = useState<{ [key: string]: string }>({});
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);
  const [pdfsError, setPdfsError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfClass, setPdfClass] = useState("");
  const [pdfSubject, setPdfSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Admin role verification
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isSignedIn || !user) {
        router.push("/sign-in");
        return;
      }

      try {
        const res = await fetch("/api/get-user-role", {
          headers: { Authorization: `Bearer ${user.id}` },
        });
        const data = await res.json();

        if (data.role !== "admin") {
          router.push("/study");
          return;
        }

        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Admin verification failed:", error);
        router.push("/sign-in");
      }
    };

    verifyAdmin();
  }, [isSignedIn, user, router]);

  // Fetch pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAdmin) return;

      try {
        const q = query(collection(db, "access_requests"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          status: doc.data().status,
          requestedAt: doc.data().requestedAt,
        })) as Request[];

        setRequests(requestsData.sort((a, b) => 
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        ));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, [isAdmin]);

  // Fetch approved users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        const q = query(collection(db, "users"), where("role", "in", ["student", "revoked"]));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Handle request approval/rejection
  const handleApproval = async (id: string, email: string, status: string) => {
    if (status === "approved" && (!selectedClass[id] || !selectedSubject[id])) {
      alert("Please select a class and subject before approving.");
      return;
    }

    try {
      if (status === "approved") {
        // Update access_requests status
        await updateDoc(doc(db, "access_requests", id), { status });
        
        // Create/update user document with role and class/subject
        await updateDoc(doc(db, "users", email), {
          role: "student",
          class: selectedClass[id],
          subject: selectedSubject[id],
          approvedAt: new Date().toISOString(),
        });

        // Send approval email
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
          to: email,
          subject: "AIMS Access Approved",
          html: `
            <h2>Welcome to AIMS!</h2>
            <p>Your access request has been approved.</p>
            <p><strong>Class:</strong> ${selectedClass[id]}</p>
            <p><strong>Subject:</strong> ${selectedSubject[id]}</p>
            <p>You can now sign in to access your study materials.</p>
          `,
        });
      } else {
        // Delete rejected request
        await deleteDoc(doc(db, "access_requests", id));

        // Send rejection email
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
          to: email,
          subject: "AIMS Access Request Update",
          html: `
            <p>Your access request was not approved at this time.</p>
            <p>If you believe this was a mistake, please contact us.</p>
          `,
        });
      }

      // Update local state
      setRequests(requests.filter((req) => req.id !== id));
      alert(status === "approved" ? "User approved successfully!" : "Request rejected.");
    } catch (error) {
      console.error("Error handling request:", error);
      alert("Failed to process request. Please try again.");
    }
  };

  // Handle user updates
  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, "users", userId), updates);
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  // Handle user access revocation
  const handleUserRevoke = async (userId: string, email: string) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), { 
        role: "revoked",
        revokedAt: new Date().toISOString()
      });

      setUsers(users.map((u) => 
        u.id === userId ? { ...u, role: "revoked" } : u
      ));

      // Notify user
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
        to: email,
        subject: "AIMS Access Revoked",
        html: `
          <p>Your access to AIMS has been revoked.</p>
          <p>If you believe this was a mistake, please contact support.</p>
        `,
      });

      alert("User access revoked successfully.");
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access. Please try again.");
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!pdfFile || !pdfClass || !pdfSubject) {
      setUploadError("Please select a PDF, class, and subject.");
      return;
    }

    if (pdfFile.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError("PDF file size must be less than 10MB.");
      return;
    }

    setUploading(true);

    try {
      const storage = getStorage();
      const uuid = window.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const storageRef = ref(storage, `pdfs/${uuid}.pdf`);
      
      await uploadBytes(storageRef, pdfFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "pdfs"), {
        url,
        filename: pdfFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_"),
        class: pdfClass,
        subject: pdfSubject,
        uploadedAt: new Date().toISOString(),
      });

      setUploadSuccess("PDF uploaded successfully!");
      setPdfFile(null);
      setPdfClass("");
      setPdfSubject("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload PDF. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle PDF deletion
  const handleDeletePdf = async (pdfId: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "pdfs", pdfId));
      setPdfs(pdfs.filter((p) => p.id !== pdfId));
      alert("PDF deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete PDF. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>

      {/* PDF Management Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>PDF Management</h2>
        
        <form onSubmit={handlePdfUpload} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              style={{ flex: 2 }}
            />
            <select 
              value={pdfClass} 
              onChange={(e) => setPdfClass(e.target.value)}
              style={{ flex: 1 }}
              required
            >
              <option value="">Select Class</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 12">Class 12</option>
            </select>
            <select 
              value={pdfSubject} 
              onChange={(e) => setPdfSubject(e.target.value)}
              style={{ flex: 1 }}
              required
            >
              <option value="">Select Subject</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
            </select>
            <button 
              type="submit" 
              disabled={uploading}
              style={{
                padding: "0.5rem 1rem",
                background: "#4A00E0",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
          {uploadError && <p style={{ color: "red", margin: "0.5rem 0" }}>{uploadError}</p>}
          {uploadSuccess && <p style={{ color: "green", margin: "0.5rem 0" }}>{uploadSuccess}</p>}
        </form>

        <div style={{ marginTop: "2rem" }}>
          <h3>Uploaded PDFs</h3>
          {pdfsLoading && <p>Loading PDFs...</p>}
          {pdfsError && <p style={{ color: "red" }}>{pdfsError}</p>}
          {pdfs.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Filename</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Class</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf) => (
                  <tr key={pdf.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                        {pdf.filename}
                      </a>
                    </td>
                    <td style={{ padding: "0.5rem" }}>{pdf.class}</td>
                    <td style={{ padding: "0.5rem" }}>{pdf.subject}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <button
                        onClick={() => handleDeletePdf(pdf.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No PDFs uploaded yet.</p>
          )}
        </div>
      </section>

      {/* Access Requests Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Pending Access Requests</h2>
        {requests.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {requests.map((req) => (
              <div 
                key={req.id} 
                style={{
                  padding: "1rem",
                  border: "1px solid #eee",
                  borderRadius: "0.5rem",
                  background: "#fff"
                }}
              >
                <p><strong>Email:</strong> {req.email}</p>
                <p><strong>Requested:</strong> {new Date(req.requestedAt).toLocaleString()}</p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  <select
                    value={selectedClass[req.id] || ""}
                    onChange={(e) => setSelectedClass({ ...selectedClass, [req.id]: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Class</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  <select
                    value={selectedSubject[req.id] || ""}
                    onChange={(e) => setSelectedSubject({ ...selectedSubject, [req.id]: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Subject</option>
                    <option value="Math">Math</option>
                    <option value="Physics">Physics</option>
                  </select>
                  <button
                    onClick={() => handleApproval(req.id, req.email, "approved")}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(req.id, req.email, "rejected")}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending requests.</p>
        )}
      </section>

      {/* User Management Section */}
      <section>
        <h2>User Management</h2>
        {users.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #eee",
                  borderRadius: "0.5rem",
                  background: "#fff",
                  opacity: user.role === "revoked" ? 0.7 : 1,
                }}
              >
                <p>
                  <strong>Email:</strong> {user.email}
                  <span style={{
                    marginLeft: "1rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    background: user.role === "revoked" ? "#e74c3c" : "#27ae60",
                    color: "white",
                  }}>
                    {user.role}
                  </span>
                </p>
                {user.role !== "revoked" && (
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    <select
                      value={user.class || ""}
                      onChange={(e) => handleUserUpdate(user.id, { class: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Class</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                    <select
                      value={user.subject || ""}
                      onChange={(e) => handleUserUpdate(user.id, { subject: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Subject</option>
                      <option value="Math">Math</option>
                      <option value="Physics">Physics</option>
                    </select>
                    <button
                      onClick={() => handleUserRevoke(user.id, user.email)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                      }}
                    >
                      Revoke Access
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </section>
    </div>
  );
}