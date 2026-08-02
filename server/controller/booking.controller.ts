import { BookingService } from "../service/booking.service";
import { checkAdminAuthFromRequest } from "./admin.controller";

export class BookingController {
  static async getBookings(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const bookings = await BookingService.getAllBookings();
      return Response.json({ bookings });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch bookings";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  static async createBooking(request: Request) {
    try {
      const body = await request.json();
      const { name, phone, service, date, time, notes } = body;
      
      if (!name || !phone) {
        return Response.json({ error: "Name and phone are required" }, { status: 400 });
      }
      
      const booking = await BookingService.createBooking({
        name,
        phone,
        service: service || "Chưa chọn dịch vụ",
        date: date || "",
        time: time || "",
        notes: notes || "",
        status: "pending",
      });
      
      return Response.json({ success: true, bookingId: booking._id }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create booking";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  static async updateBooking(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const body = await request.json();
      const { id, status } = body;
      
      if (!id || !status) {
        return Response.json({ error: "ID and status are required" }, { status: 400 });
      }
      
      const updated = await BookingService.updateBookingStatus(id, status);
      if (!updated) {
        return Response.json({ error: "Booking not found" }, { status: 404 });
      }
      
      return Response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update booking";
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
