import { AdminController } from "../../../../server/controller/admin.controller";

export async function POST(request: Request) {
  return await AdminController.login(request);
}
