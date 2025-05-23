import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getAdminDb } from "../../../utils/firebaseAdmin";
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { clientPromise, getGridFS } from '../../../utils/mongodb';
import PdfModel from '../../../models/Pdf';
import { connectToMongoDB } from '../../../utils/mongodb';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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
      return res.status(401).json({ error: "Authentication failed" });
    }
    
    const clerkData = await clerkRes.json();
    const email = clerkData.email_addresses?.[0]?.email_address;
    
    if (!email) {
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

    // Parse the form with formidable
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10 MB limit
    });    const [fields, files]: [Record<string, string[]>, Record<string, any[]>] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields as Record<string, string[]>, files as Record<string, any[]>]);
      });
    });

    // Validate class and subject
    const pdfClass = fields.class?.[0];
    const pdfSubject = fields.subject?.[0];

    if (!pdfClass || !pdfSubject) {
      return res.status(400).json({ error: "Class and subject are required" });
    }

    // Connect to MongoDB
    await connectToMongoDB();    const pdfFile = files.file?.[0];
    if (!pdfFile) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Check if required properties exist
    if (!pdfFile.filepath || !pdfFile.originalFilename || !pdfFile.mimetype || !pdfFile.size) {
      return res.status(400).json({ error: "Invalid file upload data" });
    }

    // Check file type
    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    try {      // Get the GridFS bucket
      const bucket = await getGridFS();
      
      // Read the file
      const fileData = await fs.readFile(pdfFile.filepath);
      
      // Create a filename for storage
      const filename = `${Date.now()}-${pdfFile.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload to GridFS
      console.log(`Creating upload stream for file: ${filename}`);
      const uploadStream = bucket.openUploadStream(filename);
      
      try {
        await new Promise<void>((resolve, reject) => {
          // Set up event handlers before writing data
          uploadStream.on('error', (err: Error) => {
            console.error("Error uploading to GridFS:", err);
            reject(err);
          });
          
          uploadStream.on('finish', () => {
            console.log(`Successfully uploaded file to GridFS: ${filename}`);
            resolve();
          });
          
          // Write data to stream
          uploadStream.end(fileData);
        });
        
        console.log(`File uploaded successfully, creating metadata document with fileId: ${uploadStream.id}`);
        
        // After successful upload, create PDF metadata document
        try {
          const newPdf = new PdfModel({
            filename,
            originalName: pdfFile.originalFilename,
            fileId: uploadStream.id,
            class: pdfClass,
            subject: pdfSubject,
            size: pdfFile.size,
            uploadedAt: new Date(),
            uploadedBy: normalizedEmail
          });
          
          await newPdf.save();
          console.log(`PDF metadata saved with ID: ${newPdf._id}`);
          
          return res.status(200).json({ 
            success: true, 
            pdf: {
              id: newPdf._id.toString(),
              filename: pdfFile.originalFilename,
              class: pdfClass,
              subject: pdfSubject
            }
          });
        } catch (metadataError) {
          console.error("Error saving PDF metadata:", metadataError);
          
          // If metadata saving fails, clean up the GridFS file
          try {
            await bucket.delete(uploadStream.id);
            console.log(`Cleaned up GridFS file after metadata save failure: ${uploadStream.id}`);
          } catch (cleanupError) {
            console.error("Error cleaning up GridFS file after metadata save failure:", cleanupError);
          }
          
          throw metadataError;
        }
      } catch (error) {
        console.error("Error in upload process:", error);
        
        // If we have a fileId from the upload stream, try to clean it up
        if (uploadStream && uploadStream.id) {
          try {
            await bucket.delete(uploadStream.id);
          } catch (deleteError) {
            console.error("Error cleaning up GridFS file after failure:", deleteError);
          }
        }
        
        return res.status(500).json({ error: "Failed to upload PDF" });
      }
    } catch (error) {
      console.error("PDF upload error:", error);
      return res.status(500).json({ error: "Failed to process PDF upload" });
    }
  } catch (error) {
    console.error("PDF upload error:", error);
    return res.status(500).json({ error: "Failed to process PDF upload" });
  }
}
