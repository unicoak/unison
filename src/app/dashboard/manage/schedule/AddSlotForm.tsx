"use client";

import { useActionState } from "react";
import { createScheduleSlotAction } from "./actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DAY_LABELS } from "@/lib/labels";

export function AddSlotForm() {
  const [state, formAction, pending] = useActionState(createScheduleSlotAction, undefined);

  return (
    <form action={formAction} className="brutal-card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-6">
      <div>
        <Label htmlFor="dayOfWeek">День</Label>
        <select id="dayOfWeek" name="dayOfWeek" className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm" defaultValue="1">
          {DAY_LABELS.slice(1).map((label, i) => (
            <option key={label} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="startTime">Начало</Label>
        <Input id="startTime" name="startTime" type="time" defaultValue="09:00" required />
      </div>
      <div>
        <Label htmlFor="endTime">Конец</Label>
        <Input id="endTime" name="endTime" type="time" defaultValue="09:45" required />
      </div>
      <div className="sm:col-span-2 lg:col-span-2">
        <Label htmlFor="subject">Предмет</Label>
        <Input id="subject" name="subject" placeholder="Например: Python" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "…" : "Добавить"}
        </Button>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="location">Место / ссылка</Label>
        <Input id="location" name="location" placeholder="Каб. 204 или Zoom-ссылка" />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="note">Заметка</Label>
        <Input id="note" name="note" placeholder="Необязательно" />
      </div>
      <div className="lg:col-span-6">
        <FieldError>{state?.error}</FieldError>
      </div>
    </form>
  );
}
