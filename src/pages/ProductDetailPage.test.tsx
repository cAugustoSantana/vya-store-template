import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { ProductDetailPage } from "./ProductDetailPage";
import { renderWithProviders } from "@/test/render";
import { mockProductsFetch } from "@/test/mockProducts";

describe("ProductDetailPage", () => {
  beforeEach(() => {
    mockProductsFetch();
  });

  it("loads product, adds to cart, and opens drawer", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: "/products/prod-1" },
    );

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: /Camiseta|Basic/i }).length).toBeGreaterThan(0);
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Agregar|Add to order/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Tu pedido|Your order/i })).toBeInTheDocument();
    });
    const drawer = screen.getByRole("dialog", { name: /Tu pedido|Your order/i });
    expect(drawer).toHaveTextContent(/1\.500|1,500/);
    expect(
      screen.getByRole("link", { name: /Proceed to checkout|Ir al checkout/i }),
    ).toBeInTheDocument();
  });

  it("shows not found for unknown product", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: "/products/unknown-id" },
    );

    await waitFor(() => {
      expect(screen.getByText(/no encontrado|not found/i)).toBeInTheDocument();
    });
  });
});
