export function XpBar({
  level,
  title,
  xp,
  xpIntoLevel,
  xpForNextLevel,
  progressPercent,
  isMaxLevel,
}: {
  level: number;
  title: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressPercent: number;
  isMaxLevel: boolean;
}) {
  return (
    <div className="brutal-card p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-ink-soft">Уровень {level}</p>
          <p className="font-display text-2xl font-bold leading-tight">{title}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold text-violet">{xp}</p>
          <p className="text-xs font-semibold text-ink-soft">всего XP</p>
        </div>
      </div>

      <div className="relative h-6 w-full overflow-hidden rounded-full border-2 border-ink bg-paper-dim">
        <div
          className="xp-bar-fill h-full rounded-full bg-gradient-to-r from-lime to-sky"
          style={{ width: `${progressPercent}%` }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-2.5 w-px bg-ink/15" />
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs font-semibold text-ink-soft">
        {isMaxLevel ? (
          <span>Максимальный уровень достигнут 🏆</span>
        ) : (
          <>
            <span>{xpIntoLevel} XP</span>
            <span>до след. уровня: {xpForNextLevel} XP</span>
          </>
        )}
      </div>
    </div>
  );
}
