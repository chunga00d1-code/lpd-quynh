import { connectToDatabase } from "../../db/mongodb";
import { AdminModel } from "../model/admin.model";
import { env } from "cloudflare:workers";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export class AdminService {
  static async seedAdmin() {
    try {
      await connectToDatabase();
      
      const envUsername = (env as any).ADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
      const envPassword = (env as any).ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";
      
      const count = await AdminModel.countDocuments({});
      if (count === 0) {
        const passwordHash = await hashPassword(envPassword);
        await AdminModel.create({
          username: envUsername,
          passwordHash,
        });
      } else {
        const admin = await AdminModel.findOne({ username: envUsername });
        if (admin) {
          const passwordHash = await hashPassword(envPassword);
          if (admin.passwordHash !== passwordHash) {
            admin.passwordHash = passwordHash;
            await admin.save();
          }
        } else {
          const passwordHash = await hashPassword(envPassword);
          await AdminModel.deleteMany({});
          await AdminModel.create({
            username: envUsername,
            passwordHash,
          });
        }
      }
    } catch (e) {
      console.warn("Could not seed admin in database. Fallback to inline credentials.", e);
    }
  }

  static async authenticate(username: string, password: string): Promise<boolean> {
    const envUsername = (env as any).ADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
    const envPassword = (env as any).ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";

    try {
      await this.seedAdmin();
      const admin = await AdminModel.findOne({ username });
      if (!admin) {
        // Fallback to inline credentials check
        return username === envUsername && password === envPassword;
      }
      
      const inputHash = await hashPassword(password);
      if (admin.passwordHash === inputHash) {
        admin.lastLoginAt = new Date();
        await admin.save().catch(() => {});
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Auth query failed. Falling back to inline credentials.", error);
      return username === envUsername && password === envPassword;
    }
  }
}
