import { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "../../utils/firebaseAdmin";
import { formatFirebaseError } from "../../utils/firebase-error-handler";
import { getAuth } from "@clerk/nextjs/server";
import { isValidEmail, normalizeEmail } from "../../utils/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // Authenticate the request with Clerk
  const { userId, sessionId } = getAuth(req);
  if (!userId || !sessionId) {
    return res.status(401).json({ error: "Unauthorized - Authentication required" });
  }
  try {
    const userEmail = req.query.email as string;
    if (!userEmail) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Normalize the email to ensure consistent lookup
    if (!isValidEmail(userEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
      const normalizedEmail = normalizeEmail(userEmail);
    // Get Admin SDK instance
    const { adminDb, error: adminInitError } = getAdminDb();
    
    if (adminInitError || !adminDb) {
      console.error("Firebase Admin initialization error:", adminInitError?.message || "Unknown error");
      
      // Try using client-side Firebase as fallback
      try {
        const { db } = await import("../../utils/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        
        console.log("Attempting fallback to client-side Firebase for user role lookup");
        
        const userRef = doc(db, "users", normalizedEmail);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData?.role || "none";
          
          return res.status(200).json({
            role: userRole.toLowerCase(),
            class: userData?.class,
            subject: userData?.subject,
            note: "Using client Firebase fallback"
          });
        }
        
        return res.status(200).json({ role: "none" });
      } catch (fallbackError) {
        console.error("Fallback to client Firebase failed:", fallbackError);
        return res.status(500).json({ error: "Server configuration error", code: "firebase_admin_init_failed" });
      }
    }      const userRef = adminDb.collection("users").doc(normalizedEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.log(`No user record found for ${normalizedEmail}`);
      return res.status(200).json({ role: "none" });
    }

    const userData = userSnap.data();
    // Validate the role field
    const validRoles = ["admin", "student", "revoked"];
    const userRole = (userData?.role || "none").toLowerCase();
    
    if (!validRoles.includes(userRole)) {
      console.warn(`Invalid role '${userRole}' detected for user ${normalizedEmail}`);
    }

    console.log(`User role lookup successful for ${normalizedEmail}: ${userRole}`);
    
    return res.status(200).json({
      role: userRole,
      class: userData?.class,
      subject: userData?.subject
    });} catch (error) {
    console.error("Error fetching user role:", error);
    const formattedError = formatFirebaseError(error);
    return res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.type,
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}
