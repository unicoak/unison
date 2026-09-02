"use client";

import { useActionState } from "react";
import { createCurriculumSectionAction } from "./actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function CurriculumForm() {
  const [state, formAction, pending] = useActionState(createCurriculumSectionAction, undefined);

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <p className="font-display text-sm font-bold">Добавить раздел плана</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="order">№ по порядку</Label>
          <Input id="order" name="order" type="number" defaultValue={1} required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="period">Период</Label>
          <Input id="period" name="period" placeholder="Например: Сентябрь / Модуль 1" required />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Название темы</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="resources">Материалы (по одному на строку: Название | https://ссылка)</Label>
        <Textarea id="resources" name="resources" className="min-h-16" placeholder="Слайды | https://..." />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "…" : "Добавить"}
      </Button>
    </form>
  );
}
