import { Navigate, Outlet, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardText,
  Gear,
  Package,
  SignOut,
  Storefront,
} from "@phosphor-icons/react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useStoreConfig } from "@/context/StoreSettingsContext";
import { resolvePublicLogoUrl } from "@/lib/logoUrl";
import { AdminLogin } from "./AdminLogin";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-brand-50 text-brand-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export function AdminLayout() {
  const { t } = useTranslation();
  const { token, login, logout, isAuthenticated } = useAdminAuth();
  const settings = useStoreConfig();
  const logoSrc = resolvePublicLogoUrl(settings.logoUrl);

  if (!isAuthenticated || !token) {
    return <AdminLogin onLogin={(p) => login(p).then(() => undefined)} />;
  }

  return (
    <div className="flex min-h-[100dvh] bg-gray-50 font-sans text-gray-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-5">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <img src={logoSrc} alt="" className="h-8 w-8 rounded-lg object-contain" />
          <div>
            <p className="text-sm font-bold text-gray-900">{t("admin.title")}</p>
            <p className="text-xs text-gray-400">{settings.storeSlug}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/admin/orders" className={navLinkClass}>
            <ClipboardText size={18} weight="bold" aria-hidden />
            {t("admin.nav.orders")}
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            <Package size={18} weight="bold" aria-hidden />
            {t("admin.nav.products")}
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass}>
            <Gear size={18} weight="bold" aria-hidden />
            {t("admin.nav.settings")}
          </NavLink>
        </nav>

        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
          <a
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            <Storefront size={18} weight="bold" aria-hidden />
            {t("nav.store")}
          </a>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            <SignOut size={18} weight="bold" aria-hidden />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet context={{ token }} />
      </div>
    </div>
  );
}

export function AdminIndexRedirect() {
  return <Navigate to="orders" replace />;
}
