import { ServiceController } from "../../../server/controller/service.controller";

export async function GET() {
  return await ServiceController.getServices();
}

export async function POST(request: Request) {
  return await ServiceController.createService(request);
}

export async function PUT(request: Request) {
  return await ServiceController.updateService(request);
}

export async function DELETE(request: Request) {
  return await ServiceController.deleteService(request);
}
