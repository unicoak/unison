import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(d);
}

export default async function AchievementsPage() {
  const session = await requireRole(["STUDENT"]);

  const [achievements, earned] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId: session.user.id } }),
  ]);

  const earnedMap = new Map(earned.map((e) => [e.achievementId, e.awardedAt]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Ачивки</h1>
        <p className="mt-1 text-ink-soft">
          Получено {earned.length} из {achievements.length}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a) => {
          const awardedAt = earnedMap.get(a.id);
          const isEarned = !!awardedAt;
          return (
            <div
              key={a.id}
              className={`sticker brutal-card flex flex-col items-center gap-2 p-5 text-center ${
                isEarned ? "bg-white" : "bg-paper-dim opacity-60 grayscale"
              }`}
            >
              <span className="text-4xl">{a.icon}</span>
              <p className="font-display text-sm font-bold">{a.name}</p>
              <p className="text-xs text-ink-soft">{a.description}</p>
              {isEarned && awardedAt && (
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-violet">
                  получено {formatDate(awardedAt)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <p className="brutal-card p-6 text-sm text-ink-soft">Ачивок пока нет — учитель их скоро добавит.</p>
      )}
    </div>
  );
}
