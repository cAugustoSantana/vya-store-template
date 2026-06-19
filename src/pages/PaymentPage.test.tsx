import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { PaymentPage } from "./PaymentPage";
import { renderWithProviders } from "@/test/render";
import type { PublicOrder } from "@/types/commerce";

vi.mock("@/lib/api", () => ({
  fetchPublicOrder: vi.fn(),
}));

import { fetchPublicOrder } from "@/lib/api";

const mockOrder: PublicOrder = {
  displayId: "MITIENDA-12345",
  total: 1500,
  locale: "es",
  estado: "payment_confirmation_pending",
  buyerName: "Ana Test",
  paymentProofMethod: null,
  hasProof: false,
  items: [
    {
      productId: "prod-1",
      productName: "Camiseta Básica",
      variants: { size: "m", color: "black" },
      quantity: 1,
      unitPrice: 1500,
      lineTotal: 1500,
    },
  ],
  payment: {
    provider: "bank_transfer_proof",
    bankTransfer: {
      bankName: "Banco Popular",
      accountName: "Mi Tienda SRL",
      accountNumber: "1234567890",
      accountType: "Ahorros",
      referenceHint: "Usa tu número de pedido",
    },
  },
};

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.mocked(fetchPublicOrder).mockResolvedValue(mockOrder);
    localStorage.clear();
  });

  it("loads order and shows bank details", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/order/payment/:displayId" element={<PaymentPage />} />
      </Routes>,
      { route: "/order/payment/MITIENDA-12345" },
    );

    await waitFor(() => {
      expect(screen.getByText(/MITIENDA-12345/)).toBeInTheDocument();
    });

    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText(/Camiseta/)).toBeInTheDocument();
    expect(screen.getAllByText(/DOP.?1,500|1\.500/).length).toBeGreaterThan(0);
    expect(fetchPublicOrder).toHaveBeenCalledWith("MITIENDA-12345");
    expect(localStorage.getItem("activeOrderDisplayId")).toBe("MITIENDA-12345");
  });

  it("shows proof uploaded state when hasProof", async () => {
    vi.mocked(fetchPublicOrder).mockResolvedValue({
      ...mockOrder,
      hasProof: true,
    });

    renderWithProviders(
      <Routes>
        <Route path="/order/payment/:displayId" element={<PaymentPage />} />
      </Routes>,
      { route: "/order/payment/MITIENDA-12345" },
    );

    await waitFor(() => {
      expect(screen.getByText(/Comprobante enviado|Proof submitted/)).toBeInTheDocument();
    });
  });
});
