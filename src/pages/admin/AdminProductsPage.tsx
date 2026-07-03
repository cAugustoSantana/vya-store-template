import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { fetchAdminProducts, deleteAdminProduct } from "@/lib/api";
import {
  AdminButton,
  AdminEmptyState,
  AdminError,
  AdminLinkButton,
  AdminMobileCard,
  AdminMobileList,
  AdminPageHeader,
  AdminTable,
  adminTdClass,
  adminThClass,
  adminTrClass,
} from "@/components/admin/AdminUi";
import { formatMoney } from "@/lib/format";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (product: Product) => {
    const name = product.name;
    if (!window.confirm(t("admin.products.deleteConfirm", { name }))) return;

    setDeletingId(product.id);
    setError(null);
    try {
      await deleteAdminProduct(token, product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.products.title")}
        action={
          <AdminLinkButton to="/admin/products/new">{t("admin.products.add")}</AdminLinkButton>
        }
      />

      {loading ? <p className="text-sm text-gray-500">{t("common.loading")}</p> : null}
      {error ? <AdminError>{error}</AdminError> : null}

      {!loading && products.length === 0 ? (
        <AdminEmptyState>{t("admin.products.empty")}</AdminEmptyState>
      ) : (
        <>
          <AdminMobileList>
            {products.map((product) => (
              <AdminMobileCard key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{product.name}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {t("admin.products.stockQuantity")}: {product.stockQuantity ?? 0}
                      {" · "}
                      {product.active ? t("admin.products.yes") : t("admin.products.no")}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold tabular-nums text-gray-900">
                    {formatMoney(product.price, locale)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    to={`/admin/products/${encodeURIComponent(product.id)}`}
                  >
                    {t("admin.viewDetails")}
                    <CaretRight size={14} weight="bold" aria-hidden />
                  </Link>
                  <AdminButton
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    disabled={deletingId === product.id}
                    onClick={() => void handleDelete(product)}
                  >
                    {t("admin.products.delete")}
                  </AdminButton>
                </div>
              </AdminMobileCard>
            ))}
          </AdminMobileList>

          <AdminTable>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className={adminThClass}>{t("admin.products.id")}</th>
                <th className={adminThClass}>{t("admin.products.name")}</th>
                <th className={adminThClass}>{t("admin.products.price")}</th>
                <th className={adminThClass}>{t("admin.products.stockQuantity")}</th>
                <th className={adminThClass}>{t("admin.products.active")}</th>
                <th className={adminThClass}>{t("admin.products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={adminTrClass}>
                  <td className={`${adminTdClass} font-mono text-xs text-gray-600`}>{product.id}</td>
                  <td className={`${adminTdClass} font-semibold`}>{product.name}</td>
                  <td className={adminTdClass}>{formatMoney(product.price, locale)}</td>
                  <td className={adminTdClass}>{product.stockQuantity ?? 0}</td>
                  <td className={adminTdClass}>
                    {product.active ? t("admin.products.yes") : t("admin.products.no")}
                  </td>
                  <td className={adminTdClass}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                        to={`/admin/products/${encodeURIComponent(product.id)}`}
                      >
                        {t("admin.viewDetails")}
                      </Link>
                      <AdminButton
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingId === product.id}
                        onClick={() => void handleDelete(product)}
                      >
                        {t("admin.products.delete")}
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </>
      )}
    </>
  );
}
