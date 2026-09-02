import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { DAY_LABELS } from "@/lib/labels";

export default async function SchedulePage() {
  await requireSession();

  const slots = await prisma.scheduleSlot.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const byDay = Array.from({ length: 7 }, (_, i) => slots.filter((s) => s.dayOfWeek === i + 1));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Расписание</h1>
        <p className="mt-1 text-ink-soft">Регулярное расписание на учебный год</p>
      </div>

      {slots.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Расписание пока не опубликовано.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-7">
          {byDay.map((daySlots, i) => (
            <div key={i} className="flex flex-col gap-2">
              <p className="sticky top-20 rounded-lg border-2 border-ink bg-ink px-3 py-1.5 text-center font-display text-sm font-bold text-white">
                {DAY_LABELS[i + 1]}
              </p>
              <div className="flex flex-col gap-2">
                {daySlots.length === 0 ? (
                  <p className="rounded-lg border-2 border-dashed border-ink/30 p-3 text-center text-xs text-ink-soft">
                    выходной
                  </p>
                ) : (
                  daySlots.map((s) => (
                    <div key={s.id} className="brutal-card p-3">
                      <p className="font-display text-xs font-bold text-violet">
                        {s.startTime}–{s.endTime}
                      </p>
                      <p className="mt-0.5 font-display text-sm font-bold">{s.subject}</p>
                      {s.location && <p className="text-xs text-ink-soft">{s.location}</p>}
                      {s.note && <p className="text-xs text-ink-soft">{s.note}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
