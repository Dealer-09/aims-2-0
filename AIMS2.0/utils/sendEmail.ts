import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); // Get API Key from Resend.com

export const sendEmail = async (to: string, subject: string, message: string) => {
  try {
    await resend.emails.send({
      from: "admin@yourwebsite.com", // Change this to a verified sender
      to,
      subject,
      text: message,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
