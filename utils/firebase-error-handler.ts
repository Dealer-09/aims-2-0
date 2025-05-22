/**
 * Firebase error handling and validation utilities
 */
import { FirebaseError } from 'firebase/app';

/**
 * Types of common Firebase errors
 */
export enum FirebaseErrorType {
  PERMISSION_DENIED = 'permission-denied',
  NOT_FOUND = 'not-found',
  ALREADY_EXISTS = 'already-exists',
  INVALID_ARGUMENT = 'invalid-argument',
  UNAUTHENTICATED = 'unauthenticated',
  NETWORK = 'network-error',
  UNAVAILABLE = 'unavailable',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown',
  ADMIN_SDK_NOT_INITIALIZED = 'admin-sdk-not-initialized',
  ENVIRONMENT_VARIABLES_MISSING = 'env-vars-missing'
}

/**
 * Interface for Firebase error information
 */
export interface FirebaseErrorInfo {
  type: FirebaseErrorType;
  message: string;
  code?: string;
  original?: unknown;
}

/**
 * Check if an error is a Firebase error
 * @param error Any error object
 * @returns True if the error is a Firebase error
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return !!(
    error instanceof Error &&
    ((error.name === 'FirebaseError') || 
     ('code' in error) || 
     (error.message && (
       error.message.includes('Firebase') || 
       error.message.includes('firestore') ||
       error.message.includes('permission-denied')
     ))
    )
  );
}

/**
 * Determine the type of Firebase error
 * @param error Any error object
 * @returns The error type classification
 */
export function getFirebaseErrorType(error: unknown): FirebaseErrorType {
  if (isFirebaseError(error)) {
    const message = error.message.toLowerCase();
    const code = 'code' in error ? String(error.code).toLowerCase() : '';
    
    if (message.includes('permission') || code.includes('permission-denied')) {
      return FirebaseErrorType.PERMISSION_DENIED;
    }
    
    if (message.includes('not found') || code.includes('not-found')) {
      return FirebaseErrorType.NOT_FOUND;
    }
    
    if (message.includes('already exists') || code.includes('already-exists')) {
      return FirebaseErrorType.ALREADY_EXISTS;
    }
    
    if (message.includes('argument') || code.includes('invalid-argument')) {
      return FirebaseErrorType.INVALID_ARGUMENT;
    }
    
    if (message.includes('unauthenticated') || message.includes('unauthorized') || 
        code.includes('unauthenticated')) {
      return FirebaseErrorType.UNAUTHENTICATED;
    }
    
    if (message.includes('network') || code.includes('network')) {
      return FirebaseErrorType.NETWORK;
    }
    
    if (message.includes('unavailable') || code.includes('unavailable')) {
      return FirebaseErrorType.UNAVAILABLE;
    }
    
    if (message.includes('internal') || code.includes('internal')) {
      return FirebaseErrorType.INTERNAL;
    }
    
    if (message.includes('admin sdk') || message.includes('initialization failed')) {
      return FirebaseErrorType.ADMIN_SDK_NOT_INITIALIZED;
    }
    
    if (message.includes('environment variable') || message.includes('env var')) {
      return FirebaseErrorType.ENVIRONMENT_VARIABLES_MISSING;
    }
  }
  
  return FirebaseErrorType.UNKNOWN;
}

/**
 * Convert a Firebase error to a user-friendly message
 * @param error Any error object
 * @returns User-friendly error information
 */
export function formatFirebaseError(error: unknown): FirebaseErrorInfo {
  if (!error) {
    return {
      type: FirebaseErrorType.UNKNOWN,
      message: 'An unknown error occurred'
    };
  }
  
  const errorType = getFirebaseErrorType(error);
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const code = 'code' in errorObj ? String(errorObj.code) : undefined;
  
  let message: string;
  
  switch (errorType) {
    case FirebaseErrorType.PERMISSION_DENIED:
      message = 'You do not have permission to perform this action';
      break;
    case FirebaseErrorType.NOT_FOUND:
      message = 'The requested information could not be found';
      break;
    case FirebaseErrorType.ALREADY_EXISTS:
      message = 'This information already exists and cannot be duplicated';
      break;
    case FirebaseErrorType.INVALID_ARGUMENT:
      message = 'Invalid information was provided for this operation';
      break;
    case FirebaseErrorType.UNAUTHENTICATED:
      message = 'You need to be signed in to access this information';
      break;
    case FirebaseErrorType.NETWORK:
      message = 'A network error occurred. Please check your connection and try again';
      break;
    case FirebaseErrorType.UNAVAILABLE:
      message = 'The service is temporarily unavailable. Please try again later';
      break;
    case FirebaseErrorType.ADMIN_SDK_NOT_INITIALIZED:
      message = 'The server is experiencing configuration issues. Please contact the administrator';
      break;
    case FirebaseErrorType.ENVIRONMENT_VARIABLES_MISSING:
      message = 'The server is missing required configuration. Please contact the administrator';
      break;
    case FirebaseErrorType.INTERNAL:
      message = 'An internal error occurred. Our team has been notified';
      break;
    default:
      // For development, return detailed errors
      message = process.env.NODE_ENV === 'development' 
        ? `Firebase error: ${errorObj.message}`
        : 'An error occurred while communicating with the database';
  }
  
  return {
    type: errorType,
    message,
    code,
    original: error
  };
}

/**
 * Check if Firebase Admin SDK environment variables are correctly configured
 * @returns Object containing status and missing variable names if any
 */
export function checkFirebaseAdminEnv(): { 
  valid: boolean; 
  missingVars: string[]; 
  partialVars: string[];
} {
  const missingVars = [];
  const partialVars = [];
  
  // Check required variables
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    missingVars.push('FIREBASE_CLIENT_EMAIL');
  }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
    missingVars.push('FIREBASE_PRIVATE_KEY');
  } else {
    // Check if private key is properly formatted
    const key = process.env.FIREBASE_PRIVATE_KEY;
    
    // Check for double quotes wrapping (common in env vars)
    const effectiveKey = key.startsWith('"') && key.endsWith('"') 
      ? key.slice(1, -1) 
      : key;
    
    if (!effectiveKey.includes('-----BEGIN PRIVATE KEY-----')) {
      partialVars.push('FIREBASE_PRIVATE_KEY (missing BEGIN marker)');
    }
    if (!effectiveKey.includes('-----END PRIVATE KEY-----')) {
      partialVars.push('FIREBASE_PRIVATE_KEY (missing END marker)');
    }
    
    // Check for newline handling
    if (effectiveKey.includes('\\n') && !effectiveKey.includes('\n')) {
      partialVars.push('FIREBASE_PRIVATE_KEY (has escaped newlines but no actual newlines)');
    }
    
    // Check if key contains actual newlines or is just a single line
    if (!effectiveKey.includes('\n') && !effectiveKey.includes('\\n')) {
      partialVars.push('FIREBASE_PRIVATE_KEY (appears to be missing newlines completely)');
    }
  }
  
  return {
    valid: missingVars.length === 0 && partialVars.length === 0,
    missingVars,
    partialVars
  };
}
