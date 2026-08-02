import { LookService } from "../service/look.service";
import { checkAdminAuthFromRequest } from "./admin.controller";

export class LookController {
  static async getLooks() {
    try {
      const looks = await LookService.getAllLooks();
      return Response.json({ looks });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch looks";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  static async createLook(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const body = await request.json();
      const { title, tag, className, imageUrl } = body;
      
      if (!title || !tag) {
        return Response.json({ error: "Title and tag are required" }, { status: 400 });
      }
      
      const look = await LookService.createLook({
        title,
        tag,
        className: className || "look-custom",
        imageUrl: imageUrl || "",
      });
      
      return Response.json({ success: true, lookId: look._id }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create look";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  static async deleteLook(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      
      if (!id) {
        return Response.json({ error: "ID is required" }, { status: 400 });
      }
      
      const deleted = await LookService.deleteLook(id);
      if (!deleted) {
        return Response.json({ error: "Look not found" }, { status: 404 });
      }
      
      return Response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete look";
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
