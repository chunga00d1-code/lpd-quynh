import { Schema, model, models } from "mongoose";

export interface ILook {
  title: string;
  tag: string;
  className: string;
  imageUrl: string;
  createdAt: Date;
}

const LookSchema = new Schema<ILook>({
  title: { type: String, required: true },
  tag: { type: String, required: true },
  className: { type: String, default: "look-custom" },
  imageUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const LookModel = models.Look || model<ILook>("Look", LookSchema);
