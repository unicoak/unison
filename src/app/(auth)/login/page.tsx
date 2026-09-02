"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { Label, Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="brutal-card p-7">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">С возвращением</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Вход</h1>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="you@school.ru" required autoFocus />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        <FieldError>{state?.error}</FieldError>

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Входим…" : "Войти"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-violet underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
