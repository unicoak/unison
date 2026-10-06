"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { updateAvatarAction, removeAvatarAction } from "./actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FormField";

const SIZE = 512;

/** Center-crops to a square and shrinks, so phone photos upload quickly. GIFs and
 * formats the browser can't decode are sent as they are. */
async function prepare(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(SIZE, side);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], "avatar.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function AvatarForm({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [state, formAction, pending] = useActionState(updateAvatarAction, undefined);
  const [preparing, setPreparing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const file = data.get("avatar");
    if (!(file instanceof File) || file.size === 0) return formAction(data);

    setPreparing(true);
    data.set("avatar", await prepare(file));
    setPreparing(false);
    formAction(data);
  }

  const busy = pending || preparing;

  return (
    <div className="brutal-card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
      <Avatar name={name} url={preview ?? avatarUrl} size="lg" />
      <div className="flex w-full flex-col gap-3">
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
            className="block w-full rounded-xl border-2 border-dashed border-ink bg-white px-4 py-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blue file:px-4 file:py-1.5 file:font-display file:text-xs file:font-semibold file:text-white"
          />
          <FieldError>{state?.error}</FieldError>
          {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
          <Button type="submit" size="sm" disabled={busy} className="self-start">
            {busy ? "Загружаем…" : "Сохранить фото"}
          </Button>
        </form>
        {avatarUrl && (
          <form action={removeAvatarAction}>
            <button type="submit" className="text-xs font-semibold text-coral hover:underline">
              убрать фото
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
