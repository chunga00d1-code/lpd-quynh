import { Schema, model, models } from "mongoose";

export interface IService {
  icon: string;
  name: string;
  text: string;
  price: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>({
  icon: { type: String, default: "✦" },
  name: { type: String, required: true },
  text: { type: String, default: "" },
  price: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const ServiceModel = models.Service || model<IService>("Service", ServiceSchema);
