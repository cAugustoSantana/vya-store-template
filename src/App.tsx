import { Routes, Route } from "react-router-dom";
import { storeConfig } from "@shared/store.config";
import { Header } from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import { StorefrontPage } from "@/pages/StorefrontPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { AdminPage } from "@/pages/AdminPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import styles from "./App.module.css";

export default function App() {
  const primaryColor = storeConfig.primaryColor;

  return (
    <CartProvider>
      <div
        className={styles.app}
        style={{ ["--color-primary" as string]: primaryColor }}
      >
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<StorefrontPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/payment/:displayId" element={<PaymentPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
}
