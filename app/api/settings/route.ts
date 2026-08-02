import { SettingsController } from "../../../server/controller/settings.controller";

export async function GET() {
  return await SettingsController.getSettings();
}

export async function PUT(request: Request) {
  return await SettingsController.updateSettings(request);
}
