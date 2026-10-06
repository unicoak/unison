import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/tests";

export default async function StudentTestsPage() {
  const session = await requireRole(["STUDENT"]);
  const studentId = session.user.id;

  const assignments = await prisma.testAssignment.findMany({
    where: { studentId },
    include: {
      test: {
        include: {
          _count: { select: { questions: true } },
          attempts: { where: { studentId } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-extrabold">Тесты</h1>

      {assignments.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Вам пока не выдали ни одного теста.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map(({ id, test }) => {
            const attempt = test.attempts[0];
            return (
              <Link
                key={id}
                href={`/dashboard/tests/${test.id}`}
                className="brutal-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{test.title}</p>
                  <p className="text-xs font-semibold text-ink-soft">вопросов: {test._count.questions}</p>
                </div>
                {!attempt ? (
                  <Badge tone="violet">Пройти</Badge>
                ) : attempt.status === "SUBMITTED" ? (
                  <Badge tone="sun">На проверке</Badge>
                ) : (
                  <Badge tone="lime">{formatScore(attempt.score, attempt.maxScore)}</Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
