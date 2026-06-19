import { describe, it, expect } from "vitest";
import { formatMoney, formatPhoneDisplay } from "./format";

describe("formatMoney", () => {
  it("formats DOP for es locale", () => {
    const result = formatMoney(1500, "es");
    expect(result).toMatch(/1[,.]?500/);
  });
});

describe("formatPhoneDisplay", () => {
  it("formats 11-digit NANP number", () => {
    expect(formatPhoneDisplay("18496202020", "es")).toBe("+1 849 620 2020");
  });
});
