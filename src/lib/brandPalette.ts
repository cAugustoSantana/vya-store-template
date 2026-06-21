type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function mixRgb(a: Rgb, b: Rgb, weightA: number): Rgb {
  const weightB = 1 - weightA;
  return {
    r: Math.round(a.r * weightA + b.r * weightB),
    g: Math.round(a.g * weightA + b.g * weightB),
    b: Math.round(a.b * weightA + b.b * weightB),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export type BrandPalette = {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
  900: string;
};

export function deriveBrandPalette(primaryColor: string): BrandPalette {
  const base = hexToRgb(primaryColor) ?? hexToRgb("#2563eb")!;
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  return {
    50: rgbToHex(mixRgb(base, white, 0.1)),
    100: rgbToHex(mixRgb(base, white, 0.22)),
    500: rgbToHex(base),
    600: rgbToHex(mixRgb(base, black, 0.12)),
    700: rgbToHex(mixRgb(base, black, 0.22)),
    900: rgbToHex(mixRgb(base, black, 0.45)),
  };
}

export function applyBrandPaletteToDocument(primaryColor: string): void {
  const palette = deriveBrandPalette(primaryColor);
  const root = document.documentElement;
  root.style.setProperty("--color-brand-50", palette[50]);
  root.style.setProperty("--color-brand-100", palette[100]);
  root.style.setProperty("--color-brand-500", palette[500]);
  root.style.setProperty("--color-brand-600", palette[600]);
  root.style.setProperty("--color-brand-700", palette[700]);
  root.style.setProperty("--color-brand-900", palette[900]);
  root.style.setProperty("--color-primary", palette[600]);
}
