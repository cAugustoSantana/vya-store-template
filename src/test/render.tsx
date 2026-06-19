import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "@/i18n";
import { CartProvider } from "@/context/CartContext";

type Options = RenderOptions & { route?: string };

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { route = "/", ...renderOptions } = options;
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>,
    renderOptions,
  );
}
