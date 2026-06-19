import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useOrdersPoll } from "@/hooks/useOrdersPoll";
import { updateOrderStatus } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { AdminOrder } from "@/types/commerce";
import type { Locale } from "@shared/types";
import shared from "@/styles/shared.module.css";
import styles from "./AdminPage.module.css";

function AdminProofViewer({
  order,
  token,
}: {
  order: AdminOrder;
  token: string;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!order.hasProof || !order.proofUrl) {
    if (order.paymentProofMethod === "whatsapp") {
      return <span>{t("admin.proofWhatsApp")}</span>;
    }
    return <span>{t("admin.noProof")}</span>;
  }

  const loadProof = async () => {
    if (url || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/proof/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      setUrl(URL.createObjectURL(blob));
    } catch {
      setUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" className={styles.proofBtn} onClick={() => void loadProof()}>
        {loading ? t("common.loading") : t("admin.viewProof")}
      </button>
      {url && <img src={url} alt="" className={styles.proofImg} />}
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(password);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={(e) => void handleSubmit(e)}>
      <div className={shared.field}>
        <label htmlFor="admin-password">{t("admin.password")}</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className={shared.error}>{error}</p>}
      <button type="submit" className={shared.button} disabled={loading}>
        {t("admin.login")}
      </button>
    </form>
  );
}

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { token, login, logout, isAuthenticated } = useAdminAuth();
  const { orders, loading, error, reload } = useOrdersPoll(token);

  const handleStatusChange = async (orderId: string, estado: string) => {
    if (!token) return;
    await updateOrderStatus(token, orderId, estado);
    await reload();
  };

  const confirmPayment = async (orderId: string) => {
    await handleStatusChange(orderId, "confirmed");
  };

  if (!isAuthenticated || !token) {
    return (
      <div className={shared.page}>
        <header className={shared.pageHeader}>
          <h1>{t("admin.title")}</h1>
          <p>{t("admin.subtitle")}</p>
        </header>
        <AdminLogin onLogin={(p) => login(p).then(() => undefined)} />
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <div className={styles.toolbar}>
        <header className={shared.pageHeader}>
          <h1>{t("admin.orders")}</h1>
        </header>
        <button type="button" className={styles.logoutBtn} onClick={logout}>
          {t("admin.logout")}
        </button>
      </div>

      {loading && orders.length === 0 && <p>{t("common.loading")}</p>}
      {error && <p className={shared.error}>{error}</p>}

      {orders.length === 0 && !loading ? (
        <p className={styles.empty}>{t("admin.noOrders")}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("admin.date")}</th>
                <th>{t("admin.orderId")}</th>
                <th>{t("admin.buyer")}</th>
                <th>{t("admin.total")}</th>
                <th>{t("admin.status")}</th>
                <th>{t("admin.proof")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{new Date(order.createdAt).toLocaleString(locale)}</td>
                  <td>{order.displayId}</td>
                  <td>
                    <div>{order.buyer.name}</div>
                    <div>{order.buyer.phone}</div>
                    <div>{order.buyer.email}</div>
                  </td>
                  <td>{formatMoney(order.total, locale)}</td>
                  <td>
                    <StatusBadge status={order.estado} />
                    <select
                      className={styles.statusSelect}
                      value={order.estado}
                      onChange={(e) =>
                        void handleStatusChange(order.id, e.target.value)
                      }
                    >
                      {storeConfig.orderStatuses.map((s) => (
                        <option key={s} value={s}>
                          {t(`orderStatus.${s}`)}
                        </option>
                      ))}
                    </select>
                    {order.estado === "payment_confirmation_pending" && (
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => void confirmPayment(order.id)}
                      >
                        {t("admin.confirmPayment")}
                      </button>
                    )}
                  </td>
                  <td>
                    <AdminProofViewer order={order} token={token} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
