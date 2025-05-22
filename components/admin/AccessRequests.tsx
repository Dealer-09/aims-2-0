import { useState } from "react";
import styles from '../../styles/admin.module.css';

type Request = {
  id: string;
  email: string;
  status: string;
  requestedAt: string;
};

interface AccessRequestsProps {
  requests: Request[];
  onApprove: (id: string, email: string, selectedClass: string, selectedSubject: string) => Promise<void>;
  onReject: (id: string, email: string) => Promise<void>;
}

export default function AccessRequests({ requests, onApprove, onReject }: AccessRequestsProps) {
  const [selectedClass, setSelectedClass] = useState<{ [key: string]: string }>({});
  const [selectedSubject, setSelectedSubject] = useState<{ [key: string]: string }>({});

  const handleApproval = async (id: string, email: string) => {
    if (!selectedClass[id] || !selectedSubject[id]) {
      alert("Please select a class and subject before approving.");
      return;
    }
    
    await onApprove(id, email, selectedClass[id], selectedSubject[id]);
  };
  return (
    <section className={styles.adminSection} style={{
      marginTop: "1.5rem",
      marginBottom: "1.5rem"
    }}>      <h2 className={styles.sectionTitle} style={{
        display: "flex",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={styles.sectionIconWrapper}>👥</span>
          <span>Pending Access Requests</span>
        </div>        {requests.length > 0 && (
          <span className={`${styles.badge} ${styles.badgePrimary}`} style={{
            width: "30px", 
            height: "30px",
            display: "flex",
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: "bold"
          }}>
            {requests.length}
          </span>
        )}
      </h2>
      
      {requests.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((req) => (            <div 
              key={req.id} 
              className={styles.card}
              style={{
                padding: "1.25rem",
                borderLeft: "4px solid var(--main-color)",
                position: "relative"
              }}
            >
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: "600", 
                      color: "var(--bg-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span style={{ color: "var(--main-color)" }}>📧</span>
                      {req.email}
                    </p>
                    <p style={{ 
                      fontSize: "0.85rem", 
                      color: "var(--bg-color)", 
                      opacity: 0.7,
                      marginTop: "0.25rem" 
                    }}>
                      Requested on {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1rem",
                  marginTop: "0.5rem" 
                }}>                  <select
                    value={selectedClass[req.id] || ""}
                    onChange={(e) => setSelectedClass({ ...selectedClass, [req.id]: e.target.value })}
                    className={styles.select}
                    style={{ width: "100%" }}
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  
                  <select
                    value={selectedSubject[req.id] || ""}
                    onChange={(e) => setSelectedSubject({ ...selectedSubject, [req.id]: e.target.value })}
                    className={styles.select}
                    style={{ width: "100%" }}
                    required
                  >                    <option value="">Select Subject</option>
                    <option value="Math">Math</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>
                  <div style={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  gap: "1rem",
                  marginTop: "0.5rem" 
                }}>
                  <button
                    onClick={() => onReject(req.id, req.email)}
                    className={styles.button}
                    style={{
                      background: "rgba(231, 76, 60, 0.85)",
                      boxShadow: "0 2px 6px rgba(231, 76, 60, 0.3)"
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproval(req.id, req.email)}
                    className={styles.button}
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (        <div className={styles.card} style={{ 
          padding: "1.5rem", 
          textAlign: "center", 
          opacity: 0.7,
          border: "1px dashed rgba(100, 123, 255, 0.3)"
        }}>
          <p>No pending access requests.</p>
        </div>
      )}
    </section>
  );
}
