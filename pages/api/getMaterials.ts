<<<<<<< Updated upstream
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
=======
import { NextApiRequest, NextApiResponse } from "next";
import { db, collection, getDocs, query, where } from "@/utils/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  try {
    // Find the student with the given email
    const studentsRef = collection(db, "students");
    const studentQuery = query(studentsRef, where("email", "==", email));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const studentData = studentSnapshot.docs[0].data();
    const assignedMaterials = studentData.access || [];

    // Fetch the assigned materials
    const materialsRef = collection(db, "materials");
    const materialsSnapshot = await getDocs(materialsRef);

    const materials = materialsSnapshot.docs
      .filter((doc) => assignedMaterials.includes(doc.id))
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    res.status(200).json({ materials });
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials." });
  }
}
>>>>>>> Stashed changes
