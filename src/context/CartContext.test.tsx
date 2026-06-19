import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartContext", () => {
  it("adds lines and computes total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addLine({
        productId: "prod-1",
        variants: { size: "m", color: "black" },
        quantity: 2,
      });
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.total).toBe(3000);
  });

  it("merges duplicate variant lines", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const line = {
      productId: "prod-2",
      variants: { color: "navy" },
      quantity: 1,
    };
    act(() => {
      result.current.addLine(line);
      result.current.addLine(line);
    });
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].quantity).toBe(2);
    expect(result.current.total).toBe(1800);
  });

  it("removes a line and clears cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addLine({
        productId: "prod-2",
        variants: { color: "black" },
        quantity: 1,
      });
    });
    const lineId = result.current.lines[0].lineId;
    act(() => {
      result.current.removeLine(lineId);
    });
    expect(result.current.lines).toHaveLength(0);
    act(() => {
      result.current.addLine({
        productId: "prod-2",
        variants: { color: "black" },
        quantity: 1,
      });
      result.current.clearCart();
    });
    expect(result.current.lines).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
