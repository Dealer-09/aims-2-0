import { sendEmail } from "@/utils/sendEmail";
import { db } from "@/utils/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

interface RequestBody {
  email: string;
}

interface ResponseData {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body as RequestBody;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    // Store user approval status in Firestore
    await setDoc(doc(db, "access_requests", email), { 
      email, 
      status: "approved" // ✅ Now explicitly storing approval status
    });

    // Send email notification to student
    await sendEmail(
      email,
      "✅ Your Request Has Been Approved!",
      "Congrats! You can now sign up and access your study materials."
    );

    res.status(200).json({ message: "User approved!" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Error approving user." });
  }
}
