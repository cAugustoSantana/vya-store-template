const BOT_UA =
  /bot|crawl|spider|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|preview/i;

export default function middleware(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(ua)) {
    return;
  }

  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "") {
    return Response.redirect(new URL("/api/meta/home", url), 307);
  }

  const productMatch = url.pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch?.[1]) {
    return Response.redirect(new URL(`/api/meta/product/${productMatch[1]}`, url), 307);
  }
}

export const config = {
  matcher: ["/((?!api/|assets/|_next/|.*\\..*).*)"],
};
