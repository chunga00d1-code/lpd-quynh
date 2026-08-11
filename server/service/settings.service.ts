import { connectToDatabase } from "../../db/mongodb";
import { SettingsModel, ISettings } from "../model/settings.model";

const DEFAULT_SETTINGS = {
  salonName: "Quỳnh Nail ART",
  phone: "0383088262",
  email: "hello@quynhnail.vn",
  address: "số nhà 81, Nam Lý, Trung Giã, Hà Nội",
  openHours: "08:00 — 20:00 · Thứ 2 — Chủ nhật",
  instagramUrl: "#",
  facebookUrl: "#",
  tiktokUrl: "#",
  heroTitle: "Nâng niu từng đầu ngón tay",
  heroText: "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại.",
  aboutText: "Quỳnh tin rằng thời gian làm nail cũng là lúc bạn dành một khoảng nghỉ cho chính mình. Vì vậy, mỗi trải nghiệm đều được thiết kế để thật chỉn chu, sạch sẽ và thoải mái.",
  updatedAt: new Date()
};

export class SettingsService {
  static async getSettings(): Promise<ISettings> {
    try {
      await connectToDatabase();
      let settings = await SettingsModel.findOne({});
      if (!settings) {
        settings = await SettingsModel.create({});
      } else if (settings.salonName === "Luna Nail Studio") {
        settings.salonName = "Quỳnh Nail ART";
        await settings.save();
      }
      return settings;
    } catch (e) {
      console.warn("MongoDB connection failed. Returning default settings fallback.", e);
      return DEFAULT_SETTINGS as unknown as ISettings;
    }
  }

  static async updateSettings(data: Partial<ISettings>): Promise<ISettings | null> {
    try {
      await connectToDatabase();
      return await SettingsModel.findOneAndUpdate(
        {},
        { ...data, updatedAt: new Date() },
        { new: true, upsert: true }
      );
    } catch (e) {
      console.error("MongoDB connection failed. Could not update settings.", e);
      throw new Error("Không thể cập nhật cấu hình vì cơ sở dữ liệu ngoại tuyến.");
    }
  }
}
