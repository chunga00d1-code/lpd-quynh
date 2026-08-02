import { connectToDatabase } from "../../db/mongodb";
import { ServiceModel, IService } from "../model/service.model";

const DEFAULT_SERVICES = [
  { icon: "✦", name: "Sơn gel cao cấp", text: "Bảng màu thời thượng, bền đẹp và sáng bóng.", price: "Từ 180.000đ", order: 1 },
  { icon: "◇", name: "Nail art thiết kế", text: "Mỗi bộ móng là một thiết kế dành riêng cho bạn.", price: "Từ 250.000đ", order: 2 },
  { icon: "○", name: "Chăm sóc móng", text: "Làm sạch, dưỡng móng và thư giãn nhẹ nhàng.", price: "Từ 150.000đ", order: 3 },
];

export class ServiceService {
  static async getAllServices() {
    try {
      await connectToDatabase();
      let services = await ServiceModel.find({}).sort({ order: 1, name: 1 });

      if (services.length === 0) {
        await ServiceModel.insertMany(DEFAULT_SERVICES);
        services = await ServiceModel.find({}).sort({ order: 1, name: 1 });
      }
      return services;
    } catch (e) {
      console.warn("MongoDB connection failed. Returning default services fallback.", e);
      return DEFAULT_SERVICES.map((srv, idx) => ({ ...srv, _id: String(idx + 1) }));
    }
  }

  static async createService(data: Partial<IService>) {
    try {
      await connectToDatabase();
      const newService = new ServiceModel(data);
      return await newService.save();
    } catch (e) {
      console.error(e);
      throw new Error("Không thể thêm dịch vụ vì cơ sở dữ liệu ngoại tuyến.");
    }
  }

  static async updateService(id: string, data: Partial<IService>) {
    try {
      await connectToDatabase();
      return await ServiceModel.findByIdAndUpdate(id, data, { new: true });
    } catch (e) {
      console.error(e);
      throw new Error("Không thể sửa dịch vụ vì cơ sở dữ liệu ngoại tuyến.");
    }
  }

  static async deleteService(id: string) {
    try {
      await connectToDatabase();
      return await ServiceModel.findByIdAndDelete(id);
    } catch (e) {
      console.error(e);
      throw new Error("Không thể xóa dịch vụ vì cơ sở dữ liệu ngoại tuyến.");
    }
  }
}
