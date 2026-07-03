import { useEffect, useState } from "react";
import { Navigate, Outlet, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardText,
  Gear,
  List,
  Package,
  SignOut,
  Storefront,
  X,
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

type AdminNavProps = {
  logoSrc: string;
  storeSlug: string;
  onNavigate?: () => void;
  onLogout: () => void;
};

function AdminNav({ logoSrc, storeSlug, onNavigate, onLogout }: AdminNavProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <img src={logoSrc} alt="" className="h-8 w-8 rounded-lg object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{t("admin.title")}</p>
          <p className="truncate text-xs text-gray-400">{storeSlug}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink to="/admin/orders" className={navLinkClass} onClick={onNavigate}>
          <ClipboardText size={18} weight="bold" aria-hidden />
          {t("admin.nav.orders")}
        </NavLink>
        <NavLink to="/admin/products" className={navLinkClass} onClick={onNavigate}>
          <Package size={18} weight="bold" aria-hidden />
          {t("admin.nav.products")}
        </NavLink>
        <NavLink to="/admin/settings" className={navLinkClass} onClick={onNavigate}>
          <Gear size={18} weight="bold" aria-hidden />
          {t("admin.nav.settings")}
        </NavLink>
      </nav>

      <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
        <a
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          onClick={onNavigate}
        >
          <Storefront size={18} weight="bold" aria-hidden />
          {t("nav.store")}
        </a>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          <SignOut size={18} weight="bold" aria-hidden />
          {t("admin.logout")}
        </button>
      </div>
    </>
  );
}

export function AdminLayout() {
  const { t } = useTranslation();
  const { token, login, logout, isAuthenticated } = useAdminAuth();
  const settings = useStoreConfig();
  const logoSrc = resolvePublicLogoUrl(settings.logoUrl);
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  if (!isAuthenticated || !token) {
    return <AdminLogin onLogin={(p) => login(p).then(() => undefined)} />;
  }

  const closeNav = () => setNavOpen(false);

  return (
    <div className="flex min-h-[100dvh] bg-gray-50 font-sans text-gray-900">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label={t("admin.nav.closeMenu")}
          onClick={closeNav}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white px-4 py-5 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="mb-4 inline-flex items-center justify-center self-end rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label={t("admin.nav.closeMenu")}
          onClick={closeNav}
        >
          <X size={20} weight="bold" aria-hidden />
        </button>

        <AdminNav logoSrc={logoSrc} storeSlug={settings.storeSlug} onNavigate={closeNav} onLogout={logout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label={t("admin.nav.openMenu")}
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <List size={22} weight="bold" aria-hidden />
          </button>
          <img src={logoSrc} alt="" className="h-7 w-7 rounded-lg object-contain" />
          <p className="min-w-0 truncate text-sm font-bold text-gray-900">{t("admin.title")}</p>
        </header>

        <div className="min-w-0 flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:p-8">
          <Outlet context={{ token }} />
        </div>
      </div>
    </div>
  );
}

export function AdminIndexRedirect() {
  return <Navigate to="orders" replace />;
}
