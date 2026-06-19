/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  isValidPhone,
  isValidEmail,
  validateProofImage,
  validateCheckout,
  PROOF_MAX_BYTES,
} from "./validate";

const validItem = {
  productId: "prod-1",
  variants: { size: "m", color: "black" },
  quantity: 1,
};

const validCheckout = {
  locale: "es",
  buyer: {
    name: "Ana Test",
    phone: "+1 849 620 2020",
    email: "ana@example.com",
  },
  items: [validItem],
  honeypot: "",
};

describe("normalizePhone", () => {
  it("normalizes formatted NANP input", () => {
    expect(normalizePhone("+1 849 620 2020")).toBe("18496202020");
  });

  it("prepends country code for local 10-digit", () => {
    expect(normalizePhone("8095551234")).toBe("18095551234");
  });
});

describe("isValidPhone", () => {
  it("accepts 10-15 digits", () => {
    expect(isValidPhone("18496202020")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("1".repeat(16))).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("validates basic emails", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
  });
});

describe("validateCheckout", () => {
  it("accepts valid cart and recomputes total from config", () => {
    const result = validateCheckout({
      ...validCheckout,
      items: [{ ...validItem, quantity: 2 }],
    });
    expect(result.total).toBe(3000);
    expect(result.buyer.phone).toBe("18496202020");
    expect(result.lines[0].productId).toBe("prod-1");
  });

  it("rejects filled honeypot", () => {
    expect(() =>
      validateCheckout({ ...validCheckout, honeypot: "spam" }),
    ).toThrow("honeypot");
  });

  it("rejects empty cart", () => {
    expect(() => validateCheckout({ ...validCheckout, items: [] })).toThrow(
      "empty_cart",
    );
  });

  it("rejects unknown product", () => {
    expect(() =>
      validateCheckout({
        ...validCheckout,
        items: [{ ...validItem, productId: "missing" }],
      }),
    ).toThrow("invalid_product");
  });

  it("rejects missing variant", () => {
    expect(() =>
      validateCheckout({
        ...validCheckout,
        items: [{ productId: "prod-1", variants: { size: "m" }, quantity: 1 }],
      }),
    ).toThrow("missing_variant");
  });

  it("rejects invalid quantity", () => {
    expect(() =>
      validateCheckout({
        ...validCheckout,
        items: [{ ...validItem, quantity: 0 }],
      }),
    ).toThrow("invalid_quantity");
  });
});

describe("validateProofImage", () => {
  it("accepts png magic bytes", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateProofImage(buf)).toBe("image/png");
  });

  it("accepts jpeg magic bytes", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(validateProofImage(buf)).toBe("image/jpeg");
  });

  it("rejects unknown bytes", () => {
    expect(() => validateProofImage(Buffer.from("hello"))).toThrow(
      "invalid_image_type",
    );
  });

  it("rejects oversized files", () => {
    const buf = Buffer.alloc(PROOF_MAX_BYTES + 1);
    buf[0] = 0x89;
    buf[1] = 0x50;
    buf[2] = 0x4e;
    buf[3] = 0x47;
    expect(() => validateProofImage(buf)).toThrow("file_too_large");
  });
});
