import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import type { Locale } from "@shared/types";
import { useCart } from "@/context/CartContext";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { CheckoutForm } from "@/components/CheckoutForm";
import { postCheckout } from "@/lib/api";
import { getLocalized } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
import type { CheckoutResponse } from "@/types/commerce";
import shared from "@/styles/shared.module.css";
import styles from "./CheckoutPage.module.css";

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const navigate = useNavigate();
  const { lines, total, clearCart } = useCart();
  const { setActiveOrder } = useActiveOrder();

  const handleSubmit = async (buyer: {
    name: string;
    phone: string;
    email: string;
  }) => {
    const honeypotInput = document.getElementById(
      "checkout-website",
    ) as HTMLInputElement | null;
    const honeypot = honeypotInput?.value ?? "";

    const body = {
      locale,
      buyer,
      honeypot,
      items: lines.map((line) => ({
        productId: line.productId,
        variants: line.variants,
        quantity: line.quantity,
      })),
    };

    const result = (await postCheckout(body)) as CheckoutResponse;
    setActiveOrder(result.displayId);
    clearCart();
    navigate(`/order/payment/${result.displayId}`);
  };

  if (lines.length === 0) {
    return (
      <div className={shared.page}>
        <header className={shared.pageHeader}>
          <h1>{t("checkout.title")}</h1>
        </header>
        <p className={styles.emptyCart}>{t("validation.cartEmpty")}</p>
        <Link to="/" className={shared.buttonSecondary}>
          {t("common.continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className={shared.page}>
      <header className={shared.pageHeader}>
        <h1>{t("checkout.title")}</h1>
        <p>{t("checkout.subtitle")}</p>
      </header>

      <div className={`${shared.grid} ${shared.gridTwoCol}`}>
        <div className={shared.card}>
          <CheckoutForm onSubmit={handleSubmit} />
        </div>

        <aside className={`${shared.card} ${styles.summary}`}>
          <h2 className={styles.summaryTitle}>{t("checkout.orderSummary")}</h2>
          <ul className={styles.summaryList}>
            {lines.map((line) => {
              const product = storeConfig.products.find(
                (p) => p.id === line.productId,
              );
              const name = product
                ? getLocalized(product.name, locale)
                : line.productId;
              const unitPrice = product?.price ?? 0;
              return (
                <li key={line.lineId} className={styles.summaryLine}>
                  <span>
                    {name} × {line.quantity}
                  </span>
                  <span>{formatMoney(unitPrice * line.quantity, locale)}</span>
                </li>
              );
            })}
          </ul>
          <div className={styles.summaryTotal}>
            <span>{t("cart.total")}</span>
            <span>{formatMoney(total, locale)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
