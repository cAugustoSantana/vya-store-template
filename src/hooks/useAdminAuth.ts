import { useCallback, useState } from "react";
import { ADMIN_TOKEN_KEY } from "@/lib/constants";
import { adminLogin } from "@/lib/api";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(ADMIN_TOKEN_KEY),
  );

  const login = useCallback(async (password: string) => {
    const { token: newToken } = await adminLogin(password);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
    return newToken;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  }, []);

  const authFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      const current = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (!current) throw new Error("unauthorized");
      const res = await fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${current}`,
        },
      });
      if (res.status === 401) {
        logout();
        throw new Error("unauthorized");
      }
      return res;
    },
    [logout],
  );

  return { token, login, logout, authFetch, isAuthenticated: Boolean(token) };
}
