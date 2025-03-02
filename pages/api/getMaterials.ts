import { db } from "@/utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    const q = query(collection(db, "studyMaterials"), where("assignedTo", "array-contains", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(200).json({ materials: [] }); // ✅ Return an empty array if no materials found
    }

    const materials = querySnapshot.docs.map((doc) => ({
      id: doc.id,                
      title: doc.data()?.title || "Untitled",  // ✅ Use optional chaining & default value
      link: doc.data()?.link || "#",          // ✅ Use optional chaining & default value
    }));

    return res.status(200).json({ materials });
  } catch (error) {
    console.error("Error fetching materials:", error); // ✅ Log errors for debugging
    return res.status(500).json({ error: "Error fetching materials." });
  }
}
