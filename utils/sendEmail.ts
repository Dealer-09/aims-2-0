import { Resend } from 'resend';

// Check for API key at module level for early warning
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not configured');
}

// Only initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
  // Validate API key at runtime
  if (!resend) {
    console.error('Email service not initialized: Missing RESEND_API_KEY');
    throw new Error('Email service configuration error. Please check RESEND_API_KEY.');
  }

  // Validate input parameters
  if (!to || typeof to !== 'string') {
    throw new Error('Invalid recipient email address');
  }

  if (!subject || typeof subject !== 'string') {
    throw new Error('Email subject is required');
  }

  if (!content || typeof content !== 'string') {
    throw new Error('Email content is required');
  }
  try {
    const defaultFrom = process.env.RESEND_FROM_EMAIL || "no-reply@aims-education.com";

    if (!resend) {
      throw new Error("Email service not initialized - missing API key");
    }

    // Additional validation for the email recipient
    if (!to.includes('@')) {
      throw new Error(`Invalid recipient email address: ${to}`);
    }

    const { data, error } = await resend.emails.send({
      from: options.from || defaultFrom,
      replyTo: options.replyTo,
      to,
      subject,
      html: content,
      attachments: options.attachments,
    });    if (error) {
      console.error('Resend API error:', error);
      
      // Handle specific error cases without relying on statusCode
      if (error.message?.includes('API key') || error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        throw new Error('Email service authentication failed. Invalid API key.');
      }
      
      if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
        throw new Error('Email rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    
    // Re-throw specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || 
          error.message.includes('authentication') ||
          error.message.includes('Email service configuration')) {
        throw error; // Rethrow configuration errors as-is
      }
    }
    
    // Generic error for all other cases
    throw new Error('Failed to send email. Please try again later.');
  }
}
