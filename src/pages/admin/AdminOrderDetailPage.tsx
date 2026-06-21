import { Link, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { useAdminOrder } from "@/hooks/useAdminOrder";
import { updateOrderStatus } from "@/lib/api";
import { buildBuyerWhatsAppUrl } from "@/lib/whatsapp";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminProofViewer } from "@/components/admin/AdminProofViewer";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { OrderLineItems } from "@/components/admin/OrderLineItems";
import { CustomerCard } from "@/components/admin/CustomerCard";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@shared/types";
import shared from "@/styles/shared.module.css";
import adminStyles from "./admin.module.css";
import styles from "./AdminOrderDetailPage.module.css";

type AdminOutletContext = { token: string };

export function AdminOrderDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { displayId } = useParams<{ displayId: string }>();
  const { token } = useOutletContext<AdminOutletContext>();
  const settings = useStoreConfig();
  const { order, loading, error, notFound, reload } = useAdminOrder(displayId, token);

  const handleStatusChange = async (estado: string) => {
    if (!token || !order) return;
    await updateOrderStatus(token, order.id, estado);
    await reload();
  };

  const confirmPayment = async () => {
    await handleStatusChange("confirmed");
  };

  if (loading && !order) {
    return <p>{t("common.loading")}</p>;
  }

  if (notFound) {
    return (
      <>
        <Link to="/admin/orders" className={styles.backLink}>
          {t("admin.backToOrders")}
        </Link>
        <p className={styles.notFound}>{t("admin.orderNotFound")}</p>
      </>
    );
  }

  if (error) {
    return <p className={shared.error}>{error}</p>;
  }

  if (!order) {
    return null;
  }

  const buyerWhatsAppUrl = buildBuyerWhatsAppUrl(order.buyer.phone);

  return (
    <>
      <Link to="/admin/orders" className={styles.backLink}>
        {t("admin.backToOrders")}
      </Link>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1>{order.displayId}</h1>
          <div className={styles.headerMeta}>
            {new Date(order.createdAt).toLocaleString(locale)}
          </div>
          <StatusBadge status={order.estado} />
        </div>
        <div className={styles.headerActions}>
          {order.estado === "payment_confirmation_pending" && (
            <button
              type="button"
              className={adminStyles.confirmBtn}
              onClick={() => void confirmPayment()}
            >
              {t("admin.confirmPayment")}
            </button>
          )}
          <a
            href={buyerWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.whatsappBtn}
          >
            WhatsApp
          </a>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <OrderLineItems items={order.items} locale={locale} />

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("admin.payment")}</h2>
            <div className={styles.paymentRow}>
              <span>{t("cart.total")}</span>
              <span>{formatMoney(order.total, locale)}</span>
            </div>
            <div className={styles.paymentRow}>
              <span>{t("admin.proof")}</span>
              <span>
                {order.paymentProofMethod === "whatsapp"
                  ? t("admin.proofWhatsApp")
                  : order.hasProof
                    ? t("admin.timeline.proofUploaded")
                    : t("admin.noProof")}
              </span>
            </div>
            <AdminProofViewer order={order} token={token} />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("admin.timeline.title")}</h2>
            <OrderTimeline events={order.timeline} locale={locale} />
          </div>
        </div>

        <div className={styles.sidebarCol}>
          <CustomerCard buyer={order.buyer} />

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("admin.shipping.title")}</h2>
            <dl className={styles.detailList}>
              <div>
                <dt>{t("admin.shipping.address")}</dt>
                <dd>{order.shipping.address}</dd>
              </div>
              <div>
                <dt>{t("admin.shipping.city")}</dt>
                <dd>{order.shipping.city}</dd>
              </div>
              <div>
                <dt>{t("admin.shipping.postalCode")}</dt>
                <dd>{order.shipping.postalCode}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("admin.status")}</h2>
            <div className={styles.statusCard}>
              <StatusBadge status={order.estado} />
              <select
                className={adminStyles.statusSelect}
                value={order.estado}
                onChange={(e) => void handleStatusChange(e.target.value)}
              >
                {settings.orderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {t(`orderStatus.${s}`)}
                  </option>
                ))}
              </select>
              {order.estado === "payment_confirmation_pending" && (
                <button
                  type="button"
                  className={adminStyles.confirmBtn}
                  onClick={() => void confirmPayment()}
                >
                  {t("admin.confirmPayment")}
                </button>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("admin.proof")}</h2>
            <AdminProofViewer order={order} token={token} />
          </div>
        </div>
      </div>
    </>
  );
}
