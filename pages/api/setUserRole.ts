import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const auth = getAuth(req);
  const userId = auth.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { role } = req.body;
  if (!["admin", "student"].includes(role)) return res.status(400).json({ error: "Invalid role" });

  try {
    // Check if the requesting user is an admin
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Only admins can assign roles." });
    }

    // Assign role to the new user
    await setDoc(doc(db, "users", userId), { role }, { merge: true });

    return res.status(200).json({ message: "Role assigned successfully." });
  } catch (error) {
    console.error("Error setting role:", error);
    return res.status(500).json({ error: "Failed to set role." });
  }
}
