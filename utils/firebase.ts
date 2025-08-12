import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

class FirebaseClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseClientError';
  }
}

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

interface FirebaseInitDiagnostics {
  success: boolean;
  error: Error | null;
  config: {
    keysPresent: Record<string, boolean>;
    appInitialized: boolean;
    servicesInitialized: {
      firestore: boolean;
      storage: boolean;
    };
  };
  environment: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.replace('http://', ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace('http://', ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore;
let storage: FirebaseStorage;
let initError: Error | null = null;
let diagnostics: FirebaseInitDiagnostics;

try {
  const environment = typeof window === 'undefined' ? 'server' : 'client';
  
  const requiredKeys: Array<keyof FirebaseConfig> = [
    'apiKey',
    'authDomain',
    'projectId', 
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const keysPresent: Record<string, boolean> = {};
  requiredKeys.forEach(key => {
    keysPresent[key] = !!firebaseConfig[key];
  });
  
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    throw new FirebaseClientError(`Missing required Firebase config keys: ${missingKeys.join(', ')}`);
  }
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new FirebaseClientError('Firebase configuration is incomplete: apiKey and projectId are required');
  }

  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  
  console.log('[Firebase Client] Initializing Firestore and Storage');
  db = getFirestore(app);
  storage = getStorage(app);
  
  diagnostics = {
    success: true,
    error: null,
    config: {
      keysPresent,
      appInitialized: !!app,
      servicesInitialized: {
        firestore: !!db,
        storage: !!storage
      }
    },
    environment
  };
  
  console.log('[Firebase Client] Initialization successful');
} catch (error) {
  initError = error instanceof Error ? error : new FirebaseClientError('Unknown Firebase initialization error');
  console.error("[Firebase Client] Initialization error:", initError.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error("[Firebase Client] Error details:", error);
  }
  
  diagnostics = {
    success: false,
    error: initError,
    config: {
      keysPresent: Object.fromEntries(
        Object.entries(firebaseConfig).map(([key]) => [key, !!firebaseConfig[key as keyof FirebaseConfig]])
      ),
      appInitialized: !!app,
      servicesInitialized: {
        firestore: false,
        storage: false
      }
    },
    environment: typeof window === 'undefined' ? 'server' : 'client'
  };
  
  const createErrorProxy = <T extends object>(serviceName: string): T => {
    return new Proxy({} as T, {
      get: function(target, prop) {
        if (typeof prop === 'string' && !['toString', 'valueOf', 'inspect', Symbol.toPrimitive].includes(prop as string) && typeof prop !== 'symbol') {
          
          return function() {
            console.error(`[Firebase Client] Error accessing ${String(serviceName)}.${String(prop)}: ${initError?.message}`);
            throw new FirebaseClientError(`Firebase ${serviceName}.${String(prop)} failed: ${initError?.message}`);
          };
        }
        return undefined;
      }
    });
  };
  
  db = createErrorProxy<Firestore>('Firestore');
  storage = createErrorProxy<FirebaseStorage>('Storage');
}

export { db, storage };

export {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  runTransaction,
  increment,
  arrayUnion,
  arrayRemove,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';

export {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';

/**
 * Returns any error that occurred during Firebase initialization
 * @returns The error object or null if initialization was successful
 */
export const getFirebaseInitError = (): Error | null => initError;

/**
 * Checks if Firebase has been properly initialized
 * @returns Boolean indicating if Firebase is ready to use
 */
export const isFirebaseInitialized = (): boolean => {
  return !initError && !!app;
};

/**
 * Get detailed diagnostic information about the Firebase initialization
 * This is useful for debugging environment issues
 */
export const getFirebaseDiagnostics = (): FirebaseInitDiagnostics => {
  return diagnostics;
};

/**
 * Helper function to check if a Firebase error is a permission error
 * @param error Any error from a Firebase operation
 * @returns Boolean indicating if the error is related to permissions
 */
export const isFirebasePermissionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.message.includes('permission-denied') || 
         error.message.includes('insufficient permissions') ||
         error.message.toLowerCase().includes('unauthorized');
};

/**
 * Helper function to check if a Firebase error is a not-found error
 * @param error Any error from a Firebase operation
 * @returns Boolean indicating if the error is related to not finding a document
 */
export const isFirebaseNotFoundError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.message.includes('not-found') || 
         error.message.includes('No document to update');
};

/**
 * Formats a Firebase error into a user-friendly message
 * @param error Any error from a Firebase operation
 * @returns A user-friendly error message
 */
export const formatFirebaseError = (error: unknown): string => {
  if (!(error instanceof Error)) return 'An unknown error occurred';
  
  if (isFirebasePermissionError(error)) {
    return 'You do not have permission to perform this action';
  }
  
  if (isFirebaseNotFoundError(error)) {
    return 'The requested information could not be found';
  }
  
  if (error.message.includes('network')) {
    return 'A network error occurred. Please check your connection and try again';
  }
  
  if (process.env.NODE_ENV === 'development') {
    return `Firebase error: ${error.message}`;
  }
  
  return 'An error occurred while communicating with the database';
};
