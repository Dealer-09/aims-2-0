import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Custom error class for Firebase client errors
class FirebaseClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseClientError';
  }
}

// Define the shape of our Firebase config
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Interface for diagnostic information
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

// Initialize Firebase only if it hasn't been initialized
let app: FirebaseApp | undefined;
let db: Firestore;
let storage: FirebaseStorage;
let initError: Error | null = null;
let diagnostics: FirebaseInitDiagnostics;

try {
  // Log environment for debugging
  const environment = typeof window === 'undefined' ? 'server' : 'client';
  console.log(`[Firebase Client] Initializing in ${environment} environment`);
  
  // Validate config before initializing
  const requiredKeys: Array<keyof FirebaseConfig> = [
    'apiKey',
    'authDomain',
    'projectId', 
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  // Check for missing keys
  const keysPresent: Record<string, boolean> = {};
  requiredKeys.forEach(key => {
    keysPresent[key] = !!firebaseConfig[key];
  });
  
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    throw new FirebaseClientError(`Missing required Firebase config keys: ${missingKeys.join(', ')}`);
  }
  
  // Additional validation for critical values
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new FirebaseClientError('Firebase configuration is incomplete: apiKey and projectId are required');
  }

  // Safe to initialize now
  console.log('[Firebase Client] Initializing Firebase app');
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  
  // Initialize Firestore and Storage
  console.log('[Firebase Client] Initializing Firestore and Storage');
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Update diagnostics for successful initialization
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
  // Format and store error
  initError = error instanceof Error ? error : new FirebaseClientError('Unknown Firebase initialization error');
  console.error("[Firebase Client] Initialization error:", initError.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error("[Firebase Client] Error details:", error);
  }
  
  // Update diagnostics for failed initialization
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
  
  // Create enhanced fallback objects that provide better error information when used
  const createErrorProxy = <T extends object>(serviceName: string): T => {
    return new Proxy({} as T, {
      get: function(target, prop) {
        if (typeof prop === 'string' && !['toString', 'valueOf', 'inspect', Symbol.toPrimitive].includes(prop as string) && typeof prop !== 'symbol') {
          const errorMsg = `Firebase ${serviceName} is not available: ${initError?.message}`;
          
          // We avoid logging here to prevent console spam when React renders components
          // Return a function that throws when called with context about the specific method
          return function(...args: any[]) {
            console.error(`[Firebase Client] Error accessing ${String(serviceName)}.${String(prop)}: ${initError?.message}`);
            throw new FirebaseClientError(`Firebase ${serviceName}.${String(prop)} failed: ${initError?.message}`);
          };
        }
        return undefined;
      }
    });
  };
  
  // Create proxy objects that will throw helpful errors when accessed
  db = createErrorProxy<Firestore>('Firestore');
  storage = createErrorProxy<FirebaseStorage>('Storage');
}

// Export Firebase instances
export { db, storage };

// Export specific functions from firestore
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

// Export specific functions from storage
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
  
  // Common Firebase error messages mapped to user-friendly messages
  if (isFirebasePermissionError(error)) {
    return 'You do not have permission to perform this action';
  }
  
  if (isFirebaseNotFoundError(error)) {
    return 'The requested information could not be found';
  }
  
  if (error.message.includes('network')) {
    return 'A network error occurred. Please check your connection and try again';
  }
  
  // For development, return detailed errors
  if (process.env.NODE_ENV === 'development') {
    return `Firebase error: ${error.message}`;
  }
  
  // For production, return a generic message
  return 'An error occurred while communicating with the database';
};
