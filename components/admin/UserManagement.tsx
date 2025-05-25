import styles from '../../styles/admin.module.css';
import cardStyles from '../../styles/admin-card-fixes.module.css';
import userStyles from '../../styles/user-management.module.css';

type User = {
  id: string;
  email: string;
  role: string;
  class?: string;
  subject?: string;
};

interface UserManagementProps {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  onRevokeAccess: (userId: string, email: string) => Promise<void>;
}

export default function UserManagement({ users, onUpdateUser, onRevokeAccess }: UserManagementProps) {
  return (
    <section className={styles.adminSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionIconWrapper}>🔑</span>
        User Management <span style={{ fontSize: "0.9rem", marginLeft: "0.5rem", opacity: 0.8 }}>({users.length})</span>
      </h2>
      
      {users.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {users.map((user) => (
            <div
              key={user.id}
              className={userStyles.userCard}
              style={{
                padding: "1.25rem",
                border: "1px solid rgba(100, 123, 255, 0.2)",
                borderLeft: user.role === "admin" 
                  ? "4px solid #e74c3c"  // Admin color
                  : user.role === "revoked"
                    ? "4px solid #95a5a6" // Revoked color
                    : "4px solid var(--main-color)", // Student color
                borderRadius: "8px",
                background: "rgba(13, 15, 38, 0.5)",
                opacity: user.role === "revoked" ? 0.7 : 1,
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                transition: "all var(--transition-fast)"
              }}
            >
              <div className={userStyles.userCardHeader}>                <div className={userStyles.userEmail}>
                  <p className={`${cardStyles.cardText}`} style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "600", 
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>                    <span style={{ color: "var(--main-color)", flexShrink: 0 }}>📧</span>
                    <span className={userStyles.truncateText} style={{ 
                      width: "100%",
                      display: "inline-block"
                    }}>
                      {user.email}
                    </span>
                  </p>
                </div>
                
                <div className={userStyles.userBadge}>
                  <span style={{
                    padding: "0.25rem 0.8rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    backgroundColor: user.role === "admin"
                      ? "rgba(231, 76, 60, 0.2)"
                      : user.role === "student"
                        ? "rgba(100, 123, 255, 0.2)"
                        : "rgba(149, 165, 166, 0.2)",
                    color: user.role === "admin"
                      ? "#e74c3c"
                      : user.role === "student"
                        ? "var(--main-color)"
                        : "#95a5a6",
                    border: user.role === "admin"
                      ? "1px solid rgba(231, 76, 60, 0.3)"
                      : user.role === "student"
                        ? "1px solid rgba(100, 123, 255, 0.3)"
                        : "1px solid rgba(149, 165, 166, 0.3)",
                    display: "inline-block"
                  }}>
                    {user.role}
                  </span>
                </div>
              </div>
              
              {(user.class || user.subject) && (
                <div className={userStyles.userDetails}>
                  {user.class && (
                    <span style={{ 
                      marginRight: "1rem", 
                      display: "inline-flex", 
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ color: "var(--main-color)" }}>📚</span> 
                      <strong>Class:</strong> {user.class}
                    </span>
                  )}
                  
                  {user.subject && (
                    <span style={{ 
                      display: "inline-flex", 
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ color: "var(--main-color)" }}>📝</span> 
                      <strong>Subject:</strong> {user.subject}
                    </span>
                  )}
                </div>
              )}
                {/* Action buttons conditionally rendered based on role */}
              {user.role !== "admin" && user.role !== "revoked" && (
                <div className={userStyles.userControls}>                  <select
                    className={`${cardStyles.cardFormGroup} ${userStyles.controlItem}`}
                    onChange={(e) => {
                      if (e.target.value !== user.class) {
                        onUpdateUser(user.id, { class: e.target.value });
                      }
                    }}
                    value={user.class || ""}
                    aria-label="Select class"
                  >
                    <option value="" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Change Class</option>
                    <option value="Class 10" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Class 10</option>
                    <option value="Class 12" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Class 12</option>
                  </select>                  <select
                    className={`${cardStyles.cardFormGroup} ${userStyles.controlItem}`}
                    onChange={(e) => {
                      if (e.target.value !== user.subject) {
                        onUpdateUser(user.id, { subject: e.target.value });
                      }
                    }}
                    value={user.subject || ""}
                    aria-label="Select subject"
                  >
                    <option value="" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Change Subject</option>
                    <option value="Math" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Math</option>
                    <option value="Physics" style={{ color: "#ddd", backgroundColor: "var(--box-color)" }}>Physics</option>                  </select>                  <button
                    className={`${cardStyles.cardButton} ${userStyles.controlButton}`}
                    onClick={() => onRevokeAccess(user.id, user.email)}
                    aria-label="Revoke access"
                  >
                    Revoke Access
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={cardStyles.noContentMessage}>
          <p>No users found.</p>
        </div>
      )}
    </section>
  );
}
