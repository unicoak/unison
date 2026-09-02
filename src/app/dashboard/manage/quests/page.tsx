import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function ManageQuestsPage() {
  await requireStaff();

  const quests = await prisma.quest.findMany({
    include: { assignments: true, submissions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Квесты</h1>
        <LinkButton href="/dashboard/manage/quests/new">+ Новый квест</LinkButton>
      </div>

      {quests.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Квестов пока нет — создайте первый!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {quests.map((q) => {
            const pending = q.submissions.filter((s) => s.status === "SUBMITTED").length;
            const approved = q.submissions.filter((s) => s.status === "APPROVED").length;
            return (
              <Link key={q.id} href={`/dashboard/manage/quests/${q.id}`} className="brutal-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{q.title}</p>
                  <p className="text-xs font-semibold text-ink-soft">
                    +{q.xpReward} XP · назначено {q.assignments.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pending > 0 && <Badge tone="sun">{pending} на проверке</Badge>}
                  <Badge tone="lime">{approved} принято</Badge>
                  {q.status === "CLOSED" && <Badge tone="ink">Закрыт</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
