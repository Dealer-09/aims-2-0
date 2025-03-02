import { db } from "@/utils/firebase";  
import { collection, addDoc } from "firebase/firestore";  
import type { NextApiRequest, NextApiResponse } from "next";  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });  

  const { email } = req.body;  
  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });  

  try {  
    await addDoc(collection(db, "accessRequests"), {  
      email,  
      status: "pending",  
      requestedAt: new Date().toISOString() // Added timestamp  
    });  

    return res.status(200).json({ message: "Request submitted for approval." });  
  } catch (error) {  
    console.error("Firestore Error:", error);  
    return res.status(500).json({ error: "Error storing request." });  
  }  
}