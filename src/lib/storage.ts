import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type AttachmentKind = "IMAGE" | "VIDEO" | "OTHER";

export function classifyMime(mime: string): AttachmentKind {
  if (IMAGE_TYPES.has(mime)) return "IMAGE";
  if (VIDEO_TYPES.has(mime)) return "VIDEO";
  return "OTHER";
}

export function validateFile(file: { type: string; size: number }) {
  const kind = classifyMime(file.type);
  if (kind === "OTHER") {
    return { ok: false as const, error: "Разрешены только изображения (jpg/png/webp/gif) и видео (mp4/webm/mov)" };
  }
  const limit = kind === "IMAGE" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) {
    return { ok: false as const, error: `Файл слишком большой (максимум ${Math.round(limit / 1024 / 1024)}MB)` };
  }
  return { ok: true as const, kind };
}

/**
 * Storage abstraction: uses Vercel Blob in production (when a token is
 * configured) and falls back to writing into /public/uploads for local
 * development, so the app works fully offline without a cloud account.
 */
export async function storeFile(file: File): Promise<{ url: string; kind: AttachmentKind }> {
  const validation = validateFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const ext = file.name.split(".").pop() || "bin";
  const key = `uploads/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, file, { access: "public" });
    return { url: blob.url, kind: validation.kind };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/uploads/${filename}`, kind: validation.kind };
}
