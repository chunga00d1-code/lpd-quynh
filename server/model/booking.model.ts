import { Schema, model, models } from "mongoose";

export interface IBooking {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, default: "Chưa chọn dịch vụ" },
  date: { type: String, default: "" },
  time: { type: String, default: "" },
  notes: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "completed", "cancelled"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
});

export const BookingModel = models.Booking || model<IBooking>("Booking", BookingSchema);
