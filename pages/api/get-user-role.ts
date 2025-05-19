import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = authHeader.substring(7); // Remove "Bearer " prefix
  if (!userId) {
    return res.status(401).json({ error: "Invalid authorization token" });
  }

  try {
    const userEmail = req.query.email as string;
    if (!userEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(200).json({ role: "none" });
    }

    const userData = userSnap.data();
    return res.status(200).json({
      role: userData.role || "none",
      class: userData.class,
      subject: userData.subject
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ error: "Failed to fetch user role" });
  }
}
