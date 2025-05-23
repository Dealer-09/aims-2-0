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
    console.log('Attempting to connect to MongoDB...');
    
    if (!uri) {
      console.error('MongoDB URI is not defined in environment variables!');
      throw new Error('MongoDB URI is missing from environment configuration');
    }
    
    // Parse connection string to ensure TLS options are correctly set
    const connectionOptions = {
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
    
    console.log('Connecting with enhanced TLS options...');
    await mongoose.connect(uri as string, connectionOptions);
    isConnected = true;
    
    // Verify the connection explicitly
    if (mongoose.connection && mongoose.connection.db) {
      const pingResult = await mongoose.connection.db.admin().command({ ping: 1 });
      console.log('MongoDB connection verified successfully:', pingResult);
    } else {
      console.warn('Mongoose connected but connection.db is not available');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (error instanceof Error) {
      console.error('MongoDB connection error details:', error.message);
      if (error.stack) console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Create GridFS bucket for file storage
export async function getGridFS(bucketName = 'pdfs') {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'aims');
  return new GridFSBucket(db, { bucketName });
}
