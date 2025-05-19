import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendEmail } from "@/utils/sendEmail";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter: 5 requests per 10 minutes per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // Rate limit by IP
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || 
             req.socket?.remoteAddress || 
             "unknown";
  try {
    await rateLimiter.consume(ip);
  } catch {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { email, captchaToken } = req.body;

  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (!captchaToken) {
    return res.status(400).json({ error: "CAPTCHA verification required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const docRef = doc(db, "access_requests", normalizedEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === "pending") {
        return res.status(200).json({ 
          message: "Your request is already pending. Please wait for admin approval." 
        });
      } else if (data.status === "approved") {
        return res.status(200).json({ 
          message: "Your request has already been approved. You can now sign up." 
        });
      }
    }

    // Create new request
    await setDoc(docRef, {
      email: normalizedEmail,
      status: "pending",
      requestedAt: new Date().toISOString(),
      ipAddress: ip // Store IP for security
    });

    // Send notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "amittiwari006@gmail.com";
      await sendEmail(
        adminEmail,
        "New AIMS Access Request",
        `
        <h2>New Access Request</h2>
        <p>A new user has requested access to AIMS:</p>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>Please review this request in your admin dashboard.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
      // Don't return error to user if email fails
    }

    return res.status(200).json({ 
      message: "Request sent successfully! Please wait for admin approval." 
    });
  } catch (error) {
    console.error("Request processing error:", error);
    return res.status(500).json({ 
      error: "Failed to process your request. Please try again later." 
    });
  }
}
