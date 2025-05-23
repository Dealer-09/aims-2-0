import { NextApiRequest, NextApiResponse } from "next";
import { clientPromise, getGridFS } from '../../../utils/mongodb';
import { connectToMongoDB } from '../../../utils/mongodb';
import { ObjectId } from 'mongodb';
import PdfModel from '../../../models/Pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Missing PDF ID" });
  }
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB to retrieve PDF with ID: ${id}`);
    await connectToMongoDB();
    
    // Find the PDF metadata
    let pdfMetadata;
    try {
      pdfMetadata = await PdfModel.findById(id);
      if (!pdfMetadata) {
        console.error(`PDF with ID ${id} not found in database`);
        return res.status(404).json({ error: "PDF not found" });
      }
      console.log(`Found PDF metadata for ID ${id}: ${pdfMetadata.originalName}`);
    } catch (error) {
      console.error("Error finding PDF metadata:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve PDF metadata",
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
    
    // Get the file from GridFS
    try {
      console.log(`Retrieving file from GridFS with fileId: ${pdfMetadata.fileId}`);
      const bucket = await getGridFS();
      
      // Verify the ObjectId is valid
      if (!ObjectId.isValid(pdfMetadata.fileId)) {
        console.error(`Invalid ObjectId for fileId: ${pdfMetadata.fileId}`);
        return res.status(500).json({ error: "Invalid file ID format" });
      }
      
      const fileId = new ObjectId(pdfMetadata.fileId);
      const downloadStream = bucket.openDownloadStream(fileId);
      
      // Set headers for browser PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${pdfMetadata.originalName}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Add error handling for the pipe operation
      let streamError = false;
      
      // Stream the file to the response
      downloadStream.pipe(res)
        .on('error', (pipeError) => {
          console.error("Error piping PDF stream:", pipeError);
          if (!streamError && !res.headersSent) {
            streamError = true;
            res.status(500).json({ error: "Stream pipe error", details: pipeError.message });
          }
        });
      
      // Handle errors on the download stream
      downloadStream.on('error', (error) => {
        console.error("Error in GridFS download stream:", error);
        if (!streamError && !res.headersSent) {
          streamError = true;
          res.status(500).json({ error: "Error retrieving file from storage", details: error.message });
        }
      });
      
      // Handle stream completion
      downloadStream.on('end', () => {
        console.log(`Successfully served PDF: ${pdfMetadata.originalName}`);
      });
    } catch (error) {
      console.error("Error setting up GridFS download stream:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve PDF file", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("PDF retrieval error:", error);
    return res.status(500).json({ 
      error: "Failed to process PDF retrieval",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}
