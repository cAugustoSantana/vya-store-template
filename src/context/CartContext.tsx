import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { maxPurchasableQuantity, lineUnitPrice } from "@/lib/inventory";
import type { CartLine } from "@/types/commerce";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateLineQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  taxAmount: number;
  grandTotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, variants: Record<string, string>) {
  return `${productId}:${JSON.stringify(variants)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { getProduct } = useProducts();

  const addLine = (line: Omit<CartLine, "lineId">) => {
    const product = getProduct(line.productId);
    if (product && maxPurchasableQuantity(product, lines, line.variants) <= 0) return;

    setLines((prev) => {
      const key = lineKey(line.productId, line.variants);
      const existing = prev.find(
        (l) => lineKey(l.productId, l.variants) === key,
      );
      const requestedQty = existing ? existing.quantity + line.quantity : line.quantity;
      const nextQty = product
        ? Math.min(
            maxPurchasableQuantity(product, prev, line.variants, existing?.lineId),
            requestedQty,
          )
        : Math.min(99, requestedQty);
      if (nextQty <= 0) return prev;

      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId
            ? { ...l, quantity: nextQty }
            : l,
        );
      }
      return [...prev, { ...line, lineId: crypto.randomUUID(), quantity: nextQty }];
    });
    setDrawerOpen(true);
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const updateLineQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLine(lineId);
      return;
    }
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        const product = getProduct(l.productId);
        const capped = product
          ? Math.min(maxPurchasableQuantity(product, prev, l.variants, lineId), quantity)
          : Math.min(99, quantity);
        return { ...l, quantity: capped };
      }),
    );
  };

  const clearCart = () => {
    setLines([]);
    setDrawerOpen(false);
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = getProduct(line.productId);
      return sum + lineUnitPrice(product, line.variants) * line.quantity;
    }, 0);
  }, [lines, getProduct]);

  const { taxRate } = useStoreConfig();
  const taxAmount = useMemo(() => Math.round(total * taxRate), [total, taxRate]);
  const grandTotal = total + taxAmount;

  useEffect(() => {
    if (lines.length === 0 && isDrawerOpen) {
      setDrawerOpen(false);
    }
  }, [lines.length, isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDrawerOpen]);

  const value = useMemo(
    () => ({
      lines,
      addLine,
      removeLine,
      updateLineQuantity,
      clearCart,
      total,
      taxAmount,
      grandTotal,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [lines, total, taxAmount, grandTotal, isDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
