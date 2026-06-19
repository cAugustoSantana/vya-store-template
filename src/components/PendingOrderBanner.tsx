import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { fetchPublicOrder } from "@/lib/api";
import type { PublicOrder } from "@/types/commerce";
import styles from "./PendingOrderBanner.module.css";

export function PendingOrderBanner() {
  const { t } = useTranslation();
  const { displayId } = useActiveOrder();
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!displayId) {
      setShow(false);
      return;
    }
    if (location.pathname === `/order/payment/${displayId}`) {
      setShow(false);
      return;
    }

    let cancelled = false;
    void fetchPublicOrder(displayId)
      .then((order: PublicOrder) => {
        if (cancelled) return;
        setShow(
          order.estado === "payment_confirmation_pending" && !order.hasProof,
        );
      })
      .catch(() => {
        if (!cancelled) setShow(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayId, location.pathname]);

  if (!show || !displayId) return null;

  return (
    <div className={styles.banner} role="status">
      <span>{t("payment.resumeBanner")}</span>
      <Link to={`/order/payment/${displayId}`} className={styles.link}>
        {t("payment.resumeCta")}
      </Link>
    </div>
  );
}
