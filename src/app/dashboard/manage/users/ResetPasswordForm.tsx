"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "./actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-semibold hover:bg-paper-dim"
      >
        Сбросить пароль
      </button>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-2 sm:w-auto">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor={`password-${userId}`}>Новый пароль</Label>
          <Input id={`password-${userId}`} name="password" type="text" placeholder="Минимум 6 символов" required />
        </div>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "…" : "Сохранить"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Отмена
        </Button>
      </div>
      <FieldError>{state?.error}</FieldError>
      {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
    </form>
  );
}
