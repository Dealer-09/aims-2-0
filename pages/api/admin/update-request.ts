import { db } from "@/utils/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id, email, status } = req.body;
  // Validate input
  if (!id || !email || !status || typeof id !== "string" || typeof email !== "string" || typeof status !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  try {
    if (status === "approved") {
      await updateDoc(doc(db, "access_requests", id), { status });
      await updateDoc(doc(db, "users", email), { role: "student" });

      // Send Approval Email
      await resend.emails.send({
        from: "no-reply@yourdomain.com",
        to: email,
        subject: "Access Approved",
        html: `<p>Your access request has been approved. You can now sign up and access study materials.</p>`,
      });
    } else {
      await deleteDoc(doc(db, "access_requests", id));

      // Send Rejection Email
      await resend.emails.send({
        from: "no-reply@yourdomain.com",
        to: email,
        subject: "Access Denied",
        html: `<p>Unfortunately, your request was not approved.</p>`,
      });
    }

    return res.status(200).json({ message: "Request updated successfully." });
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({ error: "Failed to update request." });
  }
}
