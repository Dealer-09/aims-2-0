import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getAdminDb } from "../../utils/firebaseAdmin";
import { formatFirebaseError } from "../../utils/firebase-error-handler";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  // Authenticate the request with Clerk
  const { userId, sessionId } = getAuth(req);
  if (!userId || !sessionId) {
    return res.status(401).json({ error: "Unauthorized - Authentication required" });
  }
    // Verify admin privileges
  try {
    const { adminDb, error: adminInitError } = getAdminDb();
    
    if (adminInitError || !adminDb) {
      console.error("Firebase Admin initialization error:", adminInitError?.message || "Unknown error");
      return res.status(500).json({ error: "Server configuration error", code: "firebase_admin_init_failed" });
    }
    
    const adminRef = adminDb.collection("users").doc(userId);
    const adminSnap = await adminRef.get();
    
    if (!adminSnap.exists || adminSnap.data()?.role !== "admin") {
      return res.status(403).json({ error: "Access denied - Admin privileges required" });
    }
  } catch (authError) {
    console.error("Error checking admin privileges:", authError);
    const formattedError = formatFirebaseError(authError);
    return res.status(500).json({ error: formattedError.message });
  }
  const { email } = req.query;
  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    // Get Admin SDK instance
    const { adminDb, error: adminInitError } = getAdminDb();
    
    if (adminInitError || !adminDb) {
      console.error("Firebase Admin initialization error:", adminInitError?.message || "Unknown error");
      return res.status(500).json({ error: "Server configuration error", code: "firebase_admin_init_failed" });
    }
    
    const userRef = adminDb.collection("users").doc(normalizedEmail);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return res.status(200).json({ approved: true });
    } else {
      return res.status(200).json({ approved: false });
    }
  } catch (error) {
    console.error("Error checking approval:", error);
    const formattedError = formatFirebaseError(error);
    return res.status(500).json({ error: formattedError.message });
  }
}
