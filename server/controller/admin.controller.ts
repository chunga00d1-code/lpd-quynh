import { AdminService } from "../service/admin.service";

export async function checkAdminAuthFromRequest(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;

  // Support plain "username:password"
  const parts = authHeader.split(":");
  if (parts.length === 2) {
    const [username, password] = parts;
    return await AdminService.authenticate(username, password);
  }

  // Support "Bearer <base64(username:password)>"
  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = atob(token);
      const tokenParts = decoded.split(":");
      if (tokenParts.length === 2) {
        return await AdminService.authenticate(tokenParts[0], tokenParts[1]);
      }
    } catch {
      // ignore
    }
  }

  return false;
}

export class AdminController {
  static async login(request: Request) {
    try {
      const body = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return Response.json({ error: "Username and password are required" }, { status: 400 });
      }

      const isAuthenticated = await AdminService.authenticate(username, password);
      if (isAuthenticated) {
        // Generate stateless token
        const token = btoa(`${username}:${password}`);
        return Response.json({ success: true, token });
      } else {
        return Response.json({ error: "Invalid username or password" }, { status: 401 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
