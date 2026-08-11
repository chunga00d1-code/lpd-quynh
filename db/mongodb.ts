import mongoose from "mongoose";
import { getRuntimeEnv } from "../lib/runtime-env";

let isConnected = false;
let isDbAvailable = true;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const baseUri = (await getRuntimeEnv("MONGODB_URI")) || "mongodb://localhost:27017/luna_nail_studio";
  const user = (await getRuntimeEnv("MONGODB_USER")) || "";
  const password = (await getRuntimeEnv("MONGODB_PASSWORD")) || "";
  const authSource = (await getRuntimeEnv("MONGODB_AUTH_SOURCE")) || "admin";

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
    } catch {
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
    } catch {
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
