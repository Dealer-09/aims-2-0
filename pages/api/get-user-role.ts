import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");

    if (!sessionToken) {
      console.log("❌ No session token found in headers.");
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("🔎 Received session token:", sessionToken);

    // Optional: Normalize token if it's an email
    const normalizedToken = sessionToken.toLowerCase();

    const userRef = doc(db, "users", normalizedToken); // Assuming token = email or userId
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("❌ User not found in Firestore for ID:", normalizedToken);
      return res.status(403).json({ error: "User not found" });
    }

    const userData = userSnap.data();
    console.log("✅ Firestore Role Found:", userData.role);
    return res.status(200).json({ role: userData.role });

  } catch (error) {
    console.error("❌ Firestore Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
