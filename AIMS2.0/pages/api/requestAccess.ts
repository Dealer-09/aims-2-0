import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendEmail } from "@/utils/sendEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    // Reference Firestore document for the email
    const docRef = doc(db, "access_requests", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return res.status(400).json({ error: "Request already submitted. Please wait for admin approval." });
    }

    // Store the new request in Firestore
    await setDoc(docRef, {
      email,
      status: "pending",
      requestedAt: new Date().toISOString()
    });

    // Send email to admin
    const adminEmail = "admin@yourwebsite.com"; // TODO: Set your real admin email
    await sendEmail(
      adminEmail,
      "New Access Request",
      `${email} is asking for access to AIMS.`
    );

    return res.status(200).json({ message: "Request sent. Waiting for admin approval!" });
  } catch (error) {
    console.error("Firestore Error:", error);
    return res.status(500).json({ message: "Error storing request." });
  }
}
