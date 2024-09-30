import { createMiddleware } from "@solidjs/start/middleware";
import * as API from "./api";

// authed -> /year/CURRENT_YEAR
// else -> /login
export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);
      if (url.pathname === "/") {
        const username = await API.getUsername();
        if (username === null) {
          return Response.redirect(new URL("/login", url.origin));
        }
        const currentYear = new Date().getFullYear();
        return Response.redirect(new URL(`/year/${currentYear}`, url.origin));
      }
    }
  ]
});
