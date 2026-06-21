import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fetchAdminProducts } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import {
  AdminButton,
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/AdminUi";
import type { Locale } from "@shared/types";
import type { Product } from "@shared/product.types";

type AdminOutletContext = { token: string };

export function AdminProductsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { token } = useOutletContext<AdminOutletContext>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminProducts(token);
        if (!cancelled) setProducts(data.products);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <AdminPageHeader
        title={t("admin.products.title")}
        actions={
          <Link to="/admin/products/new">
            <AdminButton>{t("admin.products.add")}</AdminButton>
          </Link>
        }
      />

      {loading && <p className="text-sm text-gray-500">{t("common.loading")}</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {!loading && products.length === 0 ? (
        <AdminEmpty>{t("admin.products.empty")}</AdminEmpty>
      ) : (
        <AdminTable>
          <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">{t("admin.products.id")}</th>
              <th className="px-4 py-3">{t("admin.products.name")}</th>
              <th className="px-4 py-3">{t("admin.total")}</th>
              <th className="px-4 py-3">{t("admin.products.active")}</th>
              <th className="px-4 py-3" aria-label={t("admin.viewDetails")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{product.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {product.name[locale] ?? product.name.es}
                </td>
                <td className="px-4 py-3 text-gray-700">{formatMoney(product.price, locale)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {product.active ? t("admin.products.yes") : t("admin.products.no")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    to={`/admin/products/${encodeURIComponent(product.id)}`}
                  >
                    {t("admin.viewDetails")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}
