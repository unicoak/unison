"use client";

import { useActionState, useState } from "react";
import { createQuestAction } from "../actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function NewQuestForm({ students }: { students: { id: string; displayName: string }[] }) {
  const [state, formAction, pending] = useActionState(createQuestAction, undefined);
  const [assignToAll, setAssignToAll] = useState(true);

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-4 p-6">
      <div>
        <Label htmlFor="title">Название</Label>
        <Input id="title" name="title" placeholder="Например: Разбор алгоритма сортировки" required />
      </div>

      <div>
        <Label htmlFor="description">Описание задания</Label>
        <Textarea id="description" name="description" placeholder="Что нужно сделать…" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="xpReward">Награда, XP</Label>
          <Input id="xpReward" name="xpReward" type="number" min={0} defaultValue={50} required />
        </div>
        <div>
          <Label htmlFor="dueAt">Дедлайн</Label>
          <Input id="dueAt" name="dueAt" type="date" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 font-display text-sm font-semibold">
          <input
            type="checkbox"
            name="assignToAll"
            defaultChecked
            onChange={(e) => setAssignToAll(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-ink accent-lime"
          />
          Назначить всем ученикам
        </label>
      </div>

      {!assignToAll && (
        <div>
          <Label>Кому назначить</Label>
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-xl border-2 border-ink p-3">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="assigneeIds" value={s.id} className="h-4 w-4 accent-violet" />
                {s.displayName}
              </label>
            ))}
            {students.length === 0 && <p className="text-sm text-ink-soft">Пока нет учеников</p>}
          </div>
        </div>
      )}

      <FieldError>{state?.error}</FieldError>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Создаём…" : "Создать квест"}
      </Button>
    </form>
  );
}
