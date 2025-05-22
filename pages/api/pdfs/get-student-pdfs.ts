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

  try {
    // Get Firebase Admin instance for user role/class/subject check
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
    }    // Normalize email to match Firebase storage format
    const normalizedEmail = email.toLowerCase().trim();
    
    // Get the user's class and subject from Firestore
    const userRef = adminDb.collection("users").doc(normalizedEmail);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return res.status(403).json({ error: "Access denied. You need to be an approved student." });
    }
    
    const userData = userSnap.data();
    
    if (!userData) {
      return res.status(500).json({ error: "User data not found." });
    }
    
    if (userData.role !== "student") {
      return res.status(403).json({ error: "Access denied. Student role required." });
    }
    
    // Get the student's assigned class and subject
    const studentClass = userData.class;
    const studentSubject = userData.subject;
    
    if (!studentClass || !studentSubject) {
      return res.status(400).json({ error: "Your account is missing class or subject assignment. Contact administrator." });
    }

    // Connect to MongoDB to fetch PDFs that match the student's class and subject
    await connectToMongoDB();    // Query PDFs from MongoDB that match the student's class and subject
    const pdfs = await PdfModel.find({ 
      class: studentClass,
      subject: studentSubject
    }).sort({ uploadedAt: -1 }).lean();
    
    const formattedPdfs = pdfs.map(pdf => ({
      id: pdf._id?.toString() || '',
      filename: pdf.originalName || '',
      uploadedAt: pdf.uploadedAt ? pdf.uploadedAt.toISOString() : new Date().toISOString(),
      url: `/api/pdfs/${pdf._id}`
    }));
    
    return res.status(200).json({ pdfs: formattedPdfs });
  } catch (error) {
    console.error("Error fetching student PDFs:", error);
    return res.status(500).json({ error: "Failed to fetch PDFs" });
  }
}
