import { Routes, Route, useLocation } from "react-router-dom";

import type { PublicStoreSettings } from "@shared/storeSettings.types";

import { Header } from "@/components/Header";

import { ProductsProvider } from "@/context/ProductsContext";

import { StoreSettingsProvider } from "@/context/StoreSettingsContext";

import { CartProvider } from "@/context/CartContext";

import { StorefrontPage } from "@/pages/StorefrontPage";

import { CheckoutPage } from "@/pages/CheckoutPage";

import { ProductDetailPage } from "@/pages/ProductDetailPage";

import { PaymentPage } from "@/pages/PaymentPage";

import {

  AdminLayout,

  AdminIndexRedirect,

} from "@/pages/admin/AdminLayout";

import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";

import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";

import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";

import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";

import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

import { NotFoundPage } from "@/pages/NotFoundPage";

import { VercelInsights } from "@/components/VercelInsights";

import { defaultPublicStoreSettings } from "@/lib/defaultStoreSettings";

import styles from "./App.module.css";



function AppRoutes() {

  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const isCheckoutRoute = location.pathname === "/checkout";

  const isPaymentRoute = location.pathname.startsWith("/order/payment");

  const isStorefrontRoute =

    location.pathname === "/" || location.pathname.startsWith("/products/");



  return (

    <div className={styles.app}>

      {!isAdminRoute &&

        !isCheckoutRoute &&

        !isPaymentRoute &&

        !isStorefrontRoute && <Header />}

      <main className={styles.main}>

        <Routes>

          <Route path="/" element={<StorefrontPage />} />

          <Route path="/products/:productId" element={<ProductDetailPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/order/payment/:displayId" element={<PaymentPage />} />

          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<AdminIndexRedirect />} />

            <Route path="orders" element={<AdminOrdersPage />} />

            <Route path="orders/:displayId" element={<AdminOrderDetailPage />} />

            <Route path="products" element={<AdminProductsPage />} />

            <Route path="products/new" element={<AdminProductFormPage />} />

            <Route path="products/:productId" element={<AdminProductFormPage />} />

            <Route path="settings" element={<AdminSettingsPage />} />

          </Route>

          <Route path="*" element={<NotFoundPage />} />

        </Routes>

      </main>

    </div>

  );

}



export default function App({

  initialStoreSettings = defaultPublicStoreSettings,

}: {

  initialStoreSettings?: PublicStoreSettings;

}) {

  return (

    <ProductsProvider>

      <StoreSettingsProvider initialSettings={initialStoreSettings}>

        <CartProvider>

          <AppRoutes />

          <VercelInsights />

        </CartProvider>

      </StoreSettingsProvider>

    </ProductsProvider>

  );

}

