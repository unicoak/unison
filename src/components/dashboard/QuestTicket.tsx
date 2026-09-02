import Link from "next/link";

function formatDue(dueAt: Date | null) {
  if (!dueAt) return null;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(dueAt);
}

export function QuestTicket({
  href,
  title,
  xpReward,
  dueAt,
  statusSlot,
}: {
  href: string;
  title: string;
  xpReward: number;
  dueAt: Date | null;
  statusSlot?: React.ReactNode;
}) {
  const due = formatDue(dueAt);

  return (
    <Link href={href} className="brutal-card relative flex items-center gap-4 overflow-hidden p-4">
      <div
        className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-ink bg-paper"
        aria-hidden
      />
      <div
        className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-ink bg-paper"
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold">{title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
          <span className="rounded-full bg-violet/10 px-2 py-0.5 text-violet">+{xpReward} XP</span>
          {due && <span>дедлайн: {due}</span>}
        </div>
      </div>

      {statusSlot}
    </Link>
  );
}
