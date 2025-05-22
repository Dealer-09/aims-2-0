import { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "../../../utils/firebaseAdmin";
import { formatFirebaseError } from "../../../utils/firebase-error-handler";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  // Authenticate the request with Clerk
  const { userId } = getAuth(req);
  if (!userId) {
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
    
    // Get the data from the request body
    const { email, role } = req.body;
    
    if (!email || typeof email !== "string" || !role || typeof role !== "string") {
      return res.status(400).json({ error: "Valid email and role are required" });
    }
    
    // Validate role
    const validRoles = ["student", "admin", "revoked"];
    const normalizedRole = role.toLowerCase();
    
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role. Must be one of: student, admin, revoked" });
    }
    
    // Update the user record
    const userRef = adminDb.collection("users").doc(email);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found", email });
    }
    
    // Update the role
    await userRef.update({ role: normalizedRole });
    
    return res.status(200).json({
      success: true,
      message: `User role updated to ${normalizedRole}`,
      email
    });
    
  } catch (error) {
    console.error("Error updating user role:", error);
    const formattedError = formatFirebaseError(error);
    return res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.type,
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
