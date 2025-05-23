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
    try {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      });
      
      if (!clerkRes.ok) {
        const errorText = await clerkRes.text();
        console.error("Failed to fetch user from Clerk:", errorText);
        return res.status(401).json({ error: "Authentication failed", details: errorText });
      }
      
      const clerkData = await clerkRes.json();
      const email = clerkData.email_addresses?.[0]?.email_address;
      
      if (!email) {
        console.error("No email found for user:", userId);
        return res.status(401).json({ error: "User email not found" });
      }    
      
      // Normalize email to match Firebase storage format
      const normalizedEmail = email.toLowerCase().trim();
      
      // Get the user's class and subject from Firestore
      try {
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
        try {
          console.log(`Connecting to MongoDB to fetch PDFs for class: ${studentClass}, subject: ${studentSubject}`);
          
          try {
            await connectToMongoDB();
            console.log('MongoDB connection successful');
          } catch (connectionError) {
            console.error("MongoDB connection error:", connectionError);
            // Check for SSL/TLS specific errors
            const errorMessage = connectionError instanceof Error ? connectionError.message : String(connectionError);
            
            if (errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('certificate')) {
              console.error("SSL/TLS Certificate validation error detected");
              return res.status(500).json({ 
                error: "Database connection error: SSL/TLS certificate issue", 
                details: "The server encountered an SSL/TLS configuration issue. Please contact the administrator."
              });
            }
            
            return res.status(500).json({ 
              error: "Failed to connect to database", 
              details: errorMessage
            });
          }
          
          // Query PDFs from MongoDB that match the student's class and subject
          try {
            console.log('Querying for PDFs...');
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
            
            console.log(`Found ${pdfs.length} PDFs for student ${normalizedEmail}`);
            return res.status(200).json({ pdfs: formattedPdfs });
          } catch (mongoQueryError) {
            console.error("Error querying PDFs from MongoDB:", mongoQueryError);
            return res.status(500).json({ error: "Failed to query PDFs from database", details: mongoQueryError instanceof Error ? mongoQueryError.message : "Unknown error" });
          }
        } catch (mongoConnectionError) {
          console.error("Error connecting to MongoDB:", mongoConnectionError);
          return res.status(500).json({ error: "Failed to connect to database", details: mongoConnectionError instanceof Error ? mongoConnectionError.message : "Unknown error" });
        }
      } catch (firestoreError) {
        console.error("Error checking user role in Firestore:", firestoreError);
        return res.status(500).json({ error: "Error checking user authorization", details: firestoreError instanceof Error ? firestoreError.message : "Unknown error" });
      }
    } catch (clerkError) {
      console.error("Error getting user from Clerk:", clerkError);
      return res.status(500).json({ error: "Authentication service error", details: clerkError instanceof Error ? clerkError.message : "Unknown error" });
    }
  } catch (error) {
    console.error("Error fetching student PDFs:", error);
    return res.status(500).json({ error: "Failed to fetch PDFs", details: error instanceof Error ? error.message : "Unknown error" });
  }
}
