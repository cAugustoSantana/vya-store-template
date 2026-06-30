export type CartLine = {
  lineId: string;
  productId: string;
  variants: Record<string, string>;
  quantity: number;
};

export type CheckoutResponse = {
  displayId: string;
  total: number;
  locale: string;
  buyer: { name: string; phone: string; email: string };
  paymentPageUrl: string;
  items: {
    productId: string;
    productName: string;
    variants: Record<string, string>;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
};

export type PublicOrder = {
  displayId: string;
  total: number;
  locale: string;
  estado: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  paymentProofMethod: string | null;
  hasProof: boolean;
  shipping: { address: string; city: string; postalCode: string };
  items: {
    productId: string;
    productName: string;
    variants: Record<string, string>;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  payment: {
    provider: string;
    bankTransfer: {
      instructions: string;
      referenceHint: string;
    };
  };
};

export type AdminOrderListItem = {
  id: string;
  displayId: string;
  createdAt: string;
  buyer: { name: string };
  estado: string;
  total: number;
};

export type OrderTimelineEvent = {
  type:
    | "order_placed"
    | "proof_uploaded"
    | "proof_whatsapp"
    | "payment_confirmed"
    | "status_updated";
  at: string;
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
    imageUrl?: string | null;
  }[];
  timeline: OrderTimelineEvent[];
};

/** @deprecated Use AdminOrderListItem or AdminOrderDetail */
export type AdminOrder = AdminOrderDetail;
