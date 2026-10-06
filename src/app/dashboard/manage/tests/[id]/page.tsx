import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/tests";
import { DeleteTestButton } from "./DeleteTestButton";
import { AssignMore } from "./AssignMore";
import { GradePanel } from "./GradePanel";

export default async function ManageTestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();

  const [test, allStudents] = await Promise.all([
    prisma.test.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
        assignments: { include: { student: true }, orderBy: { student: { displayName: "asc" } } },
        attempts: {
          include: {
            answers: { include: { question: true, option: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
  ]);
  if (!test) notFound();

  const attemptByStudent = new Map(test.attempts.map((a) => [a.studentId, a]));
  const assignedIds = new Set(test.assignments.map((a) => a.studentId));
  const unassigned = allStudents.filter((s) => !assignedIds.has(s.id));
  const maxScore = test.questions.reduce((s, q) => s + q.points, 0);
  const questionOrder = new Map(test.questions.map((q) => [q.id, q.order]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/manage/tests" className="text-sm font-semibold text-violet hover:underline">
          ← Все тесты
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold">{test.title}</h1>
          <div className="flex items-center gap-2">
            <Badge tone="violet">{maxScore} баллов</Badge>
            <DeleteTestButton testId={test.id} />
          </div>
        </div>
        {test.description && <p className="mt-2 whitespace-pre-wrap text-ink-soft">{test.description}</p>}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">Результаты</h2>
        {test.assignments.length === 0 && <p className="brutal-card p-5 text-sm text-ink-soft">Тест пока никому не выдан.</p>}
        {test.assignments.map((a) => {
          const attempt = attemptByStudent.get(a.studentId);
          const textAnswers = attempt
            ? attempt.answers
                .filter((x) => x.question.type === "TEXT")
                .sort((x, y) => (questionOrder.get(x.questionId) ?? 0) - (questionOrder.get(y.questionId) ?? 0))
            : [];
          return (
            <div key={a.id} className="brutal-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-base font-bold">{a.student.displayName}</p>
                {!attempt ? (
                  <Badge tone="paper">Не сдано</Badge>
                ) : attempt.status === "SUBMITTED" ? (
                  <Badge tone="sun">Нужна проверка</Badge>
                ) : (
                  <Badge tone="lime">{formatScore(attempt.score, attempt.maxScore)}</Badge>
                )}
              </div>

              {attempt && (
                <details className="mt-3" open={attempt.status === "SUBMITTED"}>
                  <summary className="cursor-pointer text-xs font-semibold text-violet">
                    {textAnswers.length > 0 ? "Проверить ответы" : "Показать ответы"}
                  </summary>

                  <div className="mt-2 flex flex-col gap-2 text-sm">
                    {test.questions
                      .filter((q) => q.type === "CHOICE")
                      .map((q) => {
                        const ans = attempt.answers.find((x) => x.questionId === q.id);
                        const ok = ans?.option?.isCorrect;
                        return (
                          <p key={q.id} className="rounded-xl bg-paper-dim p-3">
                            <span className="text-xs font-semibold text-ink-soft">{q.text}</span>
                            <br />
                            {ans?.option ? ans.option.text : <span className="text-ink-soft">— без ответа —</span>}{" "}
                            <span className={ok ? "font-semibold text-violet" : "font-semibold text-coral"}>
                              {ok ? `✓ +${q.points}` : "✗ 0"}
                            </span>
                          </p>
                        );
                      })}
                  </div>

                  {textAnswers.length > 0 && (
                    <GradePanel
                      attemptId={attempt.id}
                      answers={textAnswers.map((x) => ({
                        id: x.id,
                        questionText: x.question.text,
                        maxPoints: x.question.points,
                        textAnswer: x.textAnswer ?? "",
                        pointsAwarded: x.pointsAwarded,
                        teacherComment: x.teacherComment ?? "",
                      }))}
                    />
                  )}
                </details>
              )}
            </div>
          );
        })}
      </section>

      <AssignMore testId={test.id} students={unassigned} />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold">Вопросы</h2>
        {test.questions.map((q, i) => (
          <div key={q.id} className="brutal-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-sm font-bold">Вопрос {i + 1}</p>
              <Badge tone={q.type === "TEXT" ? "sun" : "sky"}>
                {q.type === "TEXT" ? "развёрнутый" : "с вариантами"} · {q.points} б.
              </Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{q.text}</p>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.imageUrl} alt="" className="mt-3 max-h-72 rounded-xl border border-line" />
            )}
            {q.options.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {q.options.map((o) => (
                  <li key={o.id} className={o.isCorrect ? "font-semibold text-violet" : "text-ink-soft"}>
                    {o.isCorrect ? "✓" : "•"} {o.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
