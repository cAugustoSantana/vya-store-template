import type { Locale, OrderStatus, PaymentProofMethod, PaymentProvider } from "./types.js";

/** Database row types — mirror db/schema.sql */

export type OrderRow = {
  id: string;
  display_id: string;
  created_at: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  estado: OrderStatus;
  total: string;
  locale: Locale;
  payment_provider: PaymentProvider;
  payment_proof_method: PaymentProofMethod | null;
  payment_proof_url: string | null;
  payment_verified_at: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variants: Record<string, string>;
  quantity: number;
  unit_price: string;
};

export type OrderWithItems = OrderRow & {
  items: OrderItemRow[];
};

export type ProductRow = {
  id: string;
  name: unknown;
  description: unknown;
  price: string;
  image_url: string;
  variant_options: Record<string, unknown>;
  variants?: unknown;
  active: boolean;
  sort_order: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};
