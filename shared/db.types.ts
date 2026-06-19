import type { Locale, OrderStatus, PaymentProofMethod, PaymentProvider } from "./types";

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
