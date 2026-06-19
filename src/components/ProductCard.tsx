import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "@shared/store.config";
import type { Locale } from "@shared/types";
import { getLocalized } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";

type Props = {
  product: Product;
  locale: Locale;
};

export function ProductCard({ product, locale }: Props) {
  const { t } = useTranslation();
  const { addLine } = useCart();
  const variantKeys = Object.keys(product.variantOptions);

  const [variants, setVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const key of variantKeys) {
      const values = Object.keys(product.variantOptions[key].values);
      if (values[0]) initial[key] = values[0];
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  const allSelected = useMemo(
    () => variantKeys.every((k) => variants[k]),
    [variantKeys, variants],
  );

  const handleAdd = () => {
    if (!allSelected || quantity < 1) return;
    addLine({ productId: product.id, variants: { ...variants }, quantity });
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={product.imageUrl}
          alt={getLocalized(product.name, locale)}
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{getLocalized(product.name, locale)}</h2>
        <p className={styles.description}>
          {getLocalized(product.description, locale)}
        </p>
        <p className={styles.price}>{formatMoney(product.price, locale)}</p>

        {variantKeys.map((key) => {
          const group = product.variantOptions[key];
          return (
            <div key={key} className={styles.variantRow}>
              <label htmlFor={`${product.id}-${key}`}>
                {getLocalized(group.label, locale)}
              </label>
              <select
                id={`${product.id}-${key}`}
                value={variants[key] ?? ""}
                onChange={(e) =>
                  setVariants((prev) => ({ ...prev, [key]: e.target.value }))
                }
              >
                {Object.entries(group.values).map(([valueKey, valueLabel]) => (
                  <option key={valueKey} value={valueKey}>
                    {getLocalized(valueLabel, locale)}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className={styles.qtyRow}>
          <label htmlFor={`${product.id}-qty`}>{t("storefront.quantity")}</label>
          <input
            id={`${product.id}-qty`}
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.addBtn}
            disabled={!allSelected}
            onClick={handleAdd}
          >
            {t("storefront.addToOrder")}
          </button>
        </div>
      </div>
    </article>
  );
}
