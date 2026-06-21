type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export function ProductGallery({ images, alt, className = "" }: Props) {
  const src = images[0] ?? "/products/prod-1.svg";

  return (
    <div
      className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 lg:max-h-[calc(100dvh-7rem)] lg:p-5 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="relative z-10 max-h-full max-w-full object-contain"
      />
    </div>
  );
}
