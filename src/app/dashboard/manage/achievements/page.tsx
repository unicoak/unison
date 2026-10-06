import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { CreateAchievementForm, EditAchievementForm } from "./AchievementForms";

export default async function ManageAchievementsPage() {
  await requireStaff();

  const achievements = await prisma.achievement.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { awardedTo: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Ачивки</h1>
      <CreateAchievementForm />

      <div className="flex flex-col gap-3">
        {achievements.map((a) => (
          <details key={a.id} className="brutal-card p-4">
            <summary className="flex cursor-pointer items-center gap-3">
              <span className="text-3xl">{a.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold">
                  {a.name}
                  {a.secret && <span className="ml-2 text-xs font-semibold text-violet">🔒 секретная</span>}
                </p>
                <p className="truncate text-xs text-ink-soft">{a.description}</p>
              </div>
              <span className="text-xs font-semibold text-ink-soft">выдана: {a._count.awardedTo}</span>
            </summary>
            <EditAchievementForm achievement={a} />
          </details>
        ))}
      </div>
    </div>
  );
}
