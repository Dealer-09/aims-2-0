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
    await connectToMongoDB();
    
    // Find the PDF metadata
    let pdfMetadata;
    try {
      pdfMetadata = await PdfModel.findById(id);
      if (!pdfMetadata) {
        return res.status(404).json({ error: "PDF not found" });
      }
    } catch (error) {
      console.error("Error finding PDF metadata:", error);
      return res.status(500).json({ error: "Failed to retrieve PDF metadata" });
    }
    
    // Get the file from GridFS
    try {
      const bucket = await getGridFS();
      const downloadStream = bucket.openDownloadStream(new ObjectId(pdfMetadata.fileId));
      
      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${pdfMetadata.originalName}"`);
      
      // Stream the file to the response
      downloadStream.pipe(res);
      
      // Handle errors
      downloadStream.on('error', (error) => {
        console.error("Error streaming file:", error);
        res.status(500).end("Error retrieving file");
      });
    } catch (error) {
      console.error("Error retrieving file from GridFS:", error);
      return res.status(500).json({ error: "Failed to retrieve PDF file" });
    }
  } catch (error) {
    console.error("PDF retrieval error:", error);
    return res.status(500).json({ error: "Failed to process PDF retrieval" });
  }
}
