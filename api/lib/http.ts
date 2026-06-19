import type { VercelRequest, VercelResponse } from "@vercel/node";

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export function getSiteOrigin(req: VercelRequest): string {
  const host = req.headers.host ?? "localhost:3000";
  const proto =
    (typeof req.headers["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"]
      : null) ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse) {
  json(res, 405, { error: "method_not_allowed" });
}

export function readJsonBody<T>(req: VercelRequest): T {
  if (req.body && typeof req.body === "object") {
    return req.body as T;
  }
  throw new Error("invalid_json");
}
