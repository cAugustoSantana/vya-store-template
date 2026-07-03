import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react";
import { useOrdersPoll } from "@/hooks/useOrdersPoll";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AdminEmpty,
  AdminMobileCard,
  AdminMobileList,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/AdminUi";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@shared/types";

type AdminOutletContext = { token: string };

export function AdminOrdersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { token } = useOutletContext<AdminOutletContext>();
  const { orders, loading, error } = useOrdersPoll(token);

  return (
    <>
      <AdminPageHeader title={t("admin.orders")} />

      {loading && orders.length === 0 && <p className="text-sm text-gray-500">{t("common.loading")}</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {orders.length === 0 && !loading ? (
        <AdminEmpty>{t("admin.noOrders")}</AdminEmpty>
      ) : (
        <>
          <AdminMobileList>
            {orders.map((order) => (
              <AdminMobileCard
                key={order.id}
                to={`/admin/orders/${encodeURIComponent(order.displayId)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{order.displayId}</p>
                    <p className="mt-0.5 truncate text-sm text-gray-500">{order.buyer.name}</p>
                  </div>
                  <StatusBadge status={order.estado} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    {formatMoney(order.total, locale)}
                    <CaretRight size={14} weight="bold" className="text-gray-400" aria-hidden />
                  </span>
                </div>
              </AdminMobileCard>
            ))}
          </AdminMobileList>

          <AdminTable>
            <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">{t("admin.orderId")}</th>
                <th className="px-4 py-3">{t("admin.date")}</th>
                <th className="px-4 py-3">{t("admin.buyer")}</th>
                <th className="px-4 py-3">{t("admin.status")}</th>
                <th className="px-4 py-3">{t("admin.total")}</th>
                <th className="px-4 py-3" aria-label={t("admin.viewDetails")} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-semibold text-gray-900">{order.displayId}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(order.createdAt).toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.buyer.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.estado} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatMoney(order.total, locale)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      to={`/admin/orders/${encodeURIComponent(order.displayId)}`}
                    >
                      {t("admin.viewDetails")}
                    </Link>
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
