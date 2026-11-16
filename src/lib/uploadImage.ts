export const UPLOAD_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/heic,image/heif,.png,.jpg,.jpeg,.heic,.heif";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

export function isAllowedUploadImage(file: File): boolean {
  if (ALLOWED_TYPES.has(file.type)) return true;
  // iOS photo library often leaves File.type empty and keeps the original name.
  return /\.(png|jpe?g|heic|heif)$/i.test(file.name);
}
