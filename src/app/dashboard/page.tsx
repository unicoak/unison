import Link from "next/link";
import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getStudentXpSummary } from "@/lib/xp";
import { XpBar } from "@/components/ui/XpBar";
import { QuestTicket } from "@/components/dashboard/QuestTicket";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardHome() {
  const session = await requireSession();
  const { id, role, name } = session.user;

  if (role === "STUDENT") {
    const [summary, assignments, achievementCount] = await Promise.all([
      getStudentXpSummary(id),
      prisma.questAssignment.findMany({
        where: { studentId: id, quest: { status: "OPEN" } },
        include: { quest: { include: { submissions: { where: { studentId: id } } } } },
        orderBy: { assignedAt: "desc" },
      }),
      prisma.userAchievement.count({ where: { userId: id } }),
    ]);

    const needsAction = assignments.filter((a) => {
      const sub = a.quest.submissions[0];
      return !sub || sub.status === "NEEDS_REVISION" || sub.status === "REJECTED";
    });

    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-display text-sm text-ink-soft">С возвращением,</p>
          <h1 className="font-display text-3xl font-extrabold">{name} 👋</h1>
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="brutal-card p-4 text-center">
            <p className="font-display text-2xl font-extrabold text-coral">{needsAction.length}</p>
            <p className="text-xs font-semibold text-ink-soft">квестов ждут действия</p>
          </div>
          <div className="brutal-card p-4 text-center">
            <p className="font-display text-2xl font-extrabold text-sky">{assignments.length}</p>
            <p className="text-xs font-semibold text-ink-soft">квестов активно</p>
          </div>
          <div className="brutal-card col-span-2 p-4 text-center sm:col-span-1">
            <p className="font-display text-2xl font-extrabold text-sun">{achievementCount}</p>
            <p className="text-xs font-semibold text-ink-soft">ачивок получено</p>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Требуют внимания</h2>
            <Link href="/dashboard/quests" className="text-sm font-semibold text-violet underline">
              все квесты →
            </Link>
          </div>

          {needsAction.length === 0 ? (
            <p className="brutal-card p-5 text-sm text-ink-soft">
              Всё сдано и на контроле. Загляни попозже — учитель проверяет твои работы 👀
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {needsAction.slice(0, 5).map((a) => (
                <QuestTicket
                  key={a.quest.id}
                  href={`/dashboard/quests/${a.quest.id}`}
                  title={a.quest.title}
                  xpReward={a.quest.xpReward}
                  dueAt={a.quest.dueAt}
                  statusSlot={
                    a.quest.submissions[0]?.status === "NEEDS_REVISION" ? (
                      <Badge tone="sky">Доработать</Badge>
                    ) : a.quest.submissions[0]?.status === "REJECTED" ? (
                      <Badge tone="coral">Отклонено</Badge>
                    ) : (
                      <Badge tone="sun">Новый</Badge>
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const [studentCount, pendingCount, openQuestCount, pendingSubmissions] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.questSubmission.count({ where: { status: "SUBMITTED" } }),
    prisma.quest.count({ where: { status: "OPEN" } }),
    prisma.questSubmission.findMany({
      where: { status: "SUBMITTED" },
      include: { quest: true, student: true },
      orderBy: { submittedAt: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-sm text-ink-soft">С возвращением,</p>
        <h1 className="font-display text-3xl font-extrabold">{name} 👋</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="brutal-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-violet">{studentCount}</p>
          <p className="text-xs font-semibold text-ink-soft">учеников</p>
        </div>
        <div className="brutal-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-coral">{pendingCount}</p>
          <p className="text-xs font-semibold text-ink-soft">на проверке</p>
        </div>
        <div className="brutal-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-sky">{openQuestCount}</p>
          <p className="text-xs font-semibold text-ink-soft">активных квестов</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Ждут проверки</h2>
          <LinkButton href="/dashboard/manage/quests" variant="ghost" size="sm">
            Все квесты
          </LinkButton>
        </div>

        {pendingSubmissions.length === 0 ? (
          <p className="brutal-card p-5 text-sm text-ink-soft">Очередь на проверку пуста. Красота 🎉</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingSubmissions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/manage/quests/${s.questId}`}
                className="brutal-card flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{s.quest.title}</p>
                  <p className="text-xs text-ink-soft">{s.student.displayName}</p>
                </div>
                <Badge tone="sun">Новое</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
