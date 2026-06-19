import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveOrder } from "./useActiveOrder";
import { ACTIVE_ORDER_KEY } from "@/lib/constants";

describe("useActiveOrder", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads initial displayId from localStorage", () => {
    localStorage.setItem(ACTIVE_ORDER_KEY, "MITIENDA-12345");
    const { result } = renderHook(() => useActiveOrder());
    expect(result.current.displayId).toBe("MITIENDA-12345");
  });

  it("setActiveOrder persists to localStorage", () => {
    const { result } = renderHook(() => useActiveOrder());
    act(() => {
      result.current.setActiveOrder("MITIENDA-abcde");
    });
    expect(result.current.displayId).toBe("MITIENDA-abcde");
    expect(localStorage.getItem(ACTIVE_ORDER_KEY)).toBe("MITIENDA-abcde");
  });

  it("clearActiveOrder removes from localStorage", () => {
    localStorage.setItem(ACTIVE_ORDER_KEY, "MITIENDA-12345");
    const { result } = renderHook(() => useActiveOrder());
    act(() => {
      result.current.clearActiveOrder();
    });
    expect(result.current.displayId).toBeNull();
    expect(localStorage.getItem(ACTIVE_ORDER_KEY)).toBeNull();
  });

  it("syncs across tabs via storage event", () => {
    const { result } = renderHook(() => useActiveOrder());
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: ACTIVE_ORDER_KEY,
          newValue: "MITIENDA-remote",
        }),
      );
    });
    expect(result.current.displayId).toBe("MITIENDA-remote");
  });
});
