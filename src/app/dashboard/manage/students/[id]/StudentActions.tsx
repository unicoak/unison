"use client";

import { useActionState } from "react";
import { manualXpAction, awardAchievementAction } from "../actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function ManualXpForm({ studentId }: { studentId: string }) {
  const [state, formAction, pending] = useActionState(manualXpAction, undefined);

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <input type="hidden" name="studentId" value={studentId} />
      <p className="font-display text-sm font-bold">Начислить / списать XP</p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="amount">Сумма (можно отрицательную)</Label>
          <Input id="amount" name="amount" type="number" defaultValue={10} required />
        </div>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "…" : "Применить"}
        </Button>
      </div>
      <Input name="reason" placeholder="Причина (необязательно)" />
      <FieldError>{state?.error}</FieldError>
      {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
    </form>
  );
}

export function AwardAchievementForm({
  studentId,
  achievements,
}: {
  studentId: string;
  achievements: { id: string; name: string; icon: string }[];
}) {
  const [state, formAction, pending] = useActionState(awardAchievementAction, undefined);

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <input type="hidden" name="studentId" value={studentId} />
      <p className="font-display text-sm font-bold">Вручить ачивку</p>

      {achievements.length === 0 ? (
        <p className="text-sm text-ink-soft">Все ачивки уже получены 🎉</p>
      ) : (
        <div className="flex items-end gap-3">
          <select
            name="achievementId"
            required
            className="flex-1 rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm"
          >
            {achievements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={pending} size="sm" variant="violet">
            {pending ? "…" : "Вручить"}
          </Button>
        </div>
      )}

      <FieldError>{state?.error}</FieldError>
      {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
    </form>
  );
}
