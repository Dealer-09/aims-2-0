import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", ""); // ✅ Extract token

    if (!sessionToken) {
      console.log("❌ No session token found in headers.");
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("🔎 Received session token:", sessionToken);

    // 🔹 Fetch user role from Firestore using token (Temporary Fix)
    const userRef = doc(db, "users", sessionToken); // Assuming token = userId for now
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("❌ User not found in Firestore for ID:", sessionToken);
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