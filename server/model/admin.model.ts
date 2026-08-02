import { Schema, model, models } from "mongoose";

export interface IAdmin {
  username: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
});

export const AdminModel = models.Admin || model<IAdmin>("Admin", AdminSchema);
