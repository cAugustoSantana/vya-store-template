import { useTranslation } from "react-i18next";
import { storeConfig } from "@shared/store.config";
import type { Product } from "@shared/store.config";
import type { Locale } from "@shared/types";
import { ProductCard } from "@/components/ProductCard";
import { OrderCart } from "@/components/OrderCart";
import { PendingOrderBanner } from "@/components/PendingOrderBanner";
import shared from "@/styles/shared.module.css";
import styles from "./StorefrontPage.module.css";

export function StorefrontPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  return (
    <div className={shared.page}>
      <PendingOrderBanner />
      <header className={shared.pageHeader}>
        <h1>{t("storefront.title")}</h1>
        <p>{t("storefront.subtitle")}</p>
      </header>

      <div className={`${shared.grid} ${shared.gridTwoCol}`}>
        <div className={styles.products}>
          {storeConfig.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as unknown as Product}
              locale={locale}
            />
          ))}
        </div>
        <OrderCart locale={locale} />
      </div>
    </div>
  );
}
