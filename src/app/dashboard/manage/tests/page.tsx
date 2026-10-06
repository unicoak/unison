import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function ManageTestsPage() {
  await requireStaff();

  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, assignments: true } },
      attempts: { select: { status: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Тесты</h1>
        <LinkButton href="/dashboard/manage/tests/new">+ Новый тест</LinkButton>
      </div>

      {tests.length === 0 ? (
        <p className="brutal-card p-6 text-sm text-ink-soft">Тестов пока нет — создайте первый!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tests.map((t) => {
            const pending = t.attempts.filter((a) => a.status === "SUBMITTED").length;
            return (
              <Link
                key={t.id}
                href={`/dashboard/manage/tests/${t.id}`}
                className="brutal-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{t.title}</p>
                  <p className="text-xs font-semibold text-ink-soft">
                    вопросов {t._count.questions} · выдано {t._count.assignments} · сдано {t.attempts.length}
                  </p>
                </div>
                {pending > 0 && <Badge tone="sun">{pending} на проверке</Badge>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
