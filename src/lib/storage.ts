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

function s3Config() {
  const { S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET } = process.env;
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET) return null;
  return {
    endpoint: S3_ENDPOINT,
    region: process.env.S3_REGION || "ru-1",
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
    bucket: S3_BUCKET,
    publicUrl: (process.env.S3_PUBLIC_URL || `${S3_ENDPOINT}/${S3_BUCKET}`).replace(/\/$/, ""),
  };
}

async function uploadToS3(file: File, key: string): Promise<string> {
  const config = s3Config();
  if (!config) throw new Error("S3 не настроен");

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    }),
  );

  return `${config.publicUrl}/${key}`;
}

/** Directory used by the local-disk fallback (dev only) — the app's own
 * deployed files (e.g. /app/public) are read-only in containerized hosting,
 * but the OS temp directory is always writable. */
function localUploadsDir() {
  return path.join(os.tmpdir(), "unison-uploads");
}

async function uploadToLocalDisk(file: File): Promise<string> {
  const uploadsDir = localUploadsDir();
  await mkdir(uploadsDir, { recursive: true });
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/api/uploads/${filename}`;
}

export { localUploadsDir };

/**
 * Storage abstraction: uploads to an S3-compatible bucket (Timeweb S3,
 * or any other S3-compatible provider) when configured. Falls back to
 * writing into the OS temp dir for local development without any cloud
 * account — that fallback does not survive a restart/redeploy and should
 * never be relied on in production.
 */
export async function storeFile(file: File): Promise<{ url: string; kind: AttachmentKind }> {
  const validation = validateFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const ext = file.name.split(".").pop() || "bin";
  const key = `uploads/${randomUUID()}.${ext}`;

  const url = s3Config() ? await uploadToS3(file, key) : await uploadToLocalDisk(file);

  return { url, kind: validation.kind };
}
