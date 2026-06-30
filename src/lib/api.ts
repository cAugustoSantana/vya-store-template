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

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return parseJson<{ products: import("@shared/product.types").Product[] }>(res);
}

export async function fetchAdminProducts(token: string) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ products: import("@shared/product.types").Product[] }>(res);
}

export async function fetchAdminProduct(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ product: import("@shared/product.types").Product }>(res);
}

export async function createAdminProduct(
  token: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJson<{ product: import("@shared/product.types").Product }>(res);
}

export async function updateAdminProduct(
  token: string,
  id: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseJson<{ product: import("@shared/product.types").Product }>(res);
}

export async function deleteAdminProduct(token: string, id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ ok: true; id: string }>(res);
}

export async function uploadAdminProductImage(
  token: string,
  id: string,
  imageBase64: string,
  mimeType: string,
) {
  const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  return parseJson<{ product: import("@shared/product.types").Product; imageUrl: string }>(
    res,
  );
}

export async function fetchAdminOrders(token: string) {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{ orders: import("@/types/commerce").AdminOrderListItem[] }>(res);
}

export async function fetchAdminOrder(token: string, displayId: string) {
  const res = await fetch(
    `${API_BASE}/admin/orders/${encodeURIComponent(displayId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return parseJson<{ order: import("@/types/commerce").AdminOrderDetail }>(res);
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

export async function fetchStoreSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  return parseJson<{ settings: import("@shared/storeSettings.types").PublicStoreSettings }>(res);
}

export async function fetchAdminSettings(token: string) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<{
    settings: import("@shared/storeSettings.types").StoreSettingsData;
    updatedAt: string | null;
  }>(res);
}

export async function updateAdminSettings(token: string, settings: unknown) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ settings }),
  });
  return parseJson<{
    settings: import("@shared/storeSettings.types").StoreSettingsData;
    updatedAt: string | null;
  }>(res);
}

export async function uploadAdminStoreLogo(
  token: string,
  imageBase64: string,
  mimeType: string,
) {
  const res = await fetch(`${API_BASE}/admin/settings/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  return parseJson<{
    settings: import("@shared/storeSettings.types").StoreSettingsData;
    logoUrl: string;
    updatedAt: string | null;
  }>(res);
}
