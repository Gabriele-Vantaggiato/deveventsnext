import mongoose from 'mongoose';

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global type declaration to cache the mongoose connection
 * This prevents multiple connections during hot reloads in development
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global type to include our mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize the cache object
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Caches the connection to prevent multiple connections in development
 * @returns Promise resolving to the Mongoose instance
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for connection and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
