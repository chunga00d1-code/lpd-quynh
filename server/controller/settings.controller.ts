import { SettingsService } from "../service/settings.service";
import { checkAdminAuthFromRequest } from "./admin.controller";

export class SettingsController {
  static async getSettings() {
    try {
      const settings = await SettingsService.getSettings();
      return Response.json({ settings });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch settings";
      return Response.json({ error: message }, { status: 500 });
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update settings";
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
