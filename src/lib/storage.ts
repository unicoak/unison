import { mkdir, writeFile } from "fs/promises";
import path from "path";
import os from "os";
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

/** Directory used by the local-disk fallback — the app's own deployed
 * files (e.g. /app/public) are often read-only in containerized hosting,
 * but the OS temp directory is always writable. */
export function localUploadsDir() {
  return path.join(os.tmpdir(), "unison-uploads");
}

/**
 * Storage abstraction: uses Vercel Blob in production (when a token is
 * configured) and otherwise writes into the OS temp directory, served back
 * through /api/uploads/[filename]. This works without any cloud storage
 * account, but files do not survive a container restart/redeploy — for
 * production durability, configure Vercel Blob or an S3-compatible bucket.
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

  const uploadsDir = localUploadsDir();
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/api/uploads/${filename}`, kind: validation.kind };
}
