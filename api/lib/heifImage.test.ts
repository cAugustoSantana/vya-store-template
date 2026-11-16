import { describe, expect, it } from "vitest";
import { isHeifImage } from "./heifImage.js";

function ftyp(major: string, compatible: string[] = []): Buffer {
  const size = 16 + compatible.length * 4;
  const buffer = Buffer.alloc(size);
  buffer.writeUInt32BE(size, 0);
  buffer.write("ftyp", 4, "latin1");
  buffer.write(major, 8, "latin1");
  compatible.forEach((brand, index) => {
    buffer.write(brand, 16 + index * 4, "latin1");
  });
  return buffer;
}

describe("isHeifImage", () => {
  it("recognizes iPhone HEIC brands", () => {
    expect(isHeifImage(ftyp("heic", ["mif1"]))).toBe(true);
    expect(isHeifImage(ftyp("mif1", ["heic"]))).toBe(true);
    expect(isHeifImage(ftyp("heix"))).toBe(true);
  });

  it("recognizes a compatible HEIC brand when the major brand is generic", () => {
    expect(isHeifImage(ftyp("isom", ["heic"]))).toBe(true);
  });

  it("does not treat AVIF as HEIC", () => {
    expect(isHeifImage(ftyp("avif", ["mif1", "miaf"]))).toBe(false);
    expect(isHeifImage(ftyp("avis", ["mif1"]))).toBe(false);
  });

  it("rejects files that are not HEIF", () => {
    expect(isHeifImage(Buffer.from([0xff, 0xd8, 0xff]))).toBe(false);
    expect(isHeifImage(Buffer.from("hello"))).toBe(false);
  });
});

