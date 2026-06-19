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
  buyerName: string;
  paymentProofMethod: string | null;
  hasProof: boolean;
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
      bankName: string;
      accountName: string;
      accountNumber: string;
      accountType: string;
      referenceHint: string;
    };
  };
};

export type AdminOrder = {
  id: string;
  displayId: string;
  createdAt: string;
  buyer: { name: string; phone: string; email: string };
  estado: string;
  total: number;
  locale: string;
  paymentProofMethod: string | null;
  hasProof: boolean;
  proofUrl: string | null;
  items: {
    productId: string;
    productName: string;
    variants: Record<string, string>;
    quantity: number;
    unitPrice: number;
  }[];
};
