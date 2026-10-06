"use client";

import { deleteTestAction } from "../actions";

export function DeleteTestButton({ testId }: { testId: string }) {
  const action = deleteTestAction.bind(null, testId);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Удалить тест? Все ответы и оценки учеников по нему будут удалены без возможности восстановления.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full bg-white px-3 py-1 font-display text-xs font-semibold text-coral ring-1 ring-line hover:bg-paper-dim"
      >
        Удалить тест
      </button>
    </form>
  );
}
