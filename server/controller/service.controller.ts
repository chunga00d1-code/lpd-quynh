import { ServiceService } from "../service/service.service";
import { checkAdminAuthFromRequest } from "./admin.controller";

export class ServiceController {
  static async getServices() {
    try {
      const services = await ServiceService.getAllServices();
      return Response.json({ services });
    } catch (error: any) {
      return Response.json({ error: error.message || "Failed to fetch services" }, { status: 500 });
    }
  }

  static async createService(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const body = await request.json();
      const { icon, name, text, price, imageUrl, order } = body;
      
      if (!name || !price) {
        return Response.json({ error: "Name and price are required" }, { status: 400 });
      }
      
      const service = await ServiceService.createService({
        icon: icon || "✦",
        name,
        text: text || "",
        price,
        imageUrl: imageUrl || "",
        order: Number(order) || 0,
      });
      
      return Response.json({ success: true, serviceId: service._id }, { status: 201 });
    } catch (error: any) {
      return Response.json({ error: error.message || "Failed to create service" }, { status: 500 });
    }
  }

  static async updateService(request: Request) {
    try {
      const isAdmin = await checkAdminAuthFromRequest(request);
      if (!isAdmin) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const body = await request.json();
      const { id, icon, name, text, price, imageUrl, order } = body;
      
      if (!id || !name || !price) {
        return Response.json({ error: "ID, name and price are required" }, { status: 400 });
      }
      
      const updated = await ServiceService.updateService(id, {
        icon: icon || "✦",
        name,
        text: text || "",
        price,
        imageUrl: imageUrl || "",
        order: Number(order) || 0,
      });
      
      if (!updated) {
        return Response.json({ error: "Service not found" }, { status: 404 });
      }
      
      return Response.json({ success: true });
    } catch (error: any) {
      return Response.json({ error: error.message || "Failed to update service" }, { status: 500 });
    }
  }

  static async deleteService(request: Request) {
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
      
      const deleted = await ServiceService.deleteService(id);
      if (!deleted) {
        return Response.json({ error: "Service not found" }, { status: 404 });
      }
      
      return Response.json({ success: true });
    } catch (error: any) {
      return Response.json({ error: error.message || "Failed to delete service" }, { status: 500 });
    }
  }
}
