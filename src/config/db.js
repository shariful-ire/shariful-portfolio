import mongoose from "mongoose";

let isConnected = false;

/**
 * Connects to MongoDB using the MONGODB_URI env var.
 * Safe to call multiple times — reuses the existing connection.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB() {
  if (isConnected) return mongoose;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  isConnected = true;

  console.log(`[db] connected -> ${mongoose.connection.name}`);
  return mongoose;
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
