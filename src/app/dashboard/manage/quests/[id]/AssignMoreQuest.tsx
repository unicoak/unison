"use client";

import { useActionState, useRef } from "react";
import { assignQuestAction } from "../actions";
import { FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function AssignMoreQuest({ questId, students }: { questId: string; students: { id: string; displayName: string }[] }) {
  const [state, formAction, pending] = useActionState(assignQuestAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  if (students.length === 0) {
    return <p className="brutal-card p-5 text-sm text-ink-soft">Квест уже назначен всем ученикам.</p>;
  }

  const setAll = (checked: boolean) =>
    formRef.current?.querySelectorAll<HTMLInputElement>('input[name="studentIds"]').forEach((i) => (i.checked = checked));

  return (
    <form ref={formRef} action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <input type="hidden" name="questId" value={questId} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-sm font-bold">Назначить другим ученикам</p>
        <div className="flex gap-3 text-xs font-semibold text-blue">
          <button type="button" onClick={() => setAll(true)} className="hover:underline">
            выбрать всех
          </button>
          <button type="button" onClick={() => setAll(false)} className="hover:underline">
            снять
          </button>
        </div>
      </div>
      <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-xl border-2 border-ink p-3">
        {students.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="studentIds" value={s.id} className="h-4 w-4 accent-blue" />
            {s.displayName}
          </label>
        ))}
      </div>
      <FieldError>{state?.error}</FieldError>
      {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "…" : "Назначить"}
      </Button>
    </form>
  );
}
