import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { checkFirebaseAdminEnv } from './firebase-error-handler';

class FirebaseAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseAdminError';
  }
}

let adminAppInstance: App | null = null;
let adminDbInstance: Firestore | null = null;
let initError: Error | null = null;
let initAttempted = false;

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  let formattedKey = key;
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  } else if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
    formattedKey = formattedKey.slice(1, -1);
  }
  
  if (formattedKey.includes('\\n')) {
    formattedKey = formattedKey.replace(/\\n/g, '\n');
  }
  
  const hasBeginMarker = formattedKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasEndMarker = formattedKey.includes('-----END PRIVATE KEY-----');
  
  if (!hasBeginMarker || !hasEndMarker) {
    console.error('[Firebase Admin] Private key is missing BEGIN or END markers');
    const keySample = `${formattedKey.substring(0, 15)}...${formattedKey.substring(formattedKey.length - 15)}`;
    console.error(`[Firebase Admin] Key sample: ${keySample}`);
    return undefined;
  }
  
  return formattedKey;
}

export async function initializeFirebaseAdmin(): Promise<{ adminDb: Firestore | null; error: Error | null }> {
  if (adminDbInstance && !initError) return { adminDb: adminDbInstance, error: null };
  if (initError && initAttempted) return { adminDb: null, error: initError };
  
  initAttempted = true;
  
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    
    const envCheck = checkFirebaseAdminEnv();
    if (!envCheck.valid) {
      if (envCheck.missingVars.length > 0) {
        throw new FirebaseAdminError(`Firebase Admin SDK missing required variables: ${envCheck.missingVars.join(', ')}`);
      }
      
      if (envCheck.partialVars.length > 0) {
        throw new FirebaseAdminError(`Firebase Admin SDK configuration issues: ${envCheck.partialVars.join(', ')}`);
      }
      
      throw new FirebaseAdminError('Unknown Firebase Admin SDK configuration issue');
    }

    if (!projectId || !clientEmail || !privateKey) {
      throw new FirebaseAdminError('Firebase Admin credentials are incomplete');
    }

    if (getApps().length === 0) {
      try {
        adminAppInstance = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          })
        });
      } catch (certError) {
        if (certError instanceof Error) {
          if (certError.message.includes('private key')) {
            const keyLength = privateKey ? privateKey.length : 0;
            const keyStart = privateKey ? privateKey.substring(0, 30) : 'undefined';
            const hasNewlines = privateKey ? privateKey.includes('\n') : false;
            
            throw new FirebaseAdminError(`Private key validation failed. Length: ${keyLength}, Has newlines: ${hasNewlines}, Start: "${keyStart}"`);
          }
          throw new FirebaseAdminError(`Firebase Admin initialization failed: ${certError.message}`);
        }
        throw new FirebaseAdminError('Unknown Firebase Admin initialization error');
      }
    } else {
      adminAppInstance = getApps()[0];
    }

    adminDbInstance = getFirestore(adminAppInstance);
    
    console.log('[Firebase Admin] Successfully initialized');
    return { adminDb: adminDbInstance, error: null };

  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
    
    let errorMessage = 'Unknown Firebase Admin initialization error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('private key')) {
        errorMessage = 'Invalid private key format. Please check your FIREBASE_PRIVATE_KEY environment variable.';
      } else if (error.message.includes('client_email')) {
        errorMessage = 'Invalid client email. Please check your FIREBASE_CLIENT_EMAIL environment variable.';
      } else if (error.message.includes('project_id')) {
        errorMessage = 'Invalid project ID. Please check your NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.';
      }
    }
    
    initError = new FirebaseAdminError(errorMessage);
    return { adminDb: null, error: initError };
  }
}

export const getFirebaseAdmin = async () => {
  return await initializeFirebaseAdmin();
};

export const getAdminDb = async (): Promise<Firestore | null> => {
  const { adminDb } = await initializeFirebaseAdmin();
  return adminDb;
};

export const resetFirebaseAdmin = () => {
  adminAppInstance = null;
  adminDbInstance = null;
  initError = null;
  initAttempted = false;
};
