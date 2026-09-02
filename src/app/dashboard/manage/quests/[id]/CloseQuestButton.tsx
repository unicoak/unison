import { closeQuestAction } from "../actions";

export function CloseQuestButton({ questId }: { questId: string }) {
  const close = closeQuestAction.bind(null, questId);
  return (
    <form action={close}>
      <button
        type="submit"
        className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-semibold hover:bg-paper-dim"
      >
        Закрыть квест
      </button>
    </form>
  );
}
