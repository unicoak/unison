"use client";

import { deleteQuestAction } from "../actions";

export function DeleteQuestButton({ questId }: { questId: string }) {
  const action = deleteQuestAction.bind(null, questId);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Удалить квест? Все сдачи учеников по нему будут удалены без возможности восстановления.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-semibold text-coral hover:bg-paper-dim"
      >
        Удалить
      </button>
    </form>
  );
}
