"use client";

import { useActionState } from "react";
import { gradeAttemptAction } from "../actions";
import { Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export type GradeAnswer = {
  id: string;
  questionText: string;
  maxPoints: number;
  textAnswer: string;
  pointsAwarded: number | null;
  teacherComment: string;
};

export function GradePanel({ attemptId, answers }: { attemptId: string; answers: GradeAnswer[] }) {
  const [state, formAction, pending] = useActionState(gradeAttemptAction, undefined);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      {answers.map((a) => (
        <div key={a.id} className="rounded-xl bg-paper-dim p-3">
          <p className="text-xs font-semibold text-ink-soft">{a.questionText}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm">
            {a.textAnswer || <span className="text-ink-soft">— ответ не дан —</span>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Input
              name={`points-${a.id}`}
              type="number"
              min={0}
              max={a.maxPoints}
              defaultValue={a.pointsAwarded ?? 0}
              required
              className="w-24 py-2"
              aria-label="Баллы"
            />
            <span className="text-xs font-semibold text-ink-soft">из {a.maxPoints}</span>
            <Input name={`comment-${a.id}`} defaultValue={a.teacherComment} placeholder="Комментарий (необязательно)" className="min-w-48 flex-1 py-2" />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "…" : "Сохранить оценку"}
        </Button>
        <FieldError>{state?.error}</FieldError>
        {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      </div>
    </form>
  );
}
