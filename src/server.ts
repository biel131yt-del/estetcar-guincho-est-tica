import handler from "@tanstack/react-start/server-entry";
import { handleBookingApi } from "./lib/booking-api";
import { checkAdmin } from "./lib/admin-auth";
import { renderErrorPage } from "./lib/error-page";

export default {
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/")) return handleBookingApi(request);
    if (path === "/admin" || path === "/admin/") {
      const denied = checkAdmin(request);
      if (denied) return denied;
    }
    try {
      const response = await handler.fetch(request);
      if (path === "/admin" || path === "/admin/") {
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "no-store");
        headers.set("X-Robots-Tag", "noindex, nofollow");
        return new Response(response.body, { status: response.status, headers });
      }
      return response;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  },
};