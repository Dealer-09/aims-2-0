import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { checkFirebaseAdminEnv } from './firebase-error-handler';

class FirebaseAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseAdminError';
  }
}

// Create a function to initialize Firebase Admin with proper error handling
let adminAppInstance: App | null = null;
let adminDbInstance: Firestore | null = null;
let initError: Error | null = null;
let initAttempted = false;

/**
 * Format and sanitize the private key to ensure it works correctly
 * @param key The raw private key from environment variables
 * @returns A properly formatted private key
 */
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // Remove any extra quotes that might be surrounding the key
  let formattedKey = key;
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  } else if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
    formattedKey = formattedKey.slice(1, -1);
  }
  
  // Handle escaped newlines
  if (formattedKey.includes('\\n')) {
    formattedKey = formattedKey.replace(/\\n/g, '\n');
  }
  
  // Make sure the key has proper BEGIN and END markers
  const hasBeginMarker = formattedKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasEndMarker = formattedKey.includes('-----END PRIVATE KEY-----');
  
  if (!hasBeginMarker || !hasEndMarker) {
    console.error('[Firebase Admin] Private key is missing BEGIN or END markers');
    // Log a partial key for debugging (first and last few chars)
    const keySample = `${formattedKey.substring(0, 15)}...${formattedKey.substring(formattedKey.length - 15)}`;
    console.error(`[Firebase Admin] Key sample: ${keySample}`);
  }
  
  return formattedKey;
}

/**
 * Safely initializes Firebase Admin SDK with proper error handling
 * This method caches initialization to prevent repeated attempts
 */
function initializeFirebaseAdmin(): { adminDb: Firestore | null, error: Error | null } {
  // Return cached results if available
  if (adminDbInstance) return { adminDb: adminDbInstance, error: null };
  if (initError && initAttempted) return { adminDb: null, error: initError };
  
  // Mark initialization as attempted
  initAttempted = true;
  
  try {
    // Check if environment variables are present
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    
    // Environment variable validation logging
    console.log(`[Firebase Admin] Checking environment variables (${process.env.NODE_ENV || 'unknown'})`);
    console.log('[Firebase Admin] Environment variables present?', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
    });
    
    // Check for properly configured environment
    const envCheck = checkFirebaseAdminEnv();
    if (!envCheck.valid) {
      if (envCheck.missingVars.length > 0) {
        throw new FirebaseAdminError(`Firebase Admin SDK missing required variables: ${envCheck.missingVars.join(', ')}`);
      }
      
      if (envCheck.partialVars.length > 0) {
        console.warn('[Firebase Admin] Warning: Environment variables have formatting issues:', envCheck.partialVars);
      }
    }
    
    // Validate credentials before initialization
    if (!projectId || !clientEmail || !privateKey) {
      const missingVars = [
        !projectId && 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        !clientEmail && 'FIREBASE_CLIENT_EMAIL',
        !privateKey && 'FIREBASE_PRIVATE_KEY'
      ].filter(Boolean).join(', ');
      
      console.error(`[Firebase Admin] Missing required credentials: ${missingVars}`);
      
      throw new FirebaseAdminError(
        `Firebase Admin SDK missing required credentials: ${missingVars}. ` +
        `Make sure these environment variables are set in .env.local or Vercel environment variables.`
      );
    }    // Initialize the app if it's not already initialized
    if (getApps().length === 0) {
      try {
        console.log('[Firebase Admin] Initializing new Firebase Admin app instance');
        
        // Create credential with properly formatted private key
        const credential = cert({
          projectId,
          clientEmail,
          privateKey,
        });
        
        // Initialize app
        adminAppInstance = initializeApp({
          credential
        });
        
        console.log('[Firebase Admin] App initialization successful');
      } catch (certError) {
        console.error('[Firebase Admin] Failed to create Firebase Admin cert:', certError);
        
        // Provide more specific error messages for common issues
        if (certError instanceof Error) {
          if (certError.message.includes('Failed to parse private key')) {
            // Get more details about the private key for debugging
            const keyDetails = privateKey ? {
              length: privateKey.length,
              hasBeginMarker: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
              hasEndMarker: privateKey.includes('-----END PRIVATE KEY-----'),
              hasEscapedNewlines: privateKey.includes('\\n'),
              hasNewlines: privateKey.includes('\n')
            } : 'Private key is undefined';
            
            console.error('[Firebase Admin] Private key parse error. Key details:', keyDetails);
            
            throw new FirebaseAdminError(
              'Invalid private key format. Please ensure FIREBASE_PRIVATE_KEY is properly formatted ' +
              'and includes the correct line breaks. For Vercel deployments, set it as a "plain text with newlines" variable.'
            );
          }
        }
        
        throw certError;
      }
    } else {
      console.log('[Firebase Admin] Using existing Firebase Admin app instance');
      adminAppInstance = getApps()[0];
    }
    
    // Initialize Firestore with Admin SDK
    try {
      console.log('[Firebase Admin] Initializing Firestore Admin instance');
      adminDbInstance = getFirestore(adminAppInstance);
      console.log('[Firebase Admin] Firestore initialization successful');
      return { adminDb: adminDbInstance, error: null };
    } catch (firestoreError) {
      console.error('[Firebase Admin] Failed to initialize Firestore:', firestoreError);
      throw firestoreError;
    }
  } catch (error) {
    // Detailed error logging
    console.error('[Firebase Admin] Initialization error:', error);
    
    // Create a user-friendly error message
    let errorMessage = 'Unknown error during Firebase Admin initialization';
    
    if (error instanceof Error) {
      // Try to provide more specific error messages for common issues
      if (error.message.includes('private_key') || error.message.includes('Failed to parse')) {
        errorMessage = 'Invalid Firebase private key format. Check that FIREBASE_PRIVATE_KEY is properly formatted with line breaks.';
      } else if (error.message.includes('project_id')) {
        errorMessage = 'Invalid Firebase project ID. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.';
      } else if (error.message.includes('client_email')) {
        errorMessage = 'Invalid Firebase client email. Check FIREBASE_CLIENT_EMAIL environment variable.';
      } else {
        errorMessage = error.message;
      }
    }
    
    // Store the error for future calls
    initError = new FirebaseAdminError(`Failed to initialize Firebase Admin SDK: ${errorMessage}`);
    return { adminDb: null, error: initError };
  }
}

/**
 * Safe getter for Firebase Admin Firestore instance
 * Returns both the database instance and any error that occurred during initialization
 */
export function getAdminDb() {
  return initializeFirebaseAdmin();
}
