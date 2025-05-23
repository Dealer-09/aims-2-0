import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Import admin components
import AdminLayout from "../components/admin/AdminLayout";
import PdfManagement from "../components/admin/PdfManagement";
import AccessRequests from "../components/admin/AccessRequests";
import UserManagement from "../components/admin/UserManagement";
import { Request, User, PDF } from "../components/admin/types";

// Import styles
import styles from "../styles/admin.module.css";

export default function AdminDashboard() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);

  // Admin role verification
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isSignedIn || !user) {
        router.push("/sign-in");
        return;
      }

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) {
          throw new Error("Email not available");
        }
        
        // Normalize email to match Firebase storage format
        const normalizedEmail = email.toLowerCase().trim();
        
        // Clerk will automatically add the auth cookie to the request
        const res = await fetch(`/api/get-user-role?email=${encodeURIComponent(normalizedEmail)}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch user role: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Log detailed role information for debugging
        console.log(`User role check for ${normalizedEmail}:`, data);

        if (data.role?.toLowerCase() !== "admin") {
          console.warn(`Access denied: User is not an admin. Role: ${data.role}`);
          alert("You don't have admin privileges to access this page.");
          router.push("/study");
          return;
        }

        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Admin verification failed:", error);
        alert("Error verifying admin status. Redirecting to sign in page.");
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
        console.log("Fetching pending access requests...");
        
        // Use server API endpoint instead of direct Firestore access
        const response = await fetch('/api/admin/get-requests');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.requests.length} pending requests`);
        
        setRequests(data.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Error loading access requests. See console for details.");
      }
    };

    fetchRequests();
  }, [isAdmin]);

  // Fetch approved users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        console.log("Fetching users...");
        
        // Use server API endpoint instead of direct Firestore access
        const response = await fetch('/api/admin/get-users');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.users.length} users`);
        
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error loading users. See console for details.");
      }
    };

    fetchUsers();
  }, [isAdmin]);
  // Fetch PDFs
  useEffect(() => {
    const fetchPDFs = async () => {
      if (!isAdmin) return;
      
      try {
        console.log("Fetching PDFs...");
        
        // Use server API endpoint instead of direct Firestore access
        const response = await fetch('/api/admin/get-pdfs');
        
        if (!response.ok) {
          // Attempt to get more detailed error info
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || `${response.status} ${response.statusText}`;
          } catch (jsonError) {
            errorMessage = `${response.status} ${response.statusText}`;
          }
          throw new Error(`Failed to fetch PDFs: ${errorMessage}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.pdfs.length} PDFs`);
        
        setPdfs(data.pdfs);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        alert(`Error loading PDFs: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };
    
    fetchPDFs();
  }, [isAdmin]);

  // Handle PDF deletion
  const handleDeletePdf = async (pdfId: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    try {
      // Use the server API to delete the PDF
      const response = await fetch('/api/admin/delete-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to delete PDF: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setPdfs(pdfs.filter((p) => p.id !== pdfId));
      alert("PDF deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete PDF. Please try again.");
    }
  };

  // Handle user updates
  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      console.log(`Updating user ${userId} with:`, updates);
      
      const userData = users.find(u => u.id === userId);
      if (!userData) {
        throw new Error("User not found");
      }
      
      // Use the server API to update user information
      const response = await fetch('/api/admin/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          email: userData.email,
          status: "update",
          ...updates
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to update user: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle user access revocation
  const handleUserRevoke = async (userId: string, email: string) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) {
      return;
    }

    try {
      console.log(`Revoking access for user ${userId} (${email})`);
      
      // Use the server API to update user role
      const response = await fetch('/api/admin/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          email,
          status: "revoked",
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to revoke access: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, role: "revoked" } : u
      ));

      alert("User access revoked successfully.");
    } catch (error) {
      console.error("Error revoking access:", error);
      alert(`Failed to revoke access: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };  // Handle PDF upload
  const handlePdfUpload = async (file: File, pdfClass: string, pdfSubject: string) => {
    try {
      console.log(`Uploading PDF: ${file.name}, Class: ${pdfClass}, Subject: ${pdfSubject}`);
      
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('class', pdfClass);
      formData.append('subject', pdfSubject);
      
      // Upload to MongoDB through API
      const uploadResponse = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        let errorMessage = `Upload failed: ${uploadResponse.status}`;
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += ` - ${errorData.details}`;
          }
        } catch (jsonError) {
          // If JSON parsing fails, use the default error message
          console.error("Failed to parse error JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }
      
      console.log("PDF uploaded successfully, refreshing PDF list");
      
      // Refresh the PDFs list
      try {
        const response = await fetch('/api/admin/get-pdfs');
        if (response.ok) {
          const data = await response.json();
          setPdfs(data.pdfs);
        } else {
          console.warn("Failed to refresh PDFs list after upload:", response.status);
        }
      } catch (refreshError) {
        console.warn("Error refreshing PDFs after upload:", refreshError);
        // Continue anyway since the upload was successful
      }
      
      // No return value needed (void)
    } catch (error) {
      console.error("PDF upload error:", error);
      throw error; // Let the PdfManagement component handle the error
    }
  };

  // Handle approval/rejection of access requests
  const handleApproveRequest = async (id: string, email: string, selectedClass: string, selectedSubject: string) => {
    try {
      console.log(`Approving request: ${id}, email: ${email}`);
      
      // Use the server API 
      const response = await fetch('/api/admin/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          email,
          status: "approved",
          class: selectedClass,
          subject: selectedSubject,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to approve request`);
      }
      
      // Update local state
      setRequests(requests.filter((req) => req.id !== id));
      
      // Add to users list
      setUsers([
        ...users,
        {
          id: email,
          email,
          role: "student",
          class: selectedClass,
          subject: selectedSubject,
        },
      ]);
      
      alert(`User ${email} has been approved.`);
    } catch (error) {
      console.error("Error approving request:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to process request"}`);
    }
  };

  const handleRejectRequest = async (id: string, email: string) => {
    try {
      console.log(`Rejecting request: ${id}, email: ${email}`);
      
      // Use the server API
      const response = await fetch('/api/admin/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          email,
          status: "rejected",
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to reject request`);
      }
      
      // Update local state
      setRequests(requests.filter((req) => req.id !== id));
      alert(`Request from ${email} has been rejected.`);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to process request"}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.adminLayout} style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className={styles.loader} style={{ width: "60px", height: "60px", marginBottom: "1rem" }} />
        <h2 style={{ color: "var(--bg-color)", fontWeight: "500" }}>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.adminLayout} style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <div className={styles.adminSection} style={{
          padding: "3rem",
          maxWidth: "500px"
        }}>
          <div style={{ 
            color: "#ff5252", 
            fontSize: "3rem", 
            marginBottom: "1rem" 
          }}>⚠️</div>
          <h2 style={{ 
            color: "var(--bg-color)", 
            fontWeight: "600",
            marginBottom: "1rem"
          }}>Access Denied</h2>
          <p style={{ 
            color: "var(--bg-color)", 
            opacity: 0.8, 
            marginBottom: "1.5rem" 
          }}>
            You do not have admin privileges to access this page.
          </p>
          <button 
            onClick={() => router.push('/study')}
            className={styles.button}
            style={{
              padding: "0.75rem 1.5rem",
              fontWeight: "500"
            }}
          >
            Return to Study Area
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* PDF Management Component */}
      <PdfManagement 
        pdfs={pdfs} 
        onUpload={handlePdfUpload}
        onDelete={handleDeletePdf}
      />
      
      {/* Access Requests Component */}
      <AccessRequests 
        requests={requests} 
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
      
      {/* User Management Component */}
      <UserManagement 
        users={users} 
        onUpdateUser={handleUserUpdate}
        onRevokeAccess={handleUserRevoke}
      />
    </AdminLayout>
  );
}
