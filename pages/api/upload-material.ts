import { NextApiRequest, NextApiResponse } from "next";
import { db, collection, addDoc } from "@/utils/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title, link } = req.body;

  try {
    await addDoc(collection(db, "materials"), { title, link });
    res.status(200).json({ message: "Material uploaded!" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading material." });
  }
}
