"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="brutal-card p-7">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Новый ученик</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Регистрация</h1>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="displayName">Имя</Label>
          <Input id="displayName" name="displayName" placeholder="Как к тебе обращаться" required autoFocus />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="you@school.ru" required />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" name="password" type="password" placeholder="Минимум 6 символов" required />
        </div>

        <FieldError>{state?.error}</FieldError>

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Создаём…" : "Создать аккаунт"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-violet underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
