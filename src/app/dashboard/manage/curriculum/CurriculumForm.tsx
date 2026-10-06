"use client";

import { useActionState } from "react";
import { createCurriculumSectionAction, updateCurriculumSectionAction } from "./actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function CurriculumForm() {
  const [state, formAction, pending] = useActionState(createCurriculumSectionAction, undefined);

  return (
    <form action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <p className="font-display text-sm font-bold">Добавить раздел плана</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="number">№ по порядку</Label>
          <Input id="number" name="number" inputMode="decimal" defaultValue="1" placeholder="1 или 1.2" maxLength={30} required />
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

export type EditableSection = {
  id: string;
  number: string;
  period: string;
  title: string;
  description: string;
  resources: string;
};

export function EditCurriculumForm({ section }: { section: EditableSection }) {
  const [state, formAction, pending] = useActionState(updateCurriculumSectionAction, undefined);
  const p = section.id;

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3 border-t-2 border-ink/10 pt-3">
      <input type="hidden" name="id" value={section.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`number-${p}`}>№ по порядку</Label>
          <Input id={`number-${p}`} name="number" inputMode="decimal" defaultValue={section.number} placeholder="1 или 1.2" maxLength={30} required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`period-${p}`}>Период</Label>
          <Input id={`period-${p}`} name="period" defaultValue={section.period} required />
        </div>
      </div>
      <div>
        <Label htmlFor={`title-${p}`}>Название темы</Label>
        <Input id={`title-${p}`} name="title" defaultValue={section.title} required />
      </div>
      <div>
        <Label htmlFor={`description-${p}`}>Описание</Label>
        <Textarea id={`description-${p}`} name="description" defaultValue={section.description} required />
      </div>
      <div>
        <Label htmlFor={`resources-${p}`}>Материалы (по одному на строку: Название | https://ссылка)</Label>
        <Textarea id={`resources-${p}`} name="resources" className="min-h-16" defaultValue={section.resources} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} size="sm" variant="violet">
          {pending ? "…" : "Сохранить"}
        </Button>
        <FieldError>{state?.error}</FieldError>
        {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      </div>
    </form>
  );
}
