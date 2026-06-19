import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders localized status label", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <StatusBadge status="confirmed" />
      </I18nextProvider>,
    );
    expect(screen.getByText(/Confirmado|Confirmed/)).toBeInTheDocument();
  });
});
