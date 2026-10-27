import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { MAX_PRODUCT_IMAGES } from "@shared/imageUrl";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import { pendingImageSlot, type ProductImageSlot } from "./productImageSlots";

type Props = {
  productId: string;
  slots: ProductImageSlot[];
  savedUrls: string[];
  onChange: (slots: ProductImageSlot[]) => void;
};

function moveSlot(slots: ProductImageSlot[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (next < 0 || next >= slots.length) return slots;
  const copy = [...slots];
  const [item] = copy.splice(index, 1);
  if (!item) return slots;
  copy.splice(next, 0, item);
  return copy;
}

export function ProductImagesEditor({ productId, slots, savedUrls, onChange }: Props) {
  const { t } = useTranslation();
  const atLimit = slots.length >= MAX_PRODUCT_IMAGES;

  const previewSrc = (slot: ProductImageSlot) => {
    if (slot.kind === "pending") return slot.previewUrl;
    const savedIndex = savedUrls.indexOf(slot.url);
    if (savedIndex < 0) return slot.url;
    return resolvePublicProductImageUrl(productId, slot.url, undefined, savedIndex);
  };

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">{t("admin.products.imagesHint")}</p>
      <input
        id="image"
        type="file"
        accept="image/png,image/jpeg"
        multiple
        disabled={atLimit}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700 disabled:opacity-60"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          const room = MAX_PRODUCT_IMAGES - slots.length;
          if (room <= 0 || files.length === 0) return;
          onChange([...slots, ...files.slice(0, room).map(pendingImageSlot)]);
        }}
      />
      {slots.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {slots.map((slot, index) => (
            <li
              key={slot.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-2"
            >
              <img
                src={previewSrc(slot)}
                alt=""
                className="h-16 w-14 rounded-lg border border-gray-200 object-contain"
              />
              <p className="min-w-0 flex-1 text-sm font-semibold text-gray-700">
                {index === 0 ? t("admin.products.coverImage") : t("admin.products.imageN", { index: index + 1 })}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  aria-label={t("admin.products.moveImageUp")}
                  disabled={index === 0}
                  onClick={() => onChange(moveSlot(slots, index, -1))}
                >
                  <CaretUp size={16} weight="bold" aria-hidden />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  aria-label={t("admin.products.moveImageDown")}
                  disabled={index === slots.length - 1}
                  onClick={() => onChange(moveSlot(slots, index, 1))}
                >
                  <CaretDown size={16} weight="bold" aria-hidden />
                </button>
                <button
                  type="button"
                  className="px-2 text-sm font-semibold text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (slot.kind === "pending") URL.revokeObjectURL(slot.previewUrl);
                    onChange(slots.filter((item) => item.id !== slot.id));
                  }}
                >
                  {t("admin.products.removeImage")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
