/** Shared product photo frame — matches catalog + detail pages. */
export const productImageFrameClass =
  "relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 aspect-[4/5] max-h-[min(62dvh,520px)] sm:aspect-[3/4] lg:aspect-[4/5] lg:max-h-[min(480px,calc(100dvh-8rem))]";

export const productDetailImageFrameClass =
  "relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 aspect-square lg:rounded-2xl lg:aspect-[4/5] lg:max-h-[min(480px,calc(100dvh-8rem))]";

export const productImageClass =
  "h-full w-full object-contain object-center p-1 sm:p-2";

export const productCardFrameClass =
  "relative w-full overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] lg:max-h-[calc(100dvh-9.5rem)]";

export const productCardImageClass =
  "absolute inset-0 h-full w-full object-contain object-center p-1 sm:p-2 transition-transform duration-500 group-hover:scale-[1.02]";
