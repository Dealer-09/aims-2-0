import { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "../../../utils/firebaseAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { connectToMongoDB, getGridFS } from "../../../utils/mongodb";
import PdfModel from "../../../models/Pdf";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  // Authenticate the user
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { pdfId } = req.body;

  if (!pdfId || typeof pdfId !== "string") {
    return res.status(400).json({ error: "Missing or invalid PDF ID" });
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
    }    // Normalize email to match Firebase storage format
    const normalizedEmail = email.toLowerCase().trim();
    
    // Then check user role in Firestore
    const userRef = adminDb.collection("users").doc(normalizedEmail);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    // Delete the PDF from MongoDB
    try {
      // Connect to MongoDB
      await connectToMongoDB();
      
      // First find the PDF to get its file ID
      const pdfDocument = await PdfModel.findById(pdfId);
      
      if (!pdfDocument) {
        return res.status(404).json({ error: "PDF not found" });
      }
      
      // Get the file ID to delete from GridFS
      const fileId = pdfDocument.fileId;
      
      // Delete the PDF metadata from MongoDB
      await PdfModel.findByIdAndDelete(pdfId);
        // Also delete the actual file from GridFS
      try {
        const bucket = await getGridFS();
        await bucket.delete(new ObjectId(fileId));
      } catch (gridFsError) {
        console.error("Error deleting PDF file from GridFS:", gridFsError);
        // Continue anyway, as we've already deleted the metadata
      }
      
      return res.status(200).json({ message: "PDF deleted successfully" });
    } catch (error) {
      console.error("Error deleting PDF:", error);
      return res.status(500).json({ error: "Failed to delete PDF" });
    }
  } catch (authError) {
    console.error("Authorization check error:", authError);
    return res.status(500).json({ error: "Authorization check failed" });
  }
}
