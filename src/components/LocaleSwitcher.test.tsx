import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { LocaleSwitcher } from "./LocaleSwitcher";

function renderWithI18n() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LocaleSwitcher />
    </I18nextProvider>,
  );
}

describe("LocaleSwitcher", () => {
  it("renders locale buttons and switches language", async () => {
    renderWithI18n();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(i18n.language).toBe("en");
    await user.click(screen.getByRole("button", { name: "ES" }));
    expect(i18n.language).toBe("es");
  });
});
