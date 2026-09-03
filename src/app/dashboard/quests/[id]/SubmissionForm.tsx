"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { submitQuestAction } from "../actions";
import { Label, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.8;

/** Downscales/re-encodes photos in the browser so phone photos (5-10MB+)
 * clear hosting proxies with tight request body limits. Videos and formats
 * the browser can't decode are passed through untouched. */
async function compressImageIfPossible(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^./]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function SubmissionForm({
  questId,
  initial,
  isResubmission,
}: {
  questId: string;
  initial: { textContent: string; links: string[] };
  isResubmission: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitQuestAction, undefined);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [preparing, setPreparing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length > 0) {
      setPreparing(true);
      formData.delete("files");
      const processed = await Promise.all(files.map(compressImageIfPossible));
      processed.forEach((file) => formData.append("files", file));
      setPreparing(false);
    }

    formAction(formData);
  }

  const busy = pending || preparing;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="brutal-card flex flex-col gap-4 p-6">
      <input type="hidden" name="questId" value={questId} />

      <p className="font-display text-lg font-bold">
        {isResubmission ? "Пересдать квест" : "Сдать квест"}
      </p>

      <div>
        <Label htmlFor="textContent">Текст ответа</Label>
        <Textarea
          id="textContent"
          name="textContent"
          defaultValue={initial.textContent}
          placeholder="Опиши, что сделал(а)…"
        />
      </div>

      <div>
        <Label htmlFor="links">Ссылки (по одной на строку)</Label>
        <Textarea
          id="links"
          name="links"
          defaultValue={initial.links.join("\n")}
          placeholder="https://..."
          className="min-h-20"
        />
      </div>

      <div>
        <Label htmlFor="files">Файлы (фото / видео)</Label>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
          className="block w-full rounded-xl border-2 border-dashed border-ink bg-white px-4 py-6 text-sm file:mr-3 file:rounded-lg file:border-2 file:border-ink file:bg-lime file:px-3 file:py-1.5 file:font-display file:text-xs file:font-semibold"
        />
        {fileNames.length > 0 && (
          <p className="mt-1.5 text-xs text-ink-soft">Выбрано: {fileNames.join(", ")}</p>
        )}
        <p className="mt-1.5 text-xs text-ink-soft">
          Видео большого размера может не пройти — если не получится, попробуйте прислать ссылку на облако вместо файла.
        </p>
      </div>

      <FieldError>{state?.error}</FieldError>

      <Button type="submit" disabled={busy} className="self-start">
        {preparing ? "Готовим фото…" : pending ? "Отправляем…" : isResubmission ? "Отправить снова" : "Сдать квест"}
      </Button>
    </form>
  );
}
