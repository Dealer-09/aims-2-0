import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailOptions = {
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
};

export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  options: EmailOptions = {}
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const defaultFrom = process.env.RESEND_FROM_EMAIL || "no-reply@aims.com";

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || defaultFrom,
      replyTo: options.replyTo,
      to,
      subject,
      html: content,
      attachments: options.attachments,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
}
