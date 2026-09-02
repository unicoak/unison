import { deleteScheduleSlotAction } from "./actions";

export function DeleteSlotButton({ slotId }: { slotId: string }) {
  const action = deleteScheduleSlotAction.bind(null, slotId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs font-semibold text-coral hover:underline">
        удалить
      </button>
    </form>
  );
}
