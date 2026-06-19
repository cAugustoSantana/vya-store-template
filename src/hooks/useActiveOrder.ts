import { useCallback, useEffect, useState } from "react";
import { ACTIVE_ORDER_KEY } from "@/lib/constants";

export function useActiveOrder() {
  const [displayId, setDisplayIdState] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_ORDER_KEY),
  );

  const setActiveOrder = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_ORDER_KEY, id);
    setDisplayIdState(id);
  }, []);

  const clearActiveOrder = useCallback(() => {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    setDisplayIdState(null);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_ORDER_KEY) {
        setDisplayIdState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { displayId, setActiveOrder, clearActiveOrder };
}
