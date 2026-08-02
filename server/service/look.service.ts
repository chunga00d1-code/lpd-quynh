import { connectToDatabase } from "../../db/mongodb";
import { LookModel, ILook } from "../model/look.model";

const DEFAULT_LOOKS = [
  { className: "look-burgundy", title: "Burgundy Pearl", tag: "Sang trọng", imageUrl: "" },
  { className: "look-milk", title: "Milky Chrome", tag: "Tinh tế", imageUrl: "" },
  { className: "look-french", title: "Modern French", tag: "Tối giản", imageUrl: "" },
];

export class LookService {
  static async getAllLooks() {
    try {
      await connectToDatabase();
      let looks = await LookModel.find({}).sort({ createdAt: -1 });

      if (looks.length === 0) {
        await LookModel.insertMany(DEFAULT_LOOKS);
        looks = await LookModel.find({}).sort({ createdAt: -1 });
      }
      return looks;
    } catch (e) {
      console.warn("MongoDB connection failed. Returning default looks fallback.", e);
      return DEFAULT_LOOKS.map((look, idx) => ({ ...look, _id: String(idx + 1) }));
    }
  }

  static async createLook(data: Partial<ILook>) {
    try {
      await connectToDatabase();
      const newLook = new LookModel(data);
      return await newLook.save();
    } catch (e) {
      console.error(e);
      throw new Error("Không thể thêm look vì cơ sở dữ liệu ngoại tuyến.");
    }
  }

  static async deleteLook(id: string) {
    try {
      await connectToDatabase();
      return await LookModel.findByIdAndDelete(id);
    } catch (e) {
      console.error(e);
      throw new Error("Không thể xóa look vì cơ sở dữ liệu ngoại tuyến.");
    }
  }
}
