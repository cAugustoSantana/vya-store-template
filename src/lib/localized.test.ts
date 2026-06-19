import { describe, it, expect } from "vitest";
import { getLocalized } from "./localized";

describe("getLocalized", () => {
  it("returns string fields as-is", () => {
    expect(getLocalized("Hello", "es")).toBe("Hello");
  });

  it("returns locale-specific value", () => {
    expect(getLocalized({ es: "Hola", en: "Hello" }, "en")).toBe("Hello");
  });

  it("falls back to default locale", () => {
    expect(getLocalized({ es: "Hola", en: "Hello" }, "en")).toBe("Hello");
    expect(getLocalized({ es: "Hola" }, "en")).toBe("Hola");
  });
});
