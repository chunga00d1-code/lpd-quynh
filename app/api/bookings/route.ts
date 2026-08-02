import { BookingController } from "../../../server/controller/booking.controller";

export async function GET(request: Request) {
  return await BookingController.getBookings(request);
}

export async function POST(request: Request) {
  return await BookingController.createBooking(request);
}

export async function PUT(request: Request) {
  return await BookingController.updateBooking(request);
}
