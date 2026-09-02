import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { QuestTicket } from "@/components/dashboard/QuestTicket";
import { Badge } from "@/components/ui/Badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

export default async function StudentQuestsPage() {
  const session = await requireRole(["STUDENT"]);

  const assignments = await prisma.questAssignment.findMany({
    where: { studentId: session.user.id },
    include: { quest: { include: { submissions: { where: { studentId: session.user.id } } } } },
    orderBy: { assignedAt: "desc" },
  });

  const groups: Record<"todo" | "review" | "done", typeof assignments> = {
    todo: [],
    review: [],
    done: [],
  };

  for (const a of assignments) {
    const sub = a.quest.submissions[0];
    if (!sub || sub.status === "NEEDS_REVISION" || sub.status === "REJECTED") groups.todo.push(a);
    else if (sub.status === "SUBMITTED") groups.review.push(a);
    else groups.done.push(a);
  }

  const sections: { key: keyof typeof groups; title: string }[] = [
    { key: "todo", title: "Нужно сделать" },
    { key: "review", title: "На проверке" },
    { key: "done", title: "Выполнено" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-extrabold">Квесты</h1>

      {assignments.length === 0 && (
        <p className="brutal-card p-6 text-sm text-ink-soft">
          Пока квестов нет — учитель ещё готовит задания. Загляни попозже!
        </p>
      )}

      {sections.map(
        ({ key, title }) =>
          groups[key].length > 0 && (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold">
                {title} <span className="text-ink-soft">({groups[key].length})</span>
              </h2>
              <div className="flex flex-col gap-3">
                {groups[key].map((a) => {
                  const sub = a.quest.submissions[0];
                  const status = sub ? SUBMISSION_STATUS_LABELS[sub.status] : null;
                  return (
                    <QuestTicket
                      key={a.quest.id}
                      href={`/dashboard/quests/${a.quest.id}`}
                      title={a.quest.title}
                      xpReward={a.quest.xpReward}
                      dueAt={a.quest.dueAt}
                      statusSlot={status && <Badge tone={status.tone}>{status.label}</Badge>}
                    />
                  );
                })}
              </div>
            </section>
          ),
      )}
    </div>
  );
}
