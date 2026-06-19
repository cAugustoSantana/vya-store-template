import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchPublicOrder } from "@/lib/api";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { ProofUpload } from "@/components/ProofUpload";
import { WhatsAppProofButton } from "@/components/WhatsAppProofButton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { PublicOrder } from "@/types/commerce";
import type { Locale } from "@shared/types";
import shared from "@/styles/shared.module.css";
import styles from "./PaymentPage.module.css";

export function PaymentPage() {
  const { displayId } = useParams<{ displayId: string }>();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { setActiveOrder } = useActiveOrder();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!displayId) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchPublicOrder(displayId)) as PublicOrder;
      setOrder(data);
      setActiveOrder(displayId);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [displayId, setActiveOrder, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  if (error || !order) {
    return (
      <div className={shared.page}>
        <p className={shared.error}>{error ?? t("common.error")}</p>
        <Link to="/" className={shared.buttonSecondary}>
          {t("common.continueShopping")}
        </Link>
      </div>
    );
  }

  const bt = order.payment.bankTransfer;
  const totalFormatted = formatMoney(order.total, locale);
  const proofSubmitted =
    order.hasProof || order.paymentProofMethod === "whatsapp";
  const canUpload =
    order.estado === "payment_confirmation_pending" && !proofSubmitted;

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>{t("payment.title")}</h1>
        <p>{t("payment.orderNumber", { displayId: order.displayId })}</p>
        <StatusBadge status={order.estado} />
      </header>

      <div className={shared.card}>
        <h2>{t("payment.bankDetails")}</h2>
        <div className={styles.bankGrid}>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.bankName")}</span>
            <span className={styles.bankValue}>{bt.bankName}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.accountName")}</span>
            <span className={styles.bankValue}>{bt.accountName}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.accountNumber")}</span>
            <span className={styles.bankValue}>{bt.accountNumber}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.accountType")}</span>
            <span className={styles.bankValue}>{bt.accountType}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.reference")}</span>
            <span className={styles.bankValue}>{bt.referenceHint}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>{t("payment.total")}</span>
            <span className={styles.bankValue}>{totalFormatted}</span>
          </div>
        </div>

        <p className={styles.hint}>{t("payment.leaveHint")}</p>

        <ul className={styles.items}>
          {order.items.map((item, i) => (
            <li key={i} className={styles.item}>
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatMoney(item.lineTotal, locale)}</span>
            </li>
          ))}
        </ul>
      </div>

      {proofSubmitted ? (
        <div className={styles.proofDone}>
          {order.paymentProofMethod === "whatsapp"
            ? t("admin.proofWhatsApp")
            : t("payment.proofUploaded")}
        </div>
      ) : (
        <div className={shared.card}>
          <h2>{t("payment.uploadProof")}</h2>
          <div className={styles.actions}>
            <ProofUpload
              displayId={order.displayId}
              disabled={!canUpload}
              onUploaded={() => void load()}
            />
            <WhatsAppProofButton
              displayId={order.displayId}
              buyerName={order.buyerName}
              totalFormatted={totalFormatted}
              locale={order.locale as "es" | "en"}
              disabled={!canUpload}
              onSent={() => void load()}
            />
          </div>
        </div>
      )}

      <Link to="/" className={shared.buttonSecondary}>
        {t("common.continueShopping")}
      </Link>
    </div>
  );
}
