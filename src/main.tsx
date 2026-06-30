import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { loadStoreSettings } from "@/lib/bootstrapStoreSettings";
import "./i18n";
import App from "./App";
import "./styles/global.css";

async function start() {
  const initialStoreSettings = await loadStoreSettings();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App initialStoreSettings={initialStoreSettings} />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </StrictMode>,
  );
}

void start();
