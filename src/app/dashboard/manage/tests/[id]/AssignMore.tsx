"use client";

import { useActionState } from "react";
import { assignTestAction } from "../actions";
import { FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function AssignMore({ testId, students }: { testId: string; students: { id: string; displayName: string }[] }) {
  const [state, formAction, pending] = useActionState(assignTestAction, undefined);
  if (students.length === 0) return null;

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <input type="hidden" name="testId" value={testId} />
      <p className="font-display text-sm font-bold">Выдать ещё ученикам</p>
      <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-xl border-2 border-ink p-3">
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
        {pending ? "…" : "Выдать"}
      </Button>
    </form>
  );
}
