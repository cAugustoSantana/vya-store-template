import { SOCIAL_BOT_UA } from "./shared/socialMeta.js";

export const config = {
  matcher: ["/", "/products/:id"],
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!SOCIAL_BOT_UA.test(userAgent)) {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "") {
    return fetch(new URL("/api/meta/home", url.origin));
  }

  const productMatch = url.pathname.match(/^\/products\/([^/]+)\/?$/);
  if (productMatch?.[1]) {
    return fetch(
      new URL(`/api/meta/product/${encodeURIComponent(productMatch[1])}`, url.origin),
    );
  }

  return;
}
