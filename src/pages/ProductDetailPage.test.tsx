import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { ProductDetailPage } from "./ProductDetailPage";
import { renderWithProviders } from "@/test/render";
import { mockProducts, mockProductsFetch, mockPublicStoreSettings } from "@/test/mockProducts";

describe("ProductDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

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

  it("moves to the next gallery image", async () => {
    const product = {
      ...mockProducts[0],
      imageUrls: ["/products/prod-1.svg", "/products/prod-2.svg"],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes("/api/products")) {
          return new Response(JSON.stringify({ products: [product] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (url.includes("/api/settings")) {
          return new Response(JSON.stringify(mockPublicStoreSettings()), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        throw new Error(`Unmocked fetch: ${url}`);
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>,
      { route: "/products/prod-1" },
    );

    const zoom = await screen.findByRole("button", { name: /Ver imagen completa|View full image/i });
    expect(within(zoom).getByRole("img")).toHaveAttribute("src", "/products/prod-1.svg");

    fireEvent.click(screen.getByRole("button", { name: /Imagen siguiente|Next image/i }));
    await waitFor(() => {
      expect(within(zoom).getByRole("img")).toHaveAttribute("src", "/products/prod-2.svg");
    });
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
