import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { storeConfig } from "@shared/store.config";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { renderWithProviders } from "@/test/render";

function CartCount() {
  const { lines, total } = useCart();
  return (
    <div data-testid="cart-summary">
      {lines.length} lines, total {total}
    </div>
  );
}

describe("ProductCard", () => {
  it("renders product name and adds to cart", async () => {
    const product = storeConfig.products[0] as unknown as import("@shared/store.config").Product;
    renderWithProviders(
      <>
        <ProductCard product={product} locale="es" />
        <CartCount />
      </>,
    );

    expect(screen.getByRole("heading", { name: /Camiseta|Basic/i })).toBeInTheDocument();
    expect(screen.getByText(/1\.500|1,500/)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Agregar|Add/i }));

    expect(screen.getByTestId("cart-summary")).toHaveTextContent("1 lines");
    expect(screen.getByTestId("cart-summary")).toHaveTextContent("1500");
  });
});
