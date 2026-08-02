import { LookController } from "../../../server/controller/look.controller";

export async function GET() {
  return await LookController.getLooks();
}

export async function POST(request: Request) {
  return await LookController.createLook(request);
}

export async function DELETE(request: Request) {
  return await LookController.deleteLook(request);
}
