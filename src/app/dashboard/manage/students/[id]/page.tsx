import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getStudentXpSummary } from "@/lib/xp";
import { Avatar } from "@/components/ui/Avatar";
import { XpBar } from "@/components/ui/XpBar";
import { Badge } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";
import { formatScore } from "@/lib/tests";
import { XpHistoryList } from "@/components/dashboard/XpHistoryList";
import { ManualXpForm, AwardAchievementForm, DeleteStudentButton } from "./StudentActions";

export default async function ManageStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();

  const [student, summary, submissions, allAchievements, earnedAchievementIds, xpHistory, testAssignments] = await Promise.all([
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
    prisma.xpTransaction.findMany({ where: { userId: id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20 }),
    prisma.testAssignment.findMany({
      where: { studentId: id },
      include: { test: { include: { attempts: { where: { studentId: id } } } } },
      orderBy: { assignedAt: "desc" },
    }),
  ]);

  if (!student) notFound();

  const earnedSet = new Set(earnedAchievementIds.map((e) => e.achievementId));
  const availableAchievements = allAchievements.filter((a) => !earnedSet.has(a.id));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/manage/students" className="-mb-3 self-start text-sm font-semibold text-violet hover:underline">
        ← Все ученики
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar name={student.displayName} url={student.avatarUrl} size="lg" />
          <div>
          <h1 className="font-display text-3xl font-extrabold">{student.displayName}</h1>
          <p className="text-ink-soft">{[student.username && `@${student.username}`, student.email].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <DeleteStudentButton studentId={id} name={student.displayName} />
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
        <h2 className="font-display text-lg font-bold">История опыта</h2>
        <XpHistoryList items={xpHistory} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">Тесты</h2>
        {testAssignments.length === 0 ? (
          <p className="brutal-card p-5 text-sm text-ink-soft">Тесты ученику не выдавались.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {testAssignments.map(({ id: aid, test }) => {
              const attempt = test.attempts[0];
              return (
                <Link
                  key={aid}
                  href={`/dashboard/manage/tests/${test.id}`}
                  className="brutal-card flex items-center justify-between gap-3 p-3"
                >
                  <p className="truncate font-display text-sm font-bold">{test.title}</p>
                  {!attempt ? (
                    <Badge tone="paper">Не сдано</Badge>
                  ) : attempt.status === "SUBMITTED" ? (
                    <Badge tone="sun">Нужна проверка</Badge>
                  ) : (
                    <Badge tone="lime">{formatScore(attempt.score, attempt.maxScore)}</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">История сдач</h2>
        {submissions.length === 0 ? (
          <p className="brutal-card p-5 text-sm text-ink-soft">Пока нет сдач.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {submissions.map((s) => {
              const status = SUBMISSION_STATUS_LABELS[s.status];
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/manage/quests/${s.questId}`}
                  className="brutal-card flex items-center justify-between gap-3 p-3"
                >
                  <p className="truncate font-display text-sm font-bold">{s.quest.title}</p>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
