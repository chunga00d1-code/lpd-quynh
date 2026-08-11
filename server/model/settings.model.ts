import { Schema, model, models } from "mongoose";

export interface ISettings {
  salonName: string;
  phone: string;
  email: string;
  address: string;
  openHours: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  heroTitle: string;
  heroText: string;
  aboutText: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  salonName: { type: String, default: "Quỳnh Nail ART" },
  phone: { type: String, default: "0383088262" },
  email: { type: String, default: "hello@quynhnail.vn" },
  address: { type: String, default: "số nhà 81, Nam Lý, Trung Giã, Hà Nội" },
  openHours: { type: String, default: "08:00 — 20:00 · Thứ 2 — Chủ nhật" },
  instagramUrl: { type: String, default: "#" },
  facebookUrl: { type: String, default: "#" },
  tiktokUrl: { type: String, default: "#" },
  heroTitle: { type: String, default: "Nâng niu từng đầu ngón tay" },
  heroText: { type: String, default: "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại." },
  aboutText: { type: String, default: "Quỳnh tin rằng thời gian làm nail cũng là lúc bạn dành một khoảng nghỉ cho chính mình. Vì vậy, mỗi trải nghiệm đều được thiết kế để thật chỉn chu, sạch sẽ và thoải mái." },
  updatedAt: { type: Date, default: Date.now },
});

export const SettingsModel = models.Settings || model<ISettings>("Settings", SettingsSchema);
