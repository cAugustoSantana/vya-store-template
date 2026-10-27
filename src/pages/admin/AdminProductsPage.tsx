import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { CaretDown, CaretRight, CaretUp } from "@phosphor-icons/react";
import { fetchAdminProducts, deleteAdminProduct, reorderAdminProducts } from "@/lib/api";
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
  const [savingOrder, setSavingOrder] = useState(false);
  const savingOrderRef = useRef(false);

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

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= products.length || savingOrderRef.current) return;

    const previous = products;
    const reordered = [...products];
    const [item] = reordered.splice(index, 1);
    if (!item) return;
    reordered.splice(nextIndex, 0, item);

    savingOrderRef.current = true;
    setSavingOrder(true);
    setProducts(reordered);
    setError(null);
    try {
      const data = await reorderAdminProducts(
        token,
        reordered.map((product) => product.id),
      );
      setProducts(data.products);
    } catch (err) {
      setProducts(previous);
      setError(err instanceof Error ? err.message : "error");
    } finally {
      savingOrderRef.current = false;
      setSavingOrder(false);
    }
  };

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
            {products.map((product, index) => (
              <AdminMobileCard key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <OrderButtons
                    index={index}
                    count={products.length}
                    disabled={savingOrder || deletingId !== null}
                    moveUpLabel={t("admin.products.moveUp")}
                    moveDownLabel={t("admin.products.moveDown")}
                    onMove={(direction) => void moveProduct(index, direction)}
                  />
                  <div className="min-w-0 flex-1">
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
                <th className={adminThClass}>
                  <span className="sr-only">{t("admin.products.order")}</span>
                </th>
                <th className={adminThClass}>{t("admin.products.id")}</th>
                <th className={adminThClass}>{t("admin.products.name")}</th>
                <th className={adminThClass}>{t("admin.products.price")}</th>
                <th className={adminThClass}>{t("admin.products.stockQuantity")}</th>
                <th className={adminThClass}>{t("admin.products.active")}</th>
                <th className={adminThClass}>{t("admin.products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className={adminTrClass}>
                  <td className={adminTdClass}>
                    <OrderButtons
                      index={index}
                      count={products.length}
                      disabled={savingOrder || deletingId !== null}
                      moveUpLabel={t("admin.products.moveUp")}
                      moveDownLabel={t("admin.products.moveDown")}
                      onMove={(direction) => void moveProduct(index, direction)}
                    />
                  </td>
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

function OrderButtons({
  index,
  count,
  disabled,
  moveUpLabel,
  moveDownLabel,
  onMove,
}: {
  index: number;
  count: number;
  disabled: boolean;
  moveUpLabel: string;
  moveDownLabel: string;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        aria-label={moveUpLabel}
        disabled={disabled || index === 0}
        onClick={() => onMove(-1)}
      >
        <CaretUp size={14} weight="bold" aria-hidden />
      </button>
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        aria-label={moveDownLabel}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(1)}
      >
        <CaretDown size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
