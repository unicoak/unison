"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStudentAction } from "../actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function NewStudentForm() {
  const [state, formAction, pending] = useActionState(createStudentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="brutal-card flex max-w-xl flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Имя</Label>
          <Input id="firstName" name="firstName" maxLength={40} required autoFocus />
        </div>
        <div>
          <Label htmlFor="lastName">Фамилия</Label>
          <Input id="lastName" name="lastName" maxLength={40} required />
        </div>
      </div>
      <div>
        <Label htmlFor="username">Никнейм (логин для входа)</Label>
        <Input
          id="username"
          name="username"
          placeholder="например: ivan_petrov"
          autoCapitalize="none"
          autoComplete="off"
          maxLength={30}
          required
        />
        <p className="mt-1.5 text-xs text-ink-soft">Латиница, цифры и . _ -, от 3 до 30 символов. Регистр не важен.</p>
      </div>
      <div>
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="text" autoComplete="off" minLength={6} maxLength={100} required />
        <p className="mt-1.5 text-xs text-ink-soft">
          Минимум 6 символов. Передайте ученику логин и пароль: потом пароль сбросить может только бог.
        </p>
      </div>
      <FieldError>{state?.error}</FieldError>
      {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Создаём…" : "Создать ученика"}
      </Button>
    </form>
  );
}
