import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getAdminDb } from "../../utils/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = getAuth(req);
    
    // If no user is authenticated, redirect to sign-in
    if (!userId) {
      console.log("No authenticated user found, redirecting to sign-in");
      return res.redirect(307, "/sign-in");
    }
    
    // Try to get user email from Clerk session (via header)
    let userEmail = req.headers['x-clerk-user-email'] as string;
    
    // When making the Clerk API call, make sure it's using CLERK_SECRET_KEY
    if (!userEmail && process.env.CLERK_SECRET_KEY) {
      try {
        const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });
        
        if (clerkRes.ok) {
          const userData = await clerkRes.json();
          userEmail = userData.email_addresses?.[0]?.email_address;
          console.log(`Retrieved email from Clerk API: ${userEmail}`);
        } else {
          console.error("Failed to fetch user from Clerk API:", await clerkRes.text());
        }
      } catch (clerkError) {
        console.error("Error fetching from Clerk API:", clerkError);
      }
    }
    
    if (!userEmail) {
      console.error("Could not retrieve user email, redirecting to sign-in");
      return res.redirect(307, "/sign-in");
    }
    
    // Normalize email
    const normalizedEmail = userEmail.toLowerCase().trim();
    console.log(`Processing redirect for user: ${normalizedEmail}`);
    
    // Check user role in Firebase
    try {
      const { adminDb, error: adminInitError } = getAdminDb();
      
      // If Admin SDK is available, use it
      if (!adminInitError && adminDb) {
        console.log(`Using Firebase Admin SDK to check role for: ${normalizedEmail}`);
        
        const userRef = adminDb.collection("users").doc(normalizedEmail);
        const userSnap = await userRef.get();
        
        if (userSnap.exists) {
          const userData = userSnap.data();
          const userRole = userData?.role?.toLowerCase() || "none";
          
          console.log(`User ${normalizedEmail} role check: '${userRole}' (original: '${userData?.role}')`);
          
          // Redirect based on role
          if (userRole === "admin") {
            console.log(`Redirecting admin user to /admin: ${normalizedEmail}`);
            return res.redirect(307, "/admin");
          } else if (userRole === "student") {
            console.log(`Redirecting student user to /study: ${normalizedEmail}`);
            return res.redirect(307, "/study");
          } else if (userRole === "revoked") {
            console.log(`Redirecting revoked user to /request-access: ${normalizedEmail}`);
            return res.redirect(307, "/request-access");
          } else {
            console.log(`Unknown role '${userRole}', redirecting to /request-access: ${normalizedEmail}`);
            return res.redirect(307, "/request-access");
          }
        } else {
          // User not found in database
          console.log(`User not found in database, redirecting to /sign-up: ${normalizedEmail}`);
          return res.redirect(307, "/sign-up");
        }
      } else {
        // Admin SDK failed, try fallback to client SDK
        console.error("Firebase Admin SDK initialization failed:", adminInitError?.message || "Unknown error");
        console.log("Attempting fallback to client-side Firebase SDK");
        
        // Import client-side Firebase methods
        const { db } = await import("../../utils/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        
        const userRef = doc(db, "users", normalizedEmail);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData?.role?.toLowerCase() || "none";
          
          console.log(`[FALLBACK] User ${normalizedEmail} role: ${userRole}`);
          
          // Same redirection logic as above
          if (userRole === "admin") {
            return res.redirect(307, "/admin");
          } else if (userRole === "student") {
            return res.redirect(307, "/study");
          } else if (userRole === "revoked") {
            return res.redirect(307, "/request-access");
          } else {
            return res.redirect(307, "/request-access");
          }
        } else {
          // User not found in database, redirect to sign-up
          return res.redirect(307, "/sign-up");
        }
      }
    } catch (dbError) {
      console.error("Database error while checking user role:", dbError);
      // If we can't check the role, redirect to sign-in as a fallback
      return res.redirect(307, "/sign-in?error=database_error");
    }
  } catch (error) {
    console.error("Auth redirect error:", error);
    return res.redirect(307, "/sign-in?error=auth_error");
  }
}