import { db } from "@/utils/firebase";
import { doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id, email, status, class: studentClass, subject } = req.body;

  // Validate input
  if (!id || !email || !status || typeof id !== "string" || typeof email !== "string" || 
      typeof status !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  try {
    if (status === "approved") {
      // For approvals, we need class and subject
      if (!studentClass || !subject) {
        return res.status(400).json({ error: "Class and subject are required for approval" });
      }

      // First, add the user to the users collection
      await setDoc(doc(db, "users", email), {
        email,
        role: "student",
        class: studentClass,
        subject: subject,
        approvedAt: new Date().toISOString()
      });

      // Then update the request status
      await updateDoc(doc(db, "access_requests", id), { 
        status: "approved",
        approvedAt: new Date().toISOString()
      });

      // Send approval email
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
        to: email,
        subject: "AIMS Access Approved",
        html: `
          <h2>Welcome to AIMS!</h2>
          <p>Your access request has been approved.</p>
          <p><strong>Class:</strong> ${studentClass}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>You can now sign in to access your study materials.</p>
        `
      });
    } else {
      // For rejections, remove the request
      await deleteDoc(doc(db, "access_requests", id));

      // Send rejection email
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
        to: email,
        subject: "AIMS Access Request Update",
        html: `
          <p>Your access request was not approved at this time.</p>
          <p>If you believe this was a mistake, please contact us.</p>
        `
      });
    }

    return res.status(200).json({ 
      message: status === "approved" ? "User approved successfully" : "Request rejected successfully" 
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({ error: "Failed to update request" });
  }
}
