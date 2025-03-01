import { getAuth } from "@clerk/nextjs/server"; // ✅ Correct import for API routes
import { db } from "@/utils/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const auth = getAuth(req); // ✅ Get user authentication from the request
  const userId = auth.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { role } = req.body;
  if (!["admin", "student"].includes(role)) return res.status(400).json({ error: "Invalid role" });

  try {
    await setDoc(doc(collection(db, "users"), userId), { role });
    return res.status(200).json({ message: "Role assigned successfully." });
  } catch (error) {
    console.error("Error setting role:", error);
    return res.status(500).json({ error: "Failed to set role." });
  }
}