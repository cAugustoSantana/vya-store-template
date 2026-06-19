import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminOrders } from "@/lib/api";
import type { AdminOrder } from "@/types/commerce";

const POLL_MS = 30_000;

export function useOrdersPoll(token: string | null) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visibleRef = useRef(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders(token);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      return;
    }
    void load();
  }, [token, load]);

  useEffect(() => {
    if (!token) return;

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current) void load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const id = setInterval(() => {
      if (visibleRef.current) void load();
    }, POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(id);
    };
  }, [token, load]);

  return { orders, loading, error, reload: load };
}
