"use client";

import { useActionState, useState } from "react";
import { saveLevelsAction } from "./actions";
import { Input, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type Row = { title: string; requiredXp: number };

export function LevelsEditor({ initial }: { initial: Row[] }) {
  const [state, formAction, pending] = useActionState(saveLevelsAction, undefined);
  const [rows, setRows] = useState<Row[]>(initial);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addLevel = () =>
    setRows((rs) => {
      const last = rs[rs.length - 1];
      return [...rs, { title: "", requiredXp: (last?.requiredXp ?? 0) + 100 }];
    });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="brutal-card overflow-x-auto p-0">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-display text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Уровень</th>
              <th className="px-4 py-3">Звание</th>
              <th className="px-4 py-3">Всего XP для уровня</th>
              <th className="px-4 py-3">До следующего</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const next = rows[i + 1];
              const delta = next ? next.requiredXp - r.requiredXp : null;
              return (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-display font-extrabold text-blue">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Input
                      name="title"
                      value={r.title}
                      onChange={(e) => update(i, { title: e.target.value })}
                      maxLength={40}
                      required
                      className="py-2"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      name="requiredXp"
                      type="number"
                      min={0}
                      value={r.requiredXp}
                      onChange={(e) => update(i, { requiredXp: Number(e.target.value) })}
                      readOnly={i === 0}
                      required
                      className="w-32 py-2"
                    />
                  </td>
                  <td className="px-4 py-2 font-semibold text-ink-soft">
                    {delta === null ? "максимальный" : delta > 0 ? `+${delta} XP` : "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {i === rows.length - 1 && rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRows((rs) => rs.slice(0, -1))}
                        className="text-xs font-semibold text-coral hover:underline"
                      >
                        удалить
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={addLevel} disabled={rows.length >= 50}>
          + Добавить уровень
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить"}
        </Button>
        <FieldError>{state?.error}</FieldError>
        {state?.success && <p className="text-sm font-semibold text-violet">{state.success}</p>}
      </div>
    </form>
  );
}
