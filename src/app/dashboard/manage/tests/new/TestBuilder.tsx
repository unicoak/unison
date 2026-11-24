"use client";

import { useActionState, useRef, useState } from "react";
import { createTestAction, updateTestAction } from "../actions";
import { Label, Input, Textarea, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type XpMode = "NONE" | "PER_QUESTION" | "TOTAL";
type Option = { key: number; id?: string; text: string };
type Question = {
  key: number;
  id?: string;
  imageUrl?: string | null;
  type: "CHOICE" | "TEXT";
  text: string;
  points: number;
  xp: number;
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
  xp: 0,
  options: [newOption(), newOption()],
  correct: 0,
});

export type TestInitial = {
  testId: string;
  title: string;
  description: string;
  hasAttempts: boolean;
  xpMode: XpMode;
  xpTotal: number;
  availableAt: string; // datetime-local value, site time
  questions: {
    id: string;
    type: "CHOICE" | "TEXT";
    text: string;
    points: number;
    xp: number;
    imageUrl: string | null;
    options: { id: string; text: string; isCorrect: boolean }[];
  }[];
};

function fromInitial(init: TestInitial): Question[] {
  return init.questions.map((q) => {
    const options: Option[] = q.options.map((o) => ({ key: nextKey++, id: o.id, text: o.text }));
    while (q.type === "CHOICE" && options.length < 2) options.push(newOption());
    return {
      key: nextKey++,
      id: q.id,
      imageUrl: q.imageUrl,
      type: q.type,
      text: q.text,
      points: q.points,
      xp: q.xp,
      options,
      correct: Math.max(0, q.options.findIndex((o) => o.isCorrect)),
    };
  });
}

export function TestBuilder({
  students = [],
  initial,
}: {
  students?: { id: string; displayName: string }[];
  initial?: TestInitial;
}) {
  const editing = !!initial;
  const [state, formAction, pending] = useActionState(
    initial ? updateTestAction.bind(null, initial.testId) : createTestAction,
    undefined,
  );
  const [questions, setQuestions] = useState<Question[]>(() => (initial ? fromInitial(initial) : [newQuestion()]));
  const [assignToAll, setAssignToAll] = useState(true);
  const [xpMode, setXpMode] = useState<XpMode>(initial?.xpMode ?? "NONE");
  const formRef = useRef<HTMLFormElement>(null);

  const patch = (qi: number, p: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...p } : q)));

  const total = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);
  const totalXp = questions.reduce((s, q) => s + (Number(q.xp) || 0), 0);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <div className="brutal-card flex flex-col gap-4 p-6">
        <div>
          <Label htmlFor="title">Название теста</Label>
          <Input id="title" name="title" required maxLength={120} defaultValue={initial?.title} />
        </div>
        <div>
          <Label htmlFor="description">Описание (необязательно)</Label>
          <Textarea id="description" name="description" className="min-h-20" maxLength={2000} defaultValue={initial?.description} />
        </div>
        <div>
          <Label htmlFor="availableAt">Открыть для учеников (необязательно)</Label>
          <Input id="availableAt" name="availableAt" type="datetime-local" defaultValue={initial?.availableAt} />
          <p className="mt-1 text-xs text-ink-soft">
            Сахалинское время. До этого момента ученики тест не видят; пусто — тест открыт сразу.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Опыт за тест</Label>
          <select
            name="xpMode"
            value={xpMode}
            onChange={(e) => setXpMode(e.target.value as XpMode)}
            className="w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-sm"
          >
            <option value="NONE">Без опыта</option>
            <option value="PER_QUESTION">Опыт за каждый вопрос (задаёте у каждого вопроса)</option>
            <option value="TOTAL">Опыт за весь тест (пропорционально проценту правильных ответов)</option>
          </select>
          {xpMode === "TOTAL" && (
            <div>
              <Label htmlFor="xpTotal">Опыт за тест целиком</Label>
              <Input id="xpTotal" name="xpTotal" type="number" min={0} max={100000} defaultValue={initial?.xpTotal ?? 0} required />
              <p className="mt-1 text-xs text-ink-soft">
                Ученик получит эту сумму, умноженную на долю набранных баллов (80% баллов — 80% опыта).
              </p>
            </div>
          )}
          {xpMode === "PER_QUESTION" && (
            <p className="text-xs text-ink-soft">
              Опыт за вопрос указывается в самом вопросе. За развёрнутый ответ — пропорционально баллам, которые
              поставит учитель.
            </p>
          )}
        </div>
      </div>

      <input type="hidden" name="questionCount" value={questions.length} />

      {questions.map((q, qi) => (
        <div key={q.key} className="brutal-card flex flex-col gap-4 p-6">
          {q.id && <input type="hidden" name={`q-${qi}-id`} value={q.id} />}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-base font-bold">Вопрос {qi + 1}</p>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (q.id && initial?.hasAttempts && !confirm("Удалить вопрос? Ответы учеников на него тоже удалятся, баллы пересчитаются.")) return;
                  setQuestions((qs) => qs.filter((_, i) => i !== qi));
                }}
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
                name={q.id ? undefined : `q-${qi}-type`}
                disabled={!!q.id}
                value={q.type}
                onChange={(e) => patch(qi, { type: e.target.value as Question["type"] })}
                className="w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-sm"
              >
                <option value="CHOICE">С вариантами ответа (проверяется автоматически)</option>
                <option value="TEXT">Развёрнутый ответ (проверяет учитель)</option>
              </select>
            </div>
            {q.id && <input type="hidden" name={`q-${qi}-type`} value={q.type} />}
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
            {xpMode === "PER_QUESTION" && (
              <div>
                <Label htmlFor={`xp-${q.key}`}>Опыт за вопрос</Label>
                <Input
                  id={`xp-${q.key}`}
                  name={`q-${qi}-xp`}
                  type="number"
                  min={0}
                  max={10000}
                  value={q.xp}
                  onChange={(e) => patch(qi, { xp: Number(e.target.value) })}
                  required
                />
              </div>
            )}
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
            <Label htmlFor={`image-${q.key}`}>
              {q.imageUrl ? "Заменить изображение (необязательно)" : "Изображение к вопросу (необязательно)"}
            </Label>
            {q.imageUrl && (
              <div className="mb-2 flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.imageUrl} alt="" className="max-h-32 rounded-xl border border-line" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`q-${qi}-removeImage`} className="h-4 w-4 accent-blue" />
                  убрать изображение
                </label>
              </div>
            )}
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
                  {o.id && <input type="hidden" name={`q-${qi}-optid-${oi}`} value={o.id} />}
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
          {xpMode === "PER_QUESTION" && ` · опыта всего: ${totalXp}`}
        </p>
      </div>

      {!editing && (
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
      )}

      {initial?.hasAttempts && (
        <p className="rounded-xl bg-paper-dim p-3 text-sm text-ink-soft">
          Ученики уже сдавали этот тест. После сохранения их баллы пересчитаются по новым правильным ответам и баллам за
          вопросы; ответы на удалённые вопросы пропадут. Опыт за тест тоже пересчитается: недостающий будет начислен, лишний списан.
        </p>
      )}

      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="self-start">
        {editing ? (pending ? "Сохраняем…" : "Сохранить изменения") : pending ? "Создаём…" : "Создать тест"}
      </Button>
    </form>
  );
}
