"use client";

import { useActionState } from "react";
import { createTopicAction } from "../actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function NewTopicForm() {
  const [state, formAction, pending] = useActionState(createTopicAction, undefined);
  return (
    <form action={formAction} className="brutal-card flex flex-col gap-4 p-6">
      <div>
        <Label htmlFor="title">Заголовок</Label>
        <Input id="title" name="title" maxLength={120} required />
      </div>
      <div>
        <Label htmlFor="body">Сообщение</Label>
        <Textarea id="body" name="body" maxLength={4000} required />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Создаём…" : "Создать тему"}
      </Button>
    </form>
  );
}
