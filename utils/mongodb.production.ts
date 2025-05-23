// Production-optimized MongoDB connection utility
import { MongoClient, GridFSBucket, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let isConnected = false;

const uri = process.env.MONGODB_URI;
// Use the recommended MongoDB Atlas settings with enhanced TLS options
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000
};

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise.
export { clientPromise };

// Connect to mongoose (alternative ODM that might be easier to use in some cases)
export async function connectToMongoDB() {
  if (isConnected) {
    return;
  }
  
  try {
    console.log('Attempting to connect to MongoDB (production)...');
    
    if (!uri) {
      console.error('MongoDB URI is not defined in environment variables!');
      throw new Error('MongoDB URI is missing from environment configuration');
    }
      await mongoose.connect(uri as string, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });
    isConnected = true;
    
    // Verify the connection silently
    if (mongoose.connection && mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Create GridFS bucket for file storage
export async function getGridFS(bucketName = 'pdfs') {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'aims');
  return new GridFSBucket(db, { bucketName });
}
