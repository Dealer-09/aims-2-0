import { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "../../../utils/firebaseAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { connectToMongoDB } from '../../../utils/mongodb';
import PdfModel from '../../../models/Pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  // Authenticate the user
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Verify user has admin role
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
    }    // Connect to MongoDB and fetch PDFs
    try {
      // Connect to MongoDB
      await connectToMongoDB();
      
      // Fetch all PDFs from MongoDB
      const pdfs = await PdfModel.find({}).sort({ uploadedAt: -1 });
      
      const formattedPdfs = pdfs.map(pdf => ({
        id: pdf._id.toString(),
        filename: pdf.originalName,
        class: pdf.class,
        subject: pdf.subject,
        uploadedAt: pdf.uploadedAt.toISOString(),
        size: pdf.size,
        url: `/api/pdfs/${pdf._id}`
      }));
      
      return res.status(200).json({ pdfs: formattedPdfs });
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      return res.status(500).json({ error: "Failed to fetch PDFs" });
    }
  } catch (authError) {
    console.error("Authorization check error:", authError);
    return res.status(500).json({ error: "Authorization check failed" });
  }
}
