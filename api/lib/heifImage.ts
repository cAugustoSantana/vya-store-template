const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
]);

// Still-image HEIF that is not AVIF. AVIF uses these as compatible brands only.
const HEIF_MAJOR_BRANDS = new Set(["mif1", "msf1"]);

function brandAt(buffer: Buffer, offset: number): string {
  return buffer.toString("latin1", offset, offset + 4);
}

export function isHeifImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (brandAt(buffer, 4) !== "ftyp") return false;

  const major = brandAt(buffer, 8);
  if (major === "avif" || major === "avis") return false;
  if (HEIC_BRANDS.has(major) || HEIF_MAJOR_BRANDS.has(major)) return true;

  const boxSize = buffer.readUInt32BE(0);
  if (boxSize < 16) return false;
  const end = Math.min(buffer.length, boxSize);
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    if (HEIC_BRANDS.has(brandAt(buffer, offset))) return true;
  }
  return false;
}

export async function convertHeifToJpeg(buffer: Buffer): Promise<Buffer> {
  // sharp's prebuilds decode AVIF, not HEVC, so iPhone HEIC needs libheif.
  const { default: convert } = await import("heic-convert");
  const jpeg = await convert({
    buffer,
    format: "JPEG",
    quality: 0.82,
  });
  return Buffer.from(jpeg);
}
