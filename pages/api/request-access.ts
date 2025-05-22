import { NextApiRequest, NextApiResponse } from 'next';
import { db, doc, getDoc, setDoc, isFirebaseInitialized, formatFirebaseError } from '../../utils/firebase';
import { sendEmail } from '../../utils/sendEmail';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { 
  isValidEmail, 
  normalizeEmail, 
  isValidCaptchaToken, 
  verifyCaptchaToken 
} from '../../utils/validation';
import { getAdminDb } from '../../utils/firebaseAdmin';
import { formatFirebaseError as formatAdminError } from '../../utils/firebase-error-handler';

// Rate limiter: 5 requests per 10 minutes per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    // 2. Rate limit by IP to prevent abuse
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
              req.socket?.remoteAddress || 
              'unknown';
    
    try {
      await rateLimiter.consume(ip);
    } catch {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    // 3. Validate request origin
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://aims-2-0.vercel.app',
      'https://aims-2-0-deployment.vercel.app'
    ].filter(Boolean);
    
    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      console.error(`Invalid origin: ${origin}`);
      return res.status(403).json({ error: 'Access denied: Invalid origin' });
    }
    
    const { email, captchaToken } = req.body;

    // Validate email using utility functions
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }  
    
    // Validate captcha token 
    if (!isValidCaptchaToken(captchaToken)) {
      return res.status(400).json({ error: 'CAPTCHA verification required' });
    }

    // Verify the captcha token using our utility function
    try {
      if (!process.env.HCAPTCHA_SECRET_KEY) {
        console.error('HCAPTCHA_SECRET_KEY is not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Use the validation utility to verify the token
      const captchaResult = await verifyCaptchaToken(captchaToken, ip);
      
      if (!captchaResult.success) {
        console.error('CAPTCHA verification failed:', captchaResult.errorCodes || captchaResult.error);
        return res.status(400).json({ 
          error: 'CAPTCHA verification failed. Please try again.',
          details: process.env.NODE_ENV === 'development' ? captchaResult.error : undefined
        });
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      return res.status(500).json({ error: 'Failed to verify CAPTCHA. Please try again later.' });
    }

    const normalizedEmail = normalizeEmail(email);    // Try using Firebase Admin SDK first (preferred for security)
    let useClientFallback = false;
    const { adminDb, error: adminInitError } = getAdminDb();
    
    if (adminInitError || !adminDb) {
      console.warn('Firebase Admin SDK not available, will use client SDK as fallback');
      useClientFallback = true;
    }
    
    try {
      if (!useClientFallback && adminDb) {
        // Use Admin SDK (server-side)
        const docRef = adminDb.collection('access_requests').doc(normalizedEmail);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          if (data?.status === 'pending') {
            return res.status(200).json({ 
              message: 'Your request is already pending. Please wait for admin approval.' 
            });
          } else if (data?.status === 'approved') {
            return res.status(200).json({ 
              message: 'Your request has already been approved. You can now sign up.' 
            });
          }
        }        // Create new request
        await docRef.set({
          email: normalizedEmail,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          ipAddress: ip, // Store IP for security
          userAgent: req.headers['user-agent'] || 'unknown' // Additional security context
        });
        
        console.log(`Created access request for ${normalizedEmail} using Admin SDK`);
      } else {
        // Use Client SDK (fallback)
        if (!isFirebaseInitialized()) {
          console.error('Firebase client SDK is not initialized when handling access request');
          return res.status(503).json({ 
            error: 'Database service unavailable. Please try again later.' 
          });
        }
        
        const docRef = doc(db, 'access_requests', normalizedEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'pending') {
            return res.status(200).json({ 
              message: 'Your request is already pending. Please wait for admin approval.' 
            });
          } else if (data.status === 'approved') {
            return res.status(200).json({ 
              message: 'Your request has already been approved. You can now sign up.' 
            });
          }
        }        // Create new request using client SDK
        await setDoc(docRef, {
          email: normalizedEmail,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          ipAddress: ip, // Store IP for security
          userAgent: req.headers['user-agent'] || 'unknown' // Additional security context
        });
        
        console.log(`Created access request for ${normalizedEmail} using Client SDK`);
      }      // Send notification to admin with retry mechanism
      let emailSent = false;
      let emailError: Error | string | unknown = null;
      const MAX_RETRIES = 3;
      
      // Function to attempt sending email with retries
      const attemptSendEmail = async (retryCount = 0) => {
        try {
          if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not configured. Skipping admin notification email.');
            return;
          }
          
          const adminEmail = process.env.ADMIN_EMAIL || 'amittiwari006@gmail.com';
          
          // Add more details to the email
          await sendEmail(
            adminEmail,
            'New AIMS Access Request',
            `
            <h2>New Access Request</h2>
            <p>A new user has requested access to AIMS:</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${ip}</p>
            <p><strong>User Agent:</strong> ${req.headers['user-agent'] || 'unknown'}</p>
            <hr />
            <p>Please review this request in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aims-2-0-deployment.vercel.app'}/admin">admin dashboard</a>.</p>
            `
          );
          
          emailSent = true;
          console.log('Admin notification email sent successfully');
          
        } catch (error) {
          // If we have retries left and it's not an authentication error, retry
          if (retryCount < MAX_RETRIES && 
              !(error instanceof Error && 
                (error.message.includes('API key') || 
                 error.message.includes('authentication') || 
                 error.message.includes('configuration')))) {
            
            console.log(`Email send attempt ${retryCount + 1} failed, retrying...`);
            // Wait with exponential backoff before retrying (500ms, 1000ms, 2000ms)
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
            return attemptSendEmail(retryCount + 1);
          }
          
          emailError = error;
          console.error(`Failed to send admin notification after ${retryCount + 1} attempts:`, error);
        }
      };
        // Attempt to send the email
      await attemptSendEmail();
      
      return res.status(200).json({ 
        message: 'Request sent successfully! Please wait for admin approval.',
        adminNotified: emailSent,
        usingAdminSDK: !useClientFallback,
        emailError: emailError ? 
          (process.env.NODE_ENV === 'development' ? 
            (typeof emailError === 'object' && emailError !== null && 'message' in emailError ? 
              emailError.message : String(emailError)) 
            : 'Failed to send admin notification') 
          : null
      });
    } catch (error) {      // Log detailed error information for debugging
      console.error('Request processing error:', error);
      
      // Format error differently based on which SDK was used
      if (useClientFallback) {
        // Client Firebase returns a string error message
        const errorMessage = formatFirebaseError(error);
        return res.status(500).json({
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? 
            (error instanceof Error ? error.message : String(error)) : undefined
        });
      } else {
        // Admin Firebase returns a structured error object
        const formattedError = formatAdminError(error);
        return res.status(500).json({
          error: formattedError.message,
          code: formattedError.type,
          details: process.env.NODE_ENV === 'development' ? 
            (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }  } catch (uncaughtError) {
    console.error('Uncaught API error:', uncaughtError);
    const formattedError = formatFirebaseError(uncaughtError);
    return res.status(500).json({
      error: formattedError,
      details: process.env.NODE_ENV === 'development' ? 
        (uncaughtError instanceof Error ? uncaughtError.message : String(uncaughtError)) : undefined
    });
  }
}