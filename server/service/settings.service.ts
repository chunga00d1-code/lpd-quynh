import { connectToDatabase } from "../../db/mongodb";
import { SettingsModel, ISettings } from "../model/settings.model";

const DEFAULT_SETTINGS = {
  salonName: "Quỳnh Nail ART",
  phone: "0383088262",
  email: "hello@quynhnail.vn",
  address: "số nhà 81, Nam Lý, Trung Giã, Hà Nội",
  openHours: "08:00 — 20:00 · Thứ 2 — Chủ nhật",
  instagramUrl: "#",
  facebookUrl: "https://www.facebook.com/nguyen.quynh.597831",
  tiktokUrl: "https://www.tiktok.com/@2uyn21",
  heroTitle: "Nâng niu từng đầu ngón tay",
  heroText: "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại.",
  aboutText: "Quỳnh tin rằng thời gian làm nail cũng là lúc bạn dành một khoảng nghỉ cho chính mình. Vì vậy, mỗi trải nghiệm đều được thiết kế để thật chỉn chu, sạch sẽ và thoải mái.",
  logoUrl: "",
  heroImageUrl: "",
  updatedAt: new Date()
};

export class SettingsService {
  static async getSettings(): Promise<ISettings> {
    try {
      await connectToDatabase();
      let settings = await SettingsModel.findOne({});
      if (!settings) {
        settings = await SettingsModel.create({});
      } else {
        let changed = false;
        if (settings.salonName === "Luna Nail Studio") {
          settings.salonName = "Quỳnh Nail ART";
          changed = true;
        }
        if (settings.address === "25 Nguyễn Trãi, Hà Nội") {
          settings.address = "số nhà 81, Nam Lý, Trung Giã, Hà Nội";
          changed = true;
        }
        if (settings.phone === "0901 234 567" || settings.phone === "0901234567") {
          settings.phone = "0383088262";
          changed = true;
        }
        if (settings.openHours === "09:00 — 20:30 · Thứ 2 — Chủ nhật") {
          settings.openHours = "08:00 — 20:00 · Thứ 2 — Chủ nhật";
          changed = true;
        }
        if (settings.facebookUrl === "#") {
          settings.facebookUrl = "https://www.facebook.com/nguyen.quynh.597831";
          changed = true;
        }
        if (settings.tiktokUrl === "#" || settings.tiktokUrl === "https://www.tiktok.com/@2uyn21") {
          settings.tiktokUrl = "https://www.tiktok.com/@2uyn21";
          changed = true;
        }
        if (!settings.heroTitle || settings.heroTitle.trim() === "'" || settings.heroTitle.trim() === "’" || settings.heroTitle.trim().length <= 3) {
          settings.heroTitle = "Nâng niu từng đầu ngón tay";
          changed = true;
        }
        if (!settings.heroText || settings.heroText.trim().length <= 5) {
          settings.heroText = "Tôn lên nét riêng của bạn với những bộ nail được chăm chút tỉ mỉ trong không gian thư thái, hiện đại.";
          changed = true;
        }
        if (changed) {
          await settings.save();
        }
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
