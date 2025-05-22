import { getAdminDb } from "../../../utils/firebaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { getAuth } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  // 2. Authenticate the user
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // 3. Verify user has admin role
  try {
    const { adminDb, error } = getAdminDb();
    if (error || !adminDb) {
      console.error("Firebase Admin initialization error:", error?.message || "Unknown error");
      return res.status(500).json({ error: "Server configuration error", code: "firebase_admin_init_failed" });
    }
    
    // First, get the user email from Clerk
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    });
    
    if (!clerkRes.ok) {
      console.error("Failed to fetch user from Clerk:", await clerkRes.text());
      return res.status(401).json({ error: "Authentication failed" });
    }
    
    const clerkData = await clerkRes.json();
    const email = clerkData.email_addresses?.[0]?.email_address;
    
    if (!email) {
      console.error("No email found for user:", userId);
      return res.status(401).json({ error: "User email not found" });
    }

    // Normalize email to match Firebase storage format
    const normalizedEmail = email.toLowerCase().trim();
    
    // Then check user role in Firestore
    const userRef = adminDb.collection("users").doc(normalizedEmail);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
  } catch (authError) {
    console.error("Authorization check error:", authError);
    return res.status(500).json({ error: "Authorization check failed" });
  }

  const { id, email, status, class: studentClass, subject } = req.body;

  // Validate input
  if (!id || !email || !status || typeof id !== "string" || typeof email !== "string" || 
      typeof status !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }
  
  try {
    // Get admin DB instance for all operations
    const { adminDb, error } = getAdminDb();
    if (error || !adminDb) {
      console.error("Firebase Admin initialization error:", error?.message || "Unknown error");
      return res.status(500).json({ error: "Server configuration error", code: "firebase_admin_init_failed" });
    }

    if (status === "approved") {
      // For approvals, we need class and subject
      if (!studentClass || !subject) {
        return res.status(400).json({ error: "Class and subject are required for approval" });
      }

      // First, add the user to the users collection
      await adminDb.collection("users").doc(email).set({
        email,
        role: "student",
        class: studentClass,
        subject: subject,
        approvedAt: new Date().toISOString()
      });

      // Then update the request status
      await adminDb.collection("access_requests").doc(id).update({ 
        status: "approved",
        approvedAt: new Date().toISOString()
      });
      
      // Send approval email
      try {
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
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Continue execution - don't fail the request just because email failed
      }
    } else if (status === "rejected") {
      // For rejections, remove the request
      await adminDb.collection("access_requests").doc(id).delete();
      
      // Send rejection email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
          to: email,
          subject: "AIMS Access Request Update",
          html: `
            <p>Your access request was not approved at this time.</p>
            <p>If you believe this was a mistake, please contact us.</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Continue execution - don't fail the request just because email failed
      }
    } else if (status === "update") {
      // For updates to user properties (class, subject)
      // Create an update object with only the fields that were provided
      const updateData: Record<string, any> = {};
      
      if (studentClass) updateData.class = studentClass;
      if (subject) updateData.subject = subject;
      
      // Only update if there are changes to make
      if (Object.keys(updateData).length > 0) {
        await adminDb.collection("users").doc(email).update(updateData);
        
        // Send notification email about the update
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
            to: email,
            subject: "AIMS Account Updated",
            html: `
              <h2>Your AIMS Account Has Been Updated</h2>
              <p>An administrator has updated your account information:</p>
              ${studentClass ? `<p><strong>Class:</strong> ${studentClass}</p>` : ''}
              ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
            `
          });
        } catch (emailError) {
          console.error("Failed to send update email:", emailError);
          // Continue execution - don't fail the request just because email failed
        }
      }
    } else if (status === "revoked") {
      // For revoking user access
      // Update user role to revoked
      await adminDb.collection("users").doc(email).update({
        role: "revoked",
        revokedAt: new Date().toISOString()
      });
      
      // Send notification email about the revocation
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@aims.com",
          to: email,
          subject: "AIMS Access Revoked",
          html: `
            <h2>Your AIMS Access Has Been Revoked</h2>
            <p>An administrator has revoked your access to the AIMS platform.</p>
            <p>If you believe this was a mistake, please contact us.</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send revocation email:", emailError);
        // Continue execution - don't fail the request just because email failed
      }
    }

    return res.status(200).json({ 
      message: 
        status === "approved" ? "User approved successfully" : 
        status === "rejected" ? "Request rejected successfully" :
        status === "update" ? "User updated successfully" :
        status === "revoked" ? "User access revoked successfully" :
        "Request processed successfully"
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({ error: "Failed to update request" });
  }
}