import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Product } from "@shared/product.types";
import type { Locale } from "@shared/types";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import { formatMoney } from "@/lib/format";
import { productStock } from "@/lib/inventory";
import { productCardFrameClass, productCardImageClass } from "@/lib/productImageLayout";

type Props = {
  product: Product;
  locale: Locale;
};

export function ProductCard({ product, locale }: Props) {
  const { t } = useTranslation();
  const name = product.name;
  const outOfStock = productStock(product) <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${outOfStock ? "opacity-75" : ""}`}
    >
      <div className={productCardFrameClass}>
        {outOfStock ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {t("storefront.outOfStock")}
          </span>
        ) : null}
        <img
          src={resolvePublicProductImageUrl(product.id, product.imageUrl)}
          alt={name}
          className={productCardImageClass}
        />
      </div>
      <div className="flex shrink-0 flex-col p-4 lg:p-5">
        <h2 className="mb-0.5 text-lg font-bold text-gray-900 group-hover:text-brand-600 lg:text-xl">
          {name}
        </h2>
        <p className="text-xl font-extrabold text-gray-900 lg:text-2xl">
          {formatMoney(product.price, locale)}
        </p>
      </div>
    </Link>
  );
}
