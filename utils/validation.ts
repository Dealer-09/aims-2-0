/**
 * Utility functions for API request validation
 */

/**
 * Validates if a string is a properly formatted email address
 * @param email The email string to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail(email: unknown): boolean {
  return (
    typeof email === 'string' && 
    email.trim() !== '' &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  );
}

/**
 * Normalizes an email address by converting to lowercase
 * @param email The email to normalize
 * @returns The normalized email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Validates if a request contains a valid hCaptcha token
 * @param token The captcha token to validate
 * @returns True if the token appears valid, false otherwise
 */
export function isValidCaptchaToken(token: unknown): boolean {
  return typeof token === 'string' && token.trim().length > 10;
}

/**
 * Verifies a CAPTCHA token with the hCaptcha API
 * @param token The hCaptcha token to verify
 * @param ip Optional IP address for additional security
 * @returns Promise resolving to a validation result object
 */
export async function verifyCaptchaToken(token: string, ip?: string): Promise<{
  success: boolean;
  error?: string;
  errorCodes?: string[];
}> {
  try {
    if (!process.env.HCAPTCHA_SECRET_KEY) {
      console.error('HCAPTCHA_SECRET_KEY is not configured');
      return { 
        success: false, 
        error: 'CAPTCHA verification service not configured'
      };
    }

    const secretKey = process.env.HCAPTCHA_SECRET_KEY;
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';
    
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
      sitekey: siteKey
    });
    
    // Add IP if available
    if (ip) {
      params.append('remoteip', ip);
    }
    
    const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('hCaptcha verification HTTP error:', verifyResponse.status, errorText);
      return { 
        success: false, 
        error: `CAPTCHA verification failed: ${verifyResponse.status}` 
      };
    }
    
    const captchaResult = await verifyResponse.json();
    
    if (!captchaResult.success) {
      const errorCodes = captchaResult['error-codes'] || ['unknown'];
      console.error('CAPTCHA verification failed:', errorCodes);
      return { 
        success: false, 
        error: 'CAPTCHA verification failed', 
        errorCodes 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return { 
      success: false, 
      error: 'CAPTCHA verification service error' 
    };
  }
}

/**
 * Validates that a string contains only alphanumeric characters, optionally with whitespace
 * @param value The string to validate
 * @param allowSpaces Whether to allow spaces
 * @returns True if valid, false otherwise
 */
export function isAlphanumeric(value: unknown, allowSpaces = false): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return allowSpaces 
    ? /^[a-zA-Z0-9\s]+$/.test(value)
    : /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validates that a value is a safe string (no HTML/script injection)
 * @param value The value to validate
 * @returns True if the string is safe, false otherwise
 */
export function isSafeString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  // Basic check for HTML/script injection attempts
  return !/<\/?[a-z][\s\S]*>/i.test(value);
}
