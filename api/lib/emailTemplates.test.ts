import { describe, expect, it } from "vitest";
import { escapeHtml, renderEmailLayout } from "./emailTemplates.js";

describe("escapeHtml", () => {
  it("escapes user-provided text", () => {
    expect(escapeHtml(`<script>"x"</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot;&lt;/script&gt;",
    );
  });
});

describe("renderEmailLayout", () => {
  it("includes store branding and CTA", () => {
    const html = renderEmailLayout({
      storeName: "Mi Tienda",
      primaryColor: "#2563eb",
      logoUrl: "https://example.com/api/settings/logo",
      title: "Pedido recibido",
      bodyHtml: "<p>Total: <strong>RD$100</strong></p>",
      cta: { label: "Ver pedido", href: "https://example.com/order" },
    });
    expect(html).toContain("Mi Tienda");
    expect(html).toContain("#f9fafb");
    expect(html).toContain("Ver pedido");
    expect(html).toContain("https://example.com/order");
  });
});
