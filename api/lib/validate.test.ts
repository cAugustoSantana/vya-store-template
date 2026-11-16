/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import { validateCheckout } from "./validate.js";
import type { Product } from "../../shared/product.types.js";

const mockProduct: Product = {
  id: "prod-1",
  name: "Camiseta Básica",
  description: "Desc",
  price: 1500,
  imageUrl: "/products/prod-1.svg",
  imageUrls: ["/products/prod-1.svg"],
  variantOptions: {
    size: {
      label: { es: "Talla", en: "Size" },
      values: {
        s: { es: "S", en: "S" },
        m: { es: "M", en: "M" },
        l: { es: "L", en: "L" },
        xl: { es: "XL", en: "XL" },
      },
    },
    color: {
      label: { es: "Color", en: "Color" },
      values: {
        black: { es: "Negro", en: "Black" },
        white: { es: "Blanco", en: "White" },
      },
    },
  },
  active: true,
  stockQuantity: 100,
};

const lookup = async (id: string) => (id === "prod-1" ? mockProduct : null);

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
  shipping: {
    address: "123 Street Name",
    city: "Santo Domingo",
    postalCode: "10101",
  },
  items: [validItem],
  honeypot: "",
};

describe("normalizePhone", () => {
  it("normalizes formatted NANP input", async () => {
    const { normalizePhone } = await import("./validate.js");
    const { defaultStoreSettings } = await import("./storeSettings.js");
    const config = defaultStoreSettings();
    expect(normalizePhone("+1 849 620 2020", config)).toBe("18496202020");
  });

  it("prepends country code for local 10-digit", async () => {
    const { normalizePhone } = await import("./validate.js");
    const { defaultStoreSettings } = await import("./storeSettings.js");
    const config = defaultStoreSettings();
    expect(normalizePhone("8095551234", config)).toBe("18095551234");
  });
});

describe("isValidPhone", () => {
  it("accepts 10-15 digits", async () => {
    const { isValidPhone } = await import("./validate.js");
    expect(isValidPhone("18496202020")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("1".repeat(16))).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("validates basic emails", async () => {
    const { isValidEmail } = await import("./validate.js");
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
  });
});

describe("validateCheckout", () => {
  it("accepts valid cart and recomputes total from product lookup", async () => {
    const result = await validateCheckout(
      {
        ...validCheckout,
        items: [{ ...validItem, quantity: 2 }],
      },
      lookup,
    );
    expect(result.total).toBe(3000);
    expect(result.buyer.phone).toBe("18496202020");
    expect(result.lines[0].productId).toBe("prod-1");
  });

  it("requires shipping fields", async () => {
    await expect(
      validateCheckout(
        {
          ...validCheckout,
          shipping: { ...validCheckout.shipping, address: "" },
        },
        lookup,
      ),
    ).rejects.toThrow("invalid_shipping_address");
  });

  it("rejects filled honeypot", async () => {
    await expect(
      validateCheckout({ ...validCheckout, honeypot: "spam" }, lookup),
    ).rejects.toThrow("honeypot");
  });

  it("rejects empty cart", async () => {
    await expect(
      validateCheckout({ ...validCheckout, items: [] }, lookup),
    ).rejects.toThrow("empty_cart");
  });

  it("rejects unknown product", async () => {
    await expect(
      validateCheckout(
        {
          ...validCheckout,
          items: [{ ...validItem, productId: "missing" }],
        },
        lookup,
      ),
    ).rejects.toThrow("invalid_product");
  });

  it("rejects missing variant", async () => {
    await expect(
      validateCheckout(
        {
          ...validCheckout,
          items: [{ productId: "prod-1", variants: { size: "m" }, quantity: 1 }],
        },
        lookup,
      ),
    ).rejects.toThrow("missing_variant");
  });

  it("rejects invalid quantity", async () => {
    await expect(
      validateCheckout(
        {
          ...validCheckout,
          items: [{ ...validItem, quantity: 0 }],
        },
        lookup,
      ),
    ).rejects.toThrow("invalid_quantity");
  });

  it("rejects quantity above available stock", async () => {
    const lowStockLookup = async (id: string) =>
      id === "prod-1" ? { ...mockProduct, stockQuantity: 5 } : null;

    await expect(
      validateCheckout(
        {
          ...validCheckout,
          items: [{ ...validItem, quantity: 6 }],
        },
        lowStockLookup,
      ),
    ).rejects.toThrow("insufficient_stock");
  });

  it("rejects quantity above variant stock", async () => {
    const variantLookup = async (id: string) =>
      id === "prod-1"
        ? {
            ...mockProduct,
            stockQuantity: 100,
            variants: [
              {
                key: "color:black|size:m",
                options: { size: "m", color: "black" },
                price: null,
                stockQuantity: 2,
              },
            ],
          }
        : null;

    await expect(
      validateCheckout(
        {
          ...validCheckout,
          items: [{ ...validItem, quantity: 3 }],
        },
        variantLookup,
      ),
    ).rejects.toThrow("insufficient_stock");
  });

  it("uses variant price when set", async () => {
    const variantLookup = async (id: string) =>
      id === "prod-1"
        ? {
            ...mockProduct,
            variants: [
              {
                key: "color:black|size:m",
                options: { size: "m", color: "black" },
                price: 1800,
                stockQuantity: 10,
              },
            ],
          }
        : null;

    const result = await validateCheckout(validCheckout, variantLookup);
    expect(result.lines[0]?.unitPrice).toBe(1800);
  });
});

const { JPEG_BYTES } = vi.hoisted(() => ({
  JPEG_BYTES: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
}));

vi.mock("./heifImage.js", async () => {
  const actual = await vi.importActual<typeof import("./heifImage.js")>("./heifImage.js");
  return {
    ...actual,
    convertHeifToJpeg: vi.fn(async () => JPEG_BYTES),
  };
});

function heicContainer(): Buffer {
  const buffer = Buffer.alloc(20);
  buffer.writeUInt32BE(20, 0);
  buffer.write("ftyp", 4, "latin1");
  buffer.write("heic", 8, "latin1");
  buffer.write("mif1", 16, "latin1");
  return buffer;
}

describe("validateProofImage", () => {
  it("accepts png magic bytes", async () => {
    const { validateProofImage, PROOF_MAX_BYTES } = await import("./validate.js");
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await expect(validateProofImage(buf)).resolves.toEqual({
      buffer: buf,
      contentType: "image/png",
    });
    expect(PROOF_MAX_BYTES).toBeGreaterThan(0);
  });

  it("accepts jpeg magic bytes", async () => {
    const { validateProofImage } = await import("./validate.js");
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    await expect(validateProofImage(buf)).resolves.toEqual({
      buffer: buf,
      contentType: "image/jpeg",
    });
  });

  it("converts HEIC bytes to jpeg, including files labeled as jpeg", async () => {
    const { validateProofImage } = await import("./validate.js");
    const buf = heicContainer();
    await expect(validateProofImage(buf, "image/jpeg")).resolves.toEqual({
      buffer: JPEG_BYTES,
      contentType: "image/jpeg",
    });
    await expect(validateProofImage(buf, "image/heic")).resolves.toEqual({
      buffer: JPEG_BYTES,
      contentType: "image/jpeg",
    });
  });

  it("rejects a HEIC file that does not decode", async () => {
    const { convertHeifToJpeg } = await import("./heifImage.js");
    vi.mocked(convertHeifToJpeg).mockRejectedValueOnce(new Error("unsupported"));
    const { validateProofImage } = await import("./validate.js");
    await expect(validateProofImage(heicContainer(), "image/heic")).rejects.toThrow(
      "invalid_image_type",
    );
  });

  it("rejects unknown bytes", async () => {
    const { validateProofImage } = await import("./validate.js");
    await expect(validateProofImage(Buffer.from("hello"))).rejects.toThrow("invalid_image_type");
  });

  it("rejects oversized files", async () => {
    const { validateProofImage, PROOF_MAX_BYTES } = await import("./validate.js");
    const buf = Buffer.alloc(PROOF_MAX_BYTES + 1);
    buf[0] = 0x89;
    buf[1] = 0x50;
    buf[2] = 0x4e;
    buf[3] = 0x47;
    await expect(validateProofImage(buf)).rejects.toThrow("file_too_large");
  });
});
