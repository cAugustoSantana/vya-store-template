import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { resolvePublicProductImageUrl } from "@/lib/imageUrl";
import {
  productImageClass,
  productImageFrameClass,
} from "@/lib/productImageLayout";

type Props = {
  productId: string;
  imageUrl: string;
  alt: string;
  zoomLabel: string;
  closeLabel: string;
  frameClass?: string;
};

export function ProductGallery({
  productId,
  imageUrl,
  alt,
  zoomLabel,
  closeLabel,
  frameClass = productImageFrameClass,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageSrc = resolvePublicProductImageUrl(productId, imageUrl);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`group ${frameClass}`}
        aria-label={zoomLabel}
      >
        <img src={imageSrc} alt={alt} className={productImageClass} />
      </button>

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
          <img
            src={imageSrc}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
