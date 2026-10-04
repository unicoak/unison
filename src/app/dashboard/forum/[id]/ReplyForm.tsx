"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPostAction } from "../actions";
import { Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function ReplyForm({ topicId }: { topicId: string }) {
  const [state, formAction, pending] = useActionState(createPostAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="brutal-card flex flex-col gap-3 p-5">
      <input type="hidden" name="topicId" value={topicId} />
      <Textarea name="body" placeholder="Ваше сообщение…" maxLength={4000} className="min-h-24" required />
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "…" : "Ответить"}
      </Button>
    </form>
  );
}
