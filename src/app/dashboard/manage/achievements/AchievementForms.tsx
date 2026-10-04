"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAchievementAction, updateAchievementAction } from "./actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type Achievement = { id: string; name: string; description: string; icon: string };

function Fields({ a }: { a?: Achievement }) {
  const p = a?.id ?? "new";
  return (
    <>
      <div>
        <Label htmlFor={`icon-${p}`}>Иконка</Label>
        <Input id={`icon-${p}`} name="icon" defaultValue={a?.icon} placeholder="🏆" maxLength={8} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`name-${p}`}>Название</Label>
        <Input id={`name-${p}`} name="name" defaultValue={a?.name} placeholder="Например: Первая кровь" required />
      </div>
      <div className="sm:col-span-3">
        <Label htmlFor={`description-${p}`}>Описание</Label>
        <Input id={`description-${p}`} name="description" defaultValue={a?.description} placeholder="За что выдаётся" required />
      </div>
    </>
  );
}

export function CreateAchievementForm() {
  const [state, formAction, pending] = useActionState(createAchievementAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={formAction} className="brutal-card grid gap-3 p-5 sm:grid-cols-4">
      <p className="font-display text-sm font-bold sm:col-span-4">Новая ачивка</p>
      <Fields />
      <div className="flex items-center gap-3 sm:col-span-4">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "…" : "Создать"}
        </Button>
        <FieldError>{state?.error}</FieldError>
        {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      </div>
    </form>
  );
}

export function EditAchievementForm({ achievement }: { achievement: Achievement }) {
  const [state, formAction, pending] = useActionState(updateAchievementAction, undefined);
  return (
    <form action={formAction} className="mt-3 grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="id" value={achievement.id} />
      <Fields a={achievement} />
      <div className="flex items-center gap-3 sm:col-span-4">
        <Button type="submit" disabled={pending} size="sm" variant="violet">
          {pending ? "…" : "Сохранить"}
        </Button>
        <FieldError>{state?.error}</FieldError>
        {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      </div>
    </form>
  );
}
