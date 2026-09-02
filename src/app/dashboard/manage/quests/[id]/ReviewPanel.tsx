"use client";

import { useActionState } from "react";
import { reviewSubmissionAction } from "../actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function ReviewPanel({ submissionId, defaultXp }: { submissionId: string; defaultXp: number }) {
  const [state, formAction, pending] = useActionState(reviewSubmissionAction, undefined);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-ink/20 pt-4">
      <input type="hidden" name="submissionId" value={submissionId} />

      <div>
        <Label htmlFor={`comment-${submissionId}`}>Комментарий (необязательно)</Label>
        <Textarea id={`comment-${submissionId}`} name="teacherComment" className="min-h-16" />
      </div>

      <div className="flex items-end gap-3">
        <div className="w-32">
          <Label htmlFor={`xp-${submissionId}`}>XP за квест</Label>
          <Input id={`xp-${submissionId}`} name="xpOverride" type="number" min={0} defaultValue={defaultXp} />
        </div>
      </div>

      <FieldError>{state?.error}</FieldError>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="decision" value="APPROVED" disabled={pending} variant="primary" size="sm">
          ✅ Принять
        </Button>
        <Button type="submit" name="decision" value="NEEDS_REVISION" disabled={pending} variant="ghost" size="sm">
          🔁 На доработку
        </Button>
        <Button type="submit" name="decision" value="REJECTED" disabled={pending} variant="coral" size="sm">
          ✕ Отклонить
        </Button>
      </div>
    </form>
  );
}
