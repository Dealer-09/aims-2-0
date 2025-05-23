import { useState } from "react";
import styles from '../../styles/admin.module.css';
import cardStyles from '../../styles/admin-card-fixes.module.css';

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
    <section className={styles.adminSection}>      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionIconWrapper}>📄</span>
        PDF Management
      </h2>
      <form onSubmit={handlePdfUpload} className={cardStyles.formContainer}>
        <div className={`${styles.formGroup} ${cardStyles.cardFormGroup}`}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className={styles.fileInput}
          />          <select 
            value={pdfClass} 
            onChange={(e) => setPdfClass(e.target.value)}
            className={styles.select}
            required
          >
            <option value="" style={{ color: "#ddd", fontWeight: "600", backgroundColor: "var(--box-color)" }}>Select Class</option>
            <option value="Class 10" style={{ color: "#ddd", fontWeight: "500", backgroundColor: "var(--box-color)" }}>Class 10</option>
            <option value="Class 12" style={{ color: "#ddd", fontWeight: "500", backgroundColor: "var(--box-color)" }}>Class 12</option>
          </select>
          <select 
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
        {uploadSuccess && (          <div className={styles.successMessage}>
            {uploadSuccess}
          </div>
        )}
      </form>
      <div className={cardStyles.sectionContainer}><h3 className={cardStyles.sectionHeading}>
          Uploaded PDFs
        </h3>
        {pdfs.length > 0 ? (
          <div className={cardStyles.adminCardTableContainer}>
            <table className={cardStyles.adminTable}>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf, index) => (
                  <tr key={pdf.id}>
                    <td>
                      <a 
                        href={pdf.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cardStyles.fileLink}
                      >
                        <span>📄</span> {pdf.filename}
                      </a>
                    </td>
                    <td>{pdf.class}</td>
                    <td>{pdf.subject}</td>
                    <td>
                      <button
                        onClick={() => onDelete(pdf.id)}
                        className={cardStyles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={cardStyles.noContentMessage}>
            No PDFs uploaded yet.
          </p>
        )}
      </div>
    </section>
  );
}
