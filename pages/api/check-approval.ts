import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.query;
  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    // Check if this email exists in users collection (meaning admin approved it)
    const userRef = doc(db, "users", normalizedEmail);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      // If user exists and is approved
      if (userData.role === "student") {
        return res.status(200).json({ 
          approved: true,
          role: "student",
          class: userData.class,
          subject: userData.subject
        });
      }
      // If user exists but was revoked
      if (userData.role === "revoked") {
        return res.status(200).json({
          approved: false,
          status: "revoked",
          message: "Your access has been revoked. Please contact administrator."
        });
      }
    }

    // Check if there's a pending request
    const requestRef = doc(db, "access_requests", normalizedEmail);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists()) {
      const requestData = requestSnap.data();
      return res.status(200).json({
        approved: false,
        status: requestData.status,
        message: "Your request is pending admin approval."
      });
    }

    // No user record or request found
    return res.status(200).json({
      approved: false,
      status: "not_requested",
      message: "Please request access first."
    });

  } catch (error) {
    console.error("Error checking approval:", error);
    return res.status(500).json({ error: "Error checking approval status" });
  }
}
