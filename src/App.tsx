import { Routes, Route, useLocation } from "react-router-dom";
import { storeConfig } from "@shared/store.config";
import { Header } from "@/components/Header";
import { ProductsProvider } from "@/context/ProductsContext";
import { CartProvider } from "@/context/CartContext";
import { StorefrontPage } from "@/pages/StorefrontPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { PaymentPage } from "@/pages/PaymentPage";
import {
  AdminLayout,
  AdminIndexRedirect,
} from "@/pages/admin/AdminLayout";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/pages/admin/AdminOrderDetailPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import styles from "./App.module.css";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCheckoutRoute = location.pathname === "/checkout";

  return (
    <div
      className={styles.app}
      style={{ ["--color-primary" as string]: storeConfig.primaryColor }}
    >
      {!isAdminRoute && !isCheckoutRoute && <Header />}
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/payment/:displayId" element={<PaymentPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminIndexRedirect />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:displayId" element={<AdminOrderDetailPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:productId" element={<AdminProductFormPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </ProductsProvider>
  );
}
