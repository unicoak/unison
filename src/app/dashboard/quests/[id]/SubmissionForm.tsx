"use client";

import { useActionState, useState } from "react";
import { submitQuestAction } from "../actions";
import { Label, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

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

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-4 p-6">
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
      </div>

      <FieldError>{state?.error}</FieldError>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Отправляем…" : isResubmission ? "Отправить снова" : "Сдать квест"}
      </Button>
    </form>
  );
}
