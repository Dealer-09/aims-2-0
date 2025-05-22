import { useState } from "react";
import styles from '../../styles/admin.module.css';

type PDF = {
  id: string;
  url: string;
  filename: string;
  class: string;
  subject: string;
};

interface PdfManagementProps {
  pdfs: PDF[];
  onUpload: (file: File, pdfClass: string, pdfSubject: string) => Promise<void>;
  onDelete: (pdfId: string) => Promise<void>;
}

export default function PdfManagement({ pdfs, onUpload, onDelete }: PdfManagementProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfClass, setPdfClass] = useState("");
  const [pdfSubject, setPdfSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

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
      await onUpload(pdfFile, pdfClass, pdfSubject);
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
  return (
    <section className={styles.adminSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionIconWrapper}>📄</span>
        PDF Management
      </h2>
        <form onSubmit={handlePdfUpload} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.formGroup}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className={styles.fileInput}
          />
          <select 
            value={pdfClass} 
            onChange={(e) => setPdfClass(e.target.value)}
            className={styles.select}
            required
          >
            <option value="" style={{ color: "#ddd", fontWeight: "600", backgroundColor: "var(--box-color)" }}>Select Class</option>
            <option value="Class 10" style={{ color: "#ddd", fontWeight: "500", backgroundColor: "var(--box-color)" }}>Class 10</option>
            <option value="Class 12" style={{ color: "#ddd", fontWeight: "500", backgroundColor: "var(--box-color)" }}>Class 12</option>
          </select>          <select 
            value={pdfSubject} 
            onChange={(e) => setPdfSubject(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select Subject</option>
            <option value="Math">Math</option>
            <option value="Physics">Physics</option>
          </select>
          <button 
            type="submit" 
            disabled={uploading}
            className={styles.button}
          >
            {uploading && <span className={styles.loader}></span>}
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>        {uploadError && (
          <div className={styles.errorMessage}>
            {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div className={styles.successMessage}>
            {uploadSuccess}
          </div>
        )}
      </form>

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ 
          marginBottom: "1rem", 
          color: "var(--main-color)", 
          fontWeight: "600",
          fontSize: "1.1rem" 
        }}>
          Uploaded PDFs
        </h3>
        {pdfs.length > 0 ? (
          <div style={{ 
            borderRadius: "8px", 
            overflow: "hidden",
            border: "1px solid rgba(100, 123, 255, 0.2)"
          }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(13, 15, 38, 0.8)" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid var(--main-color)", color: "var(--bg-color)" }}>Filename</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid var(--main-color)", color: "var(--bg-color)" }}>Class</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid var(--main-color)", color: "var(--bg-color)" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid var(--main-color)", color: "var(--bg-color)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf, index) => (
                  <tr 
                    key={pdf.id} 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? "rgba(13, 15, 38, 0.4)" : "rgba(13, 15, 38, 0.5)",
                      borderBottom: "1px solid rgba(100, 123, 255, 0.1)",
                      transition: "background-color var(--transition-fast)"
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <a 
                        href={pdf.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--main-color)",
                          textDecoration: "none",
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>📄</span> {pdf.filename}
                      </a>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--bg-color)" }}>{pdf.class}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--bg-color)" }}>{pdf.subject}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => onDelete(pdf.id)}
                        style={{
                          padding: "0.4rem 1rem",
                          background: "rgba(231, 76, 60, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "all var(--transition-fast)",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ 
            color: "var(--bg-color)", 
            fontStyle: "italic",
            opacity: 0.7,
            padding: "1rem",
            background: "rgba(13, 15, 38, 0.4)",
            borderRadius: "6px",
            textAlign: "center" 
          }}>
            No PDFs uploaded yet.
          </p>
        )}
      </div>
    </section>
  );
}
