import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getStudentXpSummary } from "@/lib/xp";
import { XpBar } from "@/components/ui/XpBar";
import { Badge } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { ManualXpForm, AwardAchievementForm } from "./StudentActions";

export default async function ManageStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();

  const [student, summary, submissions, allAchievements, earnedAchievementIds] = await Promise.all([
    prisma.user.findUnique({ where: { id, role: "STUDENT" } }),
    getStudentXpSummary(id),
    prisma.questSubmission.findMany({
      where: { studentId: id },
      include: { quest: true },
      orderBy: { submittedAt: "desc" },
      take: 15,
    }),
    prisma.achievement.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId: id }, select: { achievementId: true } }),
  ]);

  if (!student) notFound();

  const earnedSet = new Set(earnedAchievementIds.map((e) => e.achievementId));
  const availableAchievements = allAchievements.filter((a) => !earnedSet.has(a.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{student.displayName}</h1>
        <p className="text-ink-soft">{student.email}</p>
      </div>

      {summary && (
        <XpBar
          level={summary.level}
          title={summary.title}
          xp={summary.xp}
          xpIntoLevel={summary.xpIntoLevel}
          xpForNextLevel={summary.xpForNextLevel}
          progressPercent={summary.progressPercent}
          isMaxLevel={summary.isMaxLevel}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ManualXpForm studentId={id} />
        <AwardAchievementForm studentId={id} achievements={availableAchievements} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">История сдач</h2>
        {submissions.length === 0 ? (
          <p className="brutal-card p-5 text-sm text-ink-soft">Пока нет сдач.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {submissions.map((s) => {
              const status = SUBMISSION_STATUS_LABELS[s.status];
              return (
                <div key={s.id} className="brutal-card flex items-center justify-between gap-3 p-3">
                  <p className="truncate font-display text-sm font-bold">{s.quest.title}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
