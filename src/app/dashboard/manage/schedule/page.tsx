import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { DAY_LABELS } from "@/lib/labels";
import { AddSlotForm } from "./AddSlotForm";
import { DeleteSlotButton } from "./DeleteSlotButton";

export default async function ManageSchedulePage() {
  await requireStaff();

  const slots = await prisma.scheduleSlot.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  const byDay = Array.from({ length: 7 }, (_, i) => slots.filter((s) => s.dayOfWeek === i + 1));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Расписание</h1>
      <AddSlotForm />

      <div className="grid gap-4 md:grid-cols-7">
        {byDay.map((daySlots, i) => (
          <div key={i} className="flex flex-col gap-2">
            <p className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 text-center font-display text-sm font-bold text-white">
              {DAY_LABELS[i + 1]}
            </p>
            {daySlots.length === 0 ? (
              <p className="rounded-lg border-2 border-dashed border-ink/30 p-3 text-center text-xs text-ink-soft">—</p>
            ) : (
              daySlots.map((s) => (
                <div key={s.id} className="brutal-card p-3">
                  <p className="font-display text-xs font-bold text-violet">
                    {s.startTime}–{s.endTime}
                  </p>
                  <p className="mt-0.5 font-display text-sm font-bold">{s.subject}</p>
                  {s.location && <p className="text-xs text-ink-soft">{s.location}</p>}
                  <div className="mt-1.5">
                    <DeleteSlotButton slotId={s.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
