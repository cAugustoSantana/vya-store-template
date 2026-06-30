import { describe, it, expect } from "vitest";
import {
  normalizeProductTextInput,
  productTextFromStored,
  productTextToStored,
} from "./productText.js";

describe("productText", () => {
  it("reads plain string from stored value", () => {
    expect(productTextFromStored("Bolso Cuero")).toBe("Bolso Cuero");
  });

  it("reads legacy localized object preferring es when values differ", () => {
    expect(
      productTextFromStored({ es: "Camiseta Básica", en: "Basic T-shirt" }),
    ).toBe("Camiseta Básica");
  });

  it("reads legacy localized object when es and en match", () => {
    expect(productTextFromStored({ es: "Cuero", en: "Cuero" })).toBe("Cuero");
  });

  it("normalizes API input from string or object", () => {
    expect(normalizeProductTextInput("Bag")).toBe("Bag");
    expect(normalizeProductTextInput({ es: "Bolso", en: "Bag" })).toBe("Bolso");
  });

  it("stores the same text for all locales", () => {
    expect(productTextToStored("Cuero Tote")).toEqual({ es: "Cuero Tote", en: "Cuero Tote" });
  });
});
