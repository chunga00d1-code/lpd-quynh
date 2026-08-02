import mongoose from "mongoose";
import { env } from "cloudflare:workers";

let isConnected = false;
let isDbAvailable = true;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const baseUri = (env as any).MONGODB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/luna_nail_studio";
  const user = (env as any).MONGODB_USER || process.env.MONGODB_USER || "";
  const password = (env as any).MONGODB_PASSWORD || process.env.MONGODB_PASSWORD || "";
  const authSource = (env as any).MONGODB_AUTH_SOURCE || process.env.MONGODB_AUTH_SOURCE || "admin";

  let finalUri = baseUri;
  if (user && password) {
    try {
      const url = new URL(baseUri);
      url.username = encodeURIComponent(user);
      url.password = encodeURIComponent(password);
      if (authSource) {
        url.searchParams.set("authSource", authSource);
      }
      finalUri = url.toString();
    } catch (e) {
      if (baseUri.startsWith("mongodb://") || baseUri.startsWith("mongodb+srv://")) {
        const prefix = baseUri.startsWith("mongodb+srv://") ? "mongodb+srv://" : "mongodb://";
        const rest = baseUri.substring(prefix.length);
        finalUri = `${prefix}${encodeURIComponent(user)}:${encodeURIComponent(password)}@${rest}`;
        if (authSource) {
          finalUri += (finalUri.includes("?") ? "&" : "?") + `authSource=${authSource}`;
        }
      }
    }
  } else if (authSource) {
    try {
      const url = new URL(baseUri);
      url.searchParams.set("authSource", authSource);
      finalUri = url.toString();
    } catch (e) {
      if (baseUri.includes("?")) {
        finalUri = `${baseUri}&authSource=${authSource}`;
      } else {
        finalUri = `${baseUri}?authSource=${authSource}`;
      }
    }
  }

  try {
    // Set a short timeout (e.g. 5 seconds) for initial connection so it fails fast if MongoDB is down
    await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    isDbAvailable = true;
  } catch (error) {
    console.error("MongoDB Connection Failed. Operating in Offline/Fallback Mode.", error);
    isDbAvailable = false;
    throw error;
  }
  
  return mongoose;
}

export function checkDbAvailable(): boolean {
  return isDbAvailable && mongoose.connection.readyState === 1;
}

export { mongoose };
