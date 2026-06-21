import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrdersPoll } from "@/hooks/useOrdersPoll";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
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
      )}
    </>
  );
}
