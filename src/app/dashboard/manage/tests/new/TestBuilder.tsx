"use client";

import { useActionState, useRef, useState } from "react";
import { createTestAction } from "../actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type Option = { key: number; text: string };
type Question = {
  key: number;
  type: "CHOICE" | "TEXT";
  text: string;
  points: number;
  options: Option[];
  correct: number;
};

let nextKey = 1;
const newOption = (): Option => ({ key: nextKey++, text: "" });
const newQuestion = (): Question => ({
  key: nextKey++,
  type: "CHOICE",
  text: "",
  points: 1,
  options: [newOption(), newOption()],
  correct: 0,
});

export function TestBuilder({ students }: { students: { id: string; displayName: string }[] }) {
  const [state, formAction, pending] = useActionState(createTestAction, undefined);
  const [questions, setQuestions] = useState<Question[]>(() => [newQuestion()]);
  const [assignToAll, setAssignToAll] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  const patch = (qi: number, p: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...p } : q)));

  const total = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <div className="brutal-card flex flex-col gap-4 p-6">
        <div>
          <Label htmlFor="title">Название теста</Label>
          <Input id="title" name="title" required maxLength={120} />
        </div>
        <div>
          <Label htmlFor="description">Описание (необязательно)</Label>
          <Textarea id="description" name="description" className="min-h-20" maxLength={2000} />
        </div>
      </div>

      <input type="hidden" name="questionCount" value={questions.length} />

      {questions.map((q, qi) => (
        <div key={q.key} className="brutal-card flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-base font-bold">Вопрос {qi + 1}</p>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                className="text-xs font-semibold text-coral hover:underline"
              >
                удалить вопрос
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor={`type-${q.key}`}>Тип ответа</Label>
              <select
                id={`type-${q.key}`}
                name={`q-${qi}-type`}
                value={q.type}
                onChange={(e) => patch(qi, { type: e.target.value as Question["type"] })}
                className="w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-sm"
              >
                <option value="CHOICE">С вариантами ответа (проверяется автоматически)</option>
                <option value="TEXT">Развёрнутый ответ (проверяет учитель)</option>
              </select>
            </div>
            <div>
              <Label htmlFor={`points-${q.key}`}>Баллов за вопрос</Label>
              <Input
                id={`points-${q.key}`}
                name={`q-${qi}-points`}
                type="number"
                min={0}
                max={1000}
                value={q.points}
                onChange={(e) => patch(qi, { points: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`text-${q.key}`}>Текст вопроса</Label>
            <Textarea
              id={`text-${q.key}`}
              name={`q-${qi}-text`}
              value={q.text}
              onChange={(e) => patch(qi, { text: e.target.value })}
              className="min-h-20"
              maxLength={2000}
              required
            />
          </div>

          <div>
            <Label htmlFor={`image-${q.key}`}>Изображение к вопросу (необязательно)</Label>
            <input
              id={`image-${q.key}`}
              name={`q-${qi}-image`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full rounded-xl border-2 border-dashed border-ink bg-white px-4 py-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blue file:px-4 file:py-1.5 file:font-display file:text-xs file:font-semibold file:text-white"
            />
          </div>

          {q.type === "CHOICE" ? (
            <div className="flex flex-col gap-2">
              <input type="hidden" name={`q-${qi}-optionCount`} value={q.options.length} />
              <Label>Варианты ответа (отметьте правильный)</Label>
              {q.options.map((o, oi) => (
                <div key={o.key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${qi}-correct`}
                    value={oi}
                    checked={q.correct === oi}
                    onChange={() => patch(qi, { correct: oi })}
                    className="h-5 w-5 shrink-0 accent-blue"
                    aria-label={`Вариант ${oi + 1} правильный`}
                  />
                  <Input
                    name={`q-${qi}-opt-${oi}`}
                    value={o.text}
                    onChange={(e) =>
                      patch(qi, { options: q.options.map((x) => (x.key === o.key ? { ...x, text: e.target.value } : x)) })
                    }
                    placeholder={`Вариант ${oi + 1}`}
                    maxLength={500}
                    className="py-2"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        patch(qi, {
                          options: q.options.filter((x) => x.key !== o.key),
                          correct: q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct,
                        })
                      }
                      className="shrink-0 text-xs font-semibold text-coral hover:underline"
                    >
                      убрать
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 10 && (
                <button
                  type="button"
                  onClick={() => patch(qi, { options: [...q.options, newOption()] })}
                  className="self-start text-xs font-semibold text-blue hover:underline"
                >
                  + вариант
                </button>
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-paper-dim p-3 text-sm text-ink-soft">
              Ученик напишет ответ текстом. После сдачи вы проверите его вручную и поставите баллы.
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" disabled={questions.length >= 50} onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
          + Добавить вопрос
        </Button>
        <p className="text-sm font-semibold text-ink-soft">
          Вопросов: {questions.length} · максимум баллов: {total}
        </p>
      </div>

      <div className="brutal-card flex flex-col gap-3 p-6">
        <label className="flex items-center gap-2 font-display text-sm font-semibold">
          <input
            type="checkbox"
            name="assignToAll"
            checked={assignToAll}
            onChange={(e) => setAssignToAll(e.target.checked)}
            className="h-5 w-5 accent-blue"
          />
          Выдать всем ученикам
        </label>
        {!assignToAll && (
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-xl border-2 border-ink p-3">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="assigneeIds" value={s.id} className="h-4 w-4 accent-blue" />
                {s.displayName}
              </label>
            ))}
            {students.length === 0 && <p className="text-sm text-ink-soft">Пока нет учеников</p>}
          </div>
        )}
      </div>

      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Создаём…" : "Создать тест"}
      </Button>
    </form>
  );
}
