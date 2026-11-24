import handler from "@tanstack/react-start/server-entry";
import { handleBookingApi, type BookingEnv } from "./lib/booking-api";
import { renderErrorPage } from "./lib/error-page";

export default {
  async fetch(request: Request, env: BookingEnv, context: unknown) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/")) return handleBookingApi(request, env);
    try {
      // Forward the Worker arguments without exposing bindings to the browser.
      const fetchPage = handler.fetch as (request: Request, env: BookingEnv, context: unknown) => Promise<Response>;
      const response = await fetchPage(request, env, context);
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
