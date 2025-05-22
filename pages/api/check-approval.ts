import { getAdminDb } from "../../utils/firebaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { isValidEmail, normalizeEmail } from "../../utils/validation";
import { formatFirebaseError, FirebaseErrorType, checkFirebaseAdminEnv } from "../../utils/firebase-error-handler";

// Rate limiter: 10 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Method check
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    
    // Rate limit by IP to prevent abuse
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
               req.socket?.remoteAddress || 
               "unknown";
    try {
      await rateLimiter.consume(ip);
    } catch {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const { email } = req.query;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const normalizedEmail = normalizeEmail(email as string);
    
    // Check Firebase Admin environment variables
    const envCheck = checkFirebaseAdminEnv();
    if (!envCheck.valid) {
      console.error("Firebase Admin environment variables are missing:", envCheck.missingVars.join(", "));
    }
    
    // Safe Firebase Admin initialization
    const { adminDb, error: initError } = getAdminDb();
    
    // Handle initialization errors
    if (initError || !adminDb) {
      // Log detailed error for debugging
      console.error("Firebase Admin initialization error:", initError?.message || "Unknown error");
      
      // Format the error using our utility
      const formattedError = formatFirebaseError(initError);
      
      // For certain development environments, provide more details
      const details = process.env.NODE_ENV === 'development' ? {
        missingEnvVars: envCheck.missingVars,
        partialVars: envCheck.partialVars,
        errorName: initError?.name,
        errorMessage: initError?.message
      } : undefined;
      
      // Try client-side Firebase as fallback for this read-only operation
      try {
        // Use client SDK to read user data instead of admin SDK (fallback method)
        const { db } = await import("../../utils/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        
        console.log("Attempting fallback to client-side Firebase for approval check");
        
        const userRef = doc(db, "users", normalizedEmail);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // If user exists and is approved
          if (userData.role === "student") {
            console.log("Used client Firebase fallback successfully");
            return res.status(200).json({ 
              approved: true,
              role: "student",
              class: userData.class,
              subject: userData.subject,
              note: "Using client Firebase fallback due to server configuration issue"
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
        
        // No approved user found
        return res.status(200).json({
          approved: false,
          status: "pending",
          message: "Your request is pending admin approval.",
          note: "Using client Firebase fallback due to server configuration issue"
        });
      } catch (fallbackError) {
        console.error("Fallback to client Firebase also failed:", fallbackError);
          // Send a user-friendly error response with an error code the client can use
        return res.status(500).json({ 
          error: formattedError.message,
          code: formattedError.type,
          details: details
        });
      }
    }

    // Check if this email exists in users collection (meaning admin approved it)
    try {
      const userRef = adminDb.collection("users").doc(normalizedEmail);
      const userSnap = await userRef.get();      if (userSnap.exists) {
        const userData = userSnap.data();
        
        // Get role with fallbacks and normalization
        const userRole = userData?.role ? String(userData.role).toLowerCase() : null;
        
        // Log the actual role for debugging
        console.log(`User ${normalizedEmail} role check: '${userRole}' (original: '${userData?.role}')`);
        
        // If user exists and is approved
        if (userRole === "student") {
          return res.status(200).json({ 
            approved: true,
            role: "student",
            class: userData?.class,
            subject: userData?.subject
          });
        }
        // If user exists but was revoked
        if (userRole === "revoked") {
          return res.status(200).json({
            approved: false,
            status: "revoked",
            message: "Your access has been revoked. Please contact administrator."
          });
        }
        
        // Fix the user role if it's just a case sensitivity issue
        if (userRole === null && userData) {
          console.log(`Attempting to fix user record for ${normalizedEmail} - missing role property`);
          try {
            // Update the user record with proper role if we can infer it
            if (userData.class && userData.subject) {
              // This looks like a student account with valid fields but incorrect role
              await userRef.update({ role: "student" });
              console.log(`Fixed user record for ${normalizedEmail} - added student role`);
              
              return res.status(200).json({ 
                approved: true,
                role: "student",
                class: userData.class,
                subject: userData.subject,
                note: "User role was automatically fixed"
              });
            }
          } catch (fixError) {
            console.error("Failed to fix user role:", fixError);
          }
        }
        
        // User exists but role is unknown or invalid
        return res.status(200).json({
          approved: false,
          status: "unknown",
          message: "Invalid user role. Please contact administrator.",
          debug: process.env.NODE_ENV === 'development' ? { 
            role: userData?.role, 
            normalizedRole: userRole 
          } : undefined
        });
      }

      // No user record, check for access requests
      const requestRef = adminDb.collection("access_requests").doc(normalizedEmail);
      const requestSnap = await requestRef.get();

      if (requestSnap.exists) {
        const requestData = requestSnap.data();
        return res.status(200).json({
          approved: false,
          status: requestData?.status || "pending",
          message: "Your request is pending admin approval."
        });
      }

      // No user record or request found
      return res.status(200).json({
        approved: false,
        status: "not_requested",
        message: "Please request access first."
      });    } catch (dbError) {
      console.error("Firestore operation error:", dbError);
      const formattedError = formatFirebaseError(dbError);
      return res.status(500).json({ 
        error: formattedError.message,
        code: formattedError.type,
        details: process.env.NODE_ENV === 'development' ? 
          (dbError instanceof Error ? dbError.message : String(dbError)) : undefined
      });
    }
  } catch (uncaughtError) {
    // Log all uncaught errors
    console.error("Uncaught error in check-approval API:", uncaughtError);
    const formattedError = formatFirebaseError(uncaughtError);
    return res.status(500).json({ 
      error: formattedError.message,
      code: formattedError.type,
      details: process.env.NODE_ENV === 'development' ? 
        (uncaughtError instanceof Error ? uncaughtError.message : String(uncaughtError)) : undefined
    });
  }
}
