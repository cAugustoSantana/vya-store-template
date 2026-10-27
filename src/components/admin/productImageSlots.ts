export type ProductImageSlot =
  | { id: string; kind: "stored"; url: string }
  | { id: string; kind: "pending"; file: File; previewUrl: string };

export function slotsFromUrls(urls: string[]): ProductImageSlot[] {
  return urls.map((url, index) => ({
    id: `stored-${index}-${url}`,
    kind: "stored" as const,
    url,
  }));
}

export function pendingImageSlot(file: File): ProductImageSlot {
  return {
    id: crypto.randomUUID(),
    kind: "pending",
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokePendingPreviews(slots: ProductImageSlot[]) {
  for (const slot of slots) {
    if (slot.kind === "pending") URL.revokeObjectURL(slot.previewUrl);
  }
}
