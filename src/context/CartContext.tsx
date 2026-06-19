import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { storeConfig } from "@shared/store.config";
import type { CartLine } from "@/types/commerce";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, variants: Record<string, string>) {
  return `${productId}:${JSON.stringify(variants)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = (line: Omit<CartLine, "lineId">) => {
    setLines((prev) => {
      const key = lineKey(line.productId, line.variants);
      const existing = prev.find(
        (l) => lineKey(l.productId, l.variants) === key,
      );
      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId
            ? { ...l, quantity: l.quantity + line.quantity }
            : l,
        );
      }
      return [
        ...prev,
        { ...line, lineId: crypto.randomUUID() },
      ];
    });
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const clearCart = () => setLines([]);

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = storeConfig.products.find((p) => p.id === line.productId);
      return sum + (product?.price ?? 0) * line.quantity;
    }, 0);
  }, [lines]);

  const value = useMemo(
    () => ({ lines, addLine, removeLine, clearCart, total }),
    [lines, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
