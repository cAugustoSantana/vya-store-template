import { useEffect, useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@shared/imageUrl";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import {
  productImageClass,
  productImageFrameClass,
} from "@/lib/productImageLayout";

type Props = {
  productId: string;
  imageUrls: string[];
  alt: string;
  zoomLabel: string;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  frameClass?: string;
};

export function ProductGallery({
  productId,
  imageUrls,
  alt,
  zoomLabel,
  closeLabel,
  previousLabel,
  nextLabel,
  frameClass = productImageFrameClass,
}: Props) {
  const images = imageUrls.length > 0 ? imageUrls : [PRODUCT_IMAGE_PLACEHOLDER];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeIndex = Math.min(index, images.length - 1);
  const imageSrc = resolvePublicProductImageUrl(
    productId,
    images[activeIndex] ?? PRODUCT_IMAGE_PLACEHOLDER,
    undefined,
    activeIndex,
  );
  const hasMany = images.length > 1;

  const showPrevious = () => setIndex((current) => Math.max(current - 1, 0));
  const showNext = () => setIndex((current) => Math.min(current + 1, images.length - 1));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") setIndex((current) => Math.max(current - 1, 0));
      if (event.key === "ArrowRight") {
        setIndex((current) => Math.min(current + 1, images.length - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={`group ${frameClass}`}
          aria-label={zoomLabel}
        >
          <img src={imageSrc} alt={alt} className={productImageClass} />
        </button>
        {hasMany ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm transition-colors hover:bg-white disabled:opacity-40"
              aria-label={previousLabel}
              disabled={activeIndex === 0}
              onClick={showPrevious}
            >
              <CaretLeft size={18} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm transition-colors hover:bg-white disabled:opacity-40"
              aria-label={nextLabel}
              disabled={activeIndex === images.length - 1}
              onClick={showNext}
            >
              <CaretRight size={18} weight="bold" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:px-0">
          {images.map((url, imageIndex) => {
            const thumbSrc = resolvePublicProductImageUrl(productId, url, undefined, imageIndex);
            const selected = imageIndex === activeIndex;
            return (
              <button
                key={`${url}-${imageIndex}`}
                type="button"
                aria-label={`${alt} ${imageIndex + 1}`}
                aria-current={selected ? "true" : undefined}
                onClick={() => setIndex(imageIndex)}
                className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-100 ${
                  selected ? "border-brand-600 ring-2 ring-brand-600" : "border-gray-200"
                }`}
              >
                <img src={thumbSrc} alt="" className="h-full w-full object-contain" />
              </button>
            );
          })}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={closeLabel}
            onClick={() => setLightboxOpen(false)}
          >
            <X size={22} weight="bold" aria-hidden />
          </button>
          {hasMany ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                aria-label={previousLabel}
                disabled={activeIndex === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
              >
                <CaretLeft size={18} weight="bold" aria-hidden />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                aria-label={nextLabel}
                disabled={activeIndex === images.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <CaretRight size={18} weight="bold" aria-hidden />
              </button>
            </>
          ) : null}
          <img
            src={imageSrc}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
