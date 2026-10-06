export type XpHistoryItem = {
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
  /** Total XP right after this entry (omitted when not known). */
  balance?: number;
};

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Sakhalin",
});

export function XpHistoryList({ items }: { items: XpHistoryItem[] }) {
  if (items.length === 0) return <p className="brutal-card p-5 text-sm text-ink-soft">Пока нет начислений.</p>;

  return (
    <div className="flex flex-col gap-2">
      {items.map((e) => (
        <div key={e.id} className="brutal-card flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold">{e.reason}</p>
            <p className="text-xs text-ink-soft">{e.createdAt.getFullYear() <= 2020 ? "раньше" : dateFmt.format(e.createdAt)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-display text-lg font-extrabold ${e.amount >= 0 ? "text-blue" : "text-coral"}`}>
              {e.amount > 0 ? `+${e.amount}` : e.amount} XP
            </p>
            {e.balance !== undefined && <p className="text-xs text-ink-soft">всего {e.balance}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
