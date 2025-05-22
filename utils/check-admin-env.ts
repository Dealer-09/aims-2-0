interface AdminEnvCheckResult {
  success: boolean;
  missingVars: string[];
  warnings: string[];
  clientEnvVars: Record<string, boolean>;
  privateKeyInfo: {
    length: number;
    hasBeginMarker: boolean;
    hasEndMarker: boolean;
    hasEscapedNewlines: boolean;
    hasActualNewlines: boolean;
  } | null;
}

const checkAdminEnv = (): AdminEnvCheckResult => {
  const missingVars: string[] = [];
  const warnings: string[] = [];
  
  // Check required Firebase Admin SDK environment variables
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    missingVars.push('FIREBASE_CLIENT_EMAIL');
  }
  
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    missingVars.push('FIREBASE_PRIVATE_KEY');
  } else {
    // Check if private key format is correct
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Check for BEGIN/END markers
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || 
        !privateKey.includes('-----END PRIVATE KEY-----')) {
      warnings.push('FIREBASE_PRIVATE_KEY does not have expected format (missing BEGIN/END markers)');
    }
    
    // Check if newlines are properly handled
    if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
      warnings.push('FIREBASE_PRIVATE_KEY has escaped newlines (\\n) but no actual newlines');
      warnings.push('For Vercel: Set this as a "plain text with newlines" environment variable');
    }
  }
  
  // Check client Firebase environment variables
  const clientEnvVars: Record<string, boolean> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  // Return results
  const results: AdminEnvCheckResult = {
    success: missingVars.length === 0,
    missingVars,
    warnings,
    clientEnvVars,    privateKeyInfo: process.env.FIREBASE_PRIVATE_KEY ? {
      length: process.env.FIREBASE_PRIVATE_KEY.length,
      hasBeginMarker: process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----'),
      hasEndMarker: process.env.FIREBASE_PRIVATE_KEY.includes('-----END PRIVATE KEY-----'),
      hasEscapedNewlines: process.env.FIREBASE_PRIVATE_KEY.includes('\\n'),
      hasActualNewlines: process.env.FIREBASE_PRIVATE_KEY.includes('\n')
    } : null
  };
  
  return results;
};

export default checkAdminEnv;
