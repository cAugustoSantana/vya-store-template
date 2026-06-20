import type { OrderWithItems } from "../../shared/db.types.js";
import { buildOrderTimeline } from "./orderTimeline.js";
import { getProductImageUrl } from "./products.js";
export type AdminOrderListItem = {
  id: string;
  displayId: string;
  createdAt: string;
  buyer: { name: string };
  estado: string;
  total: number;
};

export type AdminOrderDetail = {
  id: string;
  displayId: string;
  createdAt: string;
  buyer: { name: string; phone: string; email: string };
  shipping: { address: string; city: string; postalCode: string };
  estado: string;
  total: number;
  locale: string;
  paymentProofMethod: string | null;
  hasProof: boolean;
  paymentVerifiedAt: string | null;
  items: {
    productId: string;
    productName: string;
    variants: Record<string, string>;
    quantity: number;
    unitPrice: number;
    imageUrl: string | null;
  }[];
  timeline: ReturnType<typeof buildOrderTimeline>;
};

export function serializeAdminOrderListItem(order: OrderWithItems): AdminOrderListItem {
  return {
    id: order.id,
    displayId: order.display_id,
    createdAt: order.created_at,
    buyer: { name: order.buyer_name },
    estado: order.estado,
    total: Number(order.total),
  };
}

export async function serializeAdminOrderDetail(order: OrderWithItems): Promise<AdminOrderDetail> {
  const imageUrls = new Map<string, string | null>();
  for (const item of order.items) {
    if (!imageUrls.has(item.product_id)) {
      imageUrls.set(item.product_id, await getProductImageUrl(item.product_id));
    }
  }

  return {
    id: order.id,
    displayId: order.display_id,
    createdAt: order.created_at,
    buyer: {
      name: order.buyer_name,
      phone: order.buyer_phone,
      email: order.buyer_email,
    },
    shipping: {
      address: order.shipping_address,
      city: order.shipping_city,
      postalCode: order.shipping_postal_code,
    },
    estado: order.estado,
    total: Number(order.total),
    locale: order.locale,
    paymentProofMethod: order.payment_proof_method,
    hasProof: Boolean(order.payment_proof_url),
    paymentVerifiedAt: order.payment_verified_at,
    items: order.items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      variants: item.variants,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      imageUrl: imageUrls.get(item.product_id) ?? null,
    })),
    timeline: buildOrderTimeline(order),
  };
}
