import { db } from "@/utils/firebase";  
import { collection, doc, getDoc, setDoc } from "firebase/firestore";  
import type { NextApiRequest, NextApiResponse } from "next";  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });  

  const { email } = req.body;  
  if (!email || typeof email !== "string") return res.status(400).json({ error: "Valid email is required" });  

  try {  
    const docRef = doc(db, "access_requests", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return res.status(400).json({ error: "Request already submitted. Please wait for approval." });
    }

    await setDoc(docRef, {  
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
