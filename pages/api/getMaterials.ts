import { db, collection, getDocs, query, where } from "@/utils/firebase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const { email } = req.query;
  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });

  try {
    const q = query(collection(db, "studyMaterials"), where("assignedTo", "array-contains", email));
    const querySnapshot = await getDocs(q);

    const materials = querySnapshot.docs.map((doc) => ({
      id: doc.id,                // ✅ Fix `.id` issue
      title: doc.data().title,    // ✅ Fix `.title` issue
      link: doc.data().link,      // ✅ Fix `.link` issue
    }));

    return res.status(200).json({ materials });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching materials." });
  }
}