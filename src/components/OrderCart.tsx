import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import type { Locale } from "@shared/types";
import { useCart } from "@/context/CartContext";
import { getLocalized } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
import styles from "./OrderCart.module.css";

type Props = {
  locale: Locale;
};

function formatVariants(
  productId: string,
  variants: Record<string, string>,
  locale: Locale,
): string {
  const product = storeConfig.products.find((p) => p.id === productId);
  if (!product) return "";
  return Object.entries(variants)
    .map(([key, valueKey]) => {
      const group = product.variantOptions[key as keyof typeof product.variantOptions];
      const value = group?.values[valueKey as keyof typeof group.values];
      const label = group ? getLocalized(group.label, locale) : key;
      const valueLabel = value ? getLocalized(value, locale) : valueKey;
      return `${label}: ${valueLabel}`;
    })
    .join(" · ");
}

export function OrderCart({ locale }: Props) {
  const { t } = useTranslation();
  const { lines, removeLine, total } = useCart();

  return (
    <aside className={styles.cart} aria-label={t("cart.title")}>
      <h2 className={styles.title}>{t("cart.title")}</h2>

      {lines.length === 0 ? (
        <p className={styles.empty}>{t("cart.empty")}</p>
      ) : (
        <ul className={styles.list}>
          {lines.map((line) => {
            const product = storeConfig.products.find((p) => p.id === line.productId);
            const name = product
              ? getLocalized(product.name, locale)
              : line.productId;
            const unitPrice = product?.price ?? 0;
            return (
              <li key={line.lineId} className={styles.line}>
                <div className={styles.lineHeader}>
                  <span className={styles.lineName}>{name}</span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeLine(line.lineId)}
                  >
                    {t("cart.remove")}
                  </button>
                </div>
                <span className={styles.variants}>
                  {formatVariants(line.productId, line.variants, locale)}
                </span>
                <div className={styles.lineFooter}>
                  <span>
                    {t("storefront.quantity")}: {line.quantity}
                  </span>
                  <span>{formatMoney(unitPrice * line.quantity, locale)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.totalRow}>
        <span>{t("cart.total")}</span>
        <span>{formatMoney(total, locale)}</span>
      </div>

      <Link
        to="/checkout"
        className={lines.length === 0 ? styles.checkoutLinkDisabled : styles.checkoutLink}
      >
        {t("cart.checkout")}
      </Link>
    </aside>
  );
}
