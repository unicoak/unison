"use client";

import { useActionState } from "react";
import { submitTestAction } from "../actions";
import { Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export type TakeQuestion = {
  id: string;
  type: "CHOICE" | "TEXT";
  text: string;
  imageUrl: string | null;
  points: number;
  options: { id: string; text: string }[];
};

export function TakeTestForm({ testId, questions }: { testId: string; questions: TakeQuestion[] }) {
  const [state, formAction, pending] = useActionState(submitTestAction, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Отправить ответы? Изменить их после отправки будет нельзя.")) e.preventDefault();
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="testId" value={testId} />

      {questions.map((q, i) => (
        <div key={q.id} className="brutal-card flex flex-col gap-3 p-6">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">
            Вопрос {i + 1} · {q.points} б.
          </p>
          <p className="whitespace-pre-wrap text-lg font-semibold">{q.text}</p>
          {q.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.imageUrl} alt="" className="max-h-96 max-w-full rounded-xl border border-line" />
          )}

          {q.type === "CHOICE" ? (
            <div className="flex flex-col gap-2">
              {q.options.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-ink bg-white px-4 py-3 text-sm has-[:checked]:border-blue has-[:checked]:bg-blue/10">
                  <input type="radio" name={`answer-${q.id}`} value={o.id} className="h-5 w-5 accent-blue" />
                  {o.text}
                </label>
              ))}
            </div>
          ) : (
            <Textarea name={`answer-${q.id}`} placeholder="Ваш ответ…" maxLength={4000} />
          )}
        </div>
      ))}

      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Отправляем…" : "Отправить ответы"}
      </Button>
    </form>
  );
}
