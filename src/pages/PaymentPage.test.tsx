import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  createdAt: "2023-10-24T18:34:00.000Z",
  buyerName: "Ana Test",
  buyerEmail: "ana@example.com",
  paymentProofMethod: null,
  hasProof: false,
  shipping: {
    address: "Calle Central #123",
    city: "Santo Domingo",
    postalCode: "10101",
  },
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

  afterEach(() => {
    cleanup();
  });

  it("loads order and shows bank details and proof upload", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/order/payment/:displayId" element={<PaymentPage />} />
      </Routes>,
      { route: "/order/payment/MITIENDA-12345" },
    );

    await waitFor(() => {
      expect(screen.getByText(/MITIENDA-12345/)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Pedido confirmado|Order Confirmed/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText(/Upload proof|Subir comprobante/i)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente paso|Next step/i)).toBeInTheDocument();
    expect(screen.queryByText("ana@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText(/Camiseta/)).not.toBeInTheDocument();
    expect(fetchPublicOrder).toHaveBeenCalledWith("MITIENDA-12345");
    expect(localStorage.getItem("activeOrderDisplayId")).toBe("MITIENDA-12345");
  });

  it("expands order summary to show items and shipping", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/order/payment/:displayId" element={<PaymentPage />} />
      </Routes>,
      { route: "/order/payment/MITIENDA-12345" },
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Resumen del pedido|Order summary/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Resumen del pedido|Order summary/i }));

    expect(screen.getByText(/Camiseta/)).toBeInTheDocument();
    expect(screen.getByText(/Calle Central/)).toBeInTheDocument();
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

    expect(screen.queryByText(/Siguiente paso|Next step/i)).not.toBeInTheDocument();
  });
});
