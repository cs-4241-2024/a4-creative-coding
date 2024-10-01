import { createMiddleware } from "@solidjs/start/middleware";
import { getUser } from '~/lib';

// redirect / -> /year/CURRENT_YEAR
export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);
      if (url.pathname === "/") {
        const currentYear = new Date().getFullYear();
        return Response.redirect(new URL(`/year/${currentYear}`, url.origin));
      }
    }
  ]
});
