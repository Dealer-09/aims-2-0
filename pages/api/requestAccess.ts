import { NextApiRequest, NextApiResponse } from "next";
import { db, collection, addDoc } from "@/utils/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { email } = req.body;
  if(!email)return res.status(400).json({error:"Email is required"});

  try {
    await addDoc(collection(db, "requests"), { email, status: "pending" });
    res.status(200).json({ message: "Request sent. Waiting for admin approval!" });
  } catch (error) {
    res.status(500).json({ message: "Error storing request." });
  }
}
