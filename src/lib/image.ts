// Client-side image utilities: compress before upload to reduce payload
// and speed up AI requests. Preserves reasonable quality for OCR/vision.

const MAX_DIM = 1600;
const QUALITY = 0.82;

export async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

export async function compressImage(file: File): Promise<string> {
  // Skip compression for small files or non-raster formats
  if (file.size < 200 * 1024 || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return fileToDataUrl(file);
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fileToDataUrl(file);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
    if (!blob) return fileToDataUrl(file);
    return await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  } catch {
    return fileToDataUrl(file);
  }
}
