import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ProductVariant, VariantGroup } from "@shared/product.types";
import { formatVariantLabel, totalVariantStock } from "@shared/productVariants";
import styles from "./ProductVariantsEditor.module.css";

type Props = {
  variantOptions: Record<string, VariantGroup>;
  basePrice: number;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

export function ProductVariantsEditor({
  variantOptions,
  basePrice,
  variants,
  onChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en" : "es";
  const totalStock = useMemo(() => totalVariantStock(variants), [variants]);

  const updateVariant = (key: string, patch: Partial<ProductVariant>) => {
    onChange(
      variants.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)),
    );
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="product-variants-title">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="product-variants-title" className={styles.sectionTitle}>
            {t("admin.products.variantInventory")}
          </h2>
          <p className={styles.hint}>{t("admin.products.variantInventoryHint")}</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.products.variantName")}</th>
              <th>{t("admin.products.price")}</th>
              <th>{t("admin.products.available")}</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.key}>
                <td className={styles.variantName}>
                  {formatVariantLabel(variant.options, variantOptions, locale)}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.input}
                    placeholder={String(basePrice)}
                    value={variant.price ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      updateVariant(variant.key, {
                        price: raw === "" ? null : Number(raw),
                      });
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    value={variant.stockQuantity}
                    onChange={(e) =>
                      updateVariant(variant.key, {
                        stockQuantity: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.total}>
        {t("admin.products.totalInventory", { count: totalStock })}
      </p>
    </section>
  );
}
