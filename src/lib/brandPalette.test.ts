import { describe, expect, it } from "vitest";
import { deriveBrandPalette } from "./brandPalette";

describe("deriveBrandPalette", () => {
  it("derives a full palette from the store primary color", () => {
    const palette = deriveBrandPalette("#2563eb");
    expect(palette[500]).toBe("#2563eb");
    expect(palette[50]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette[600]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(palette[700]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("falls back to the default blue for invalid hex values", () => {
    const palette = deriveBrandPalette("blue");
    expect(palette[500]).toBe("#2563eb");
  });
});
