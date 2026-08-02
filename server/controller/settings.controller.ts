import { SettingsService } from "../service/settings.service";
import { checkAdminAuthFromRequest } from "./admin.controller";

export class SettingsController {
  static async getSettings() {
    try {
      const settings = await SettingsService.getSettings();
      return Response.json({ settings });
    } catch (error: any) {
      return Response.json(
        { error: error.message || "Failed to fetch settings" },
        { status: 500 }
      );
    }
  }

  static async updateSettings(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await request.json();
      const updated = await SettingsService.updateSettings(body);
      return Response.json({ success: true, settings: updated });
    } catch (error: any) {
      return Response.json(
        { error: error.message || "Failed to update settings" },
        { status: 500 }
      );
    }
  }
}
