import type { PublicOrder } from "@/types/commerce";

const API_BASE = "/api";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string; retryAfterSec?: number };
  if (!res.ok) {
    const err = new Error(data.error ?? "request_failed");
    (err as Error & { status: number; retryAfterSec?: number }).status = res.status;
    (err as Error & { retryAfterSec?: number }).retryAfterSec = data.retryAfterSec;
    throw err;
  }
  return data as T;
}

export async function postCheckout(body: unknown) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function fetchPublicOrder(displayId: string): Promise<PublicOrder> {
  const res = await fetch(`${API_BASE}/orders/public/${encodeURIComponent(displayId)}`);
  return parseJson<PublicOrder>(res);
}

export async function uploadProof(displayId: string, imageBase64: string, mimeType: string) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(displayId)}/proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  return parseJson(res);
}

export async function recordProofMethod(displayId: string, method: "whatsapp") {
  const res = await fetch(
    `${API_BASE}/orders/${encodeURIComponent(displayId)}/proof-method`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    },
  );
  return parseJson(res);
}

export async function adminLogin(password: string) {
  const res = await fetch(`${API_BASE}/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseJson<{ token: string }>(res);
}

export async function fetchAdminOrders(token: string) {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ orders: import("@/types/commerce").AdminOrder[] }>(res);
}

export async function updateOrderStatus(token: string, orderId: string, estado: string) {
  const res = await fetch(`${API_BASE}/admin/status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, estado }),
  });
  return parseJson(res);
}
