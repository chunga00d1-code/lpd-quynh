import { connectToDatabase } from "../../db/mongodb";
import { BookingModel, IBooking } from "../model/booking.model";

export class BookingService {
  static async getAllBookings() {
    try {
      await connectToDatabase();
      return await BookingModel.find({}).sort({ createdAt: -1 });
    } catch (e) {
      console.warn("MongoDB connection failed. Returning empty bookings.", e);
      return [];
    }
  }

  static async createBooking(data: Partial<IBooking>) {
    try {
      await connectToDatabase();
      const newBooking = new BookingModel(data);
      return await newBooking.save();
    } catch (e) {
      console.error(e);
      throw new Error("Không thể đặt lịch vì cơ sở dữ liệu ngoại tuyến.");
    }
  }

  static async updateBookingStatus(id: string, status: string) {
    try {
      await connectToDatabase();
      return await BookingModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch (e) {
      console.error(e);
      throw new Error("Không thể cập nhật trạng thái vì cơ sở dữ liệu ngoại tuyến.");
    }
  }
}
