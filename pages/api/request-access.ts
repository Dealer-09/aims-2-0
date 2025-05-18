

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendEmail } from "@/utils/sendEmail";
import { RateLimiterMemory } from "rate-limiter-flexible";
// For hCaptcha secret
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;

// Rate limiter: 5 requests per 10 minutes per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600, // 10 minutes
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Rate limit by IP
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";
  try {
    await rateLimiter.consume(ip);
  } catch {
    // Too many requests
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { email, captchaToken } = req.body;

  // hCaptcha validation
  if (!captchaToken) {
    return res.status(400).json({ error: "CAPTCHA is required." });
  }
  // Verify hCaptcha
  try {
    const captchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${captchaToken}&secret=${HCAPTCHA_SECRET}`,
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(400).json({ error: "CAPTCHA verification failed." });
    }
  } catch (err) {
    return res.status(400).json({ error: "CAPTCHA verification failed." });
  }

  // Basic email validation
  if (!email || typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const normalizedEmail = email.toLowerCase(); // 🔽 Normalize email

  try {
    // Reference Firestore document for the normalized email
    const docRef = doc(db, "access_requests", normalizedEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Generic message to avoid email enumeration
      return res.status(200).json({ message: "Request sent. Waiting for admin approval!" });
    }

    // Store the new request in Firestore
    await setDoc(docRef, {
      email: normalizedEmail,
      status: "pending",
      requestedAt: new Date().toISOString()
    });

    // Send email to admin
    const adminEmail = "admin@yourwebsite.com"; // TODO: Set your real admin email
    await sendEmail(
      adminEmail,
      "New Access Request",
      `${normalizedEmail} is asking for access to AIMS.`
    );

    return res.status(200).json({ message: "Request sent. Waiting for admin approval!" });
  } catch (error) {
    console.error("Firestore Error:", error);
    return res.status(500).json({ message: "Error storing request." });
  }
}
