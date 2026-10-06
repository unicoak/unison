import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatScore } from "@/lib/tests";
import { TakeTestForm } from "./TakeTestForm";

export default async function StudentTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole(["STUDENT"]);
  const studentId = session.user.id;

  const assignment = await prisma.testAssignment.findUnique({
    where: { testId_studentId: { testId: id, studentId } },
  });
  if (!assignment) notFound();

  const attempt = await prisma.testAttempt.findUnique({
    where: { testId_studentId: { testId: id, studentId } },
    include: { answers: { include: { option: true } } },
  });

  // Correct answers are only loaded once the student has handed the test in.
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" }, select: { id: true, text: true, ...(attempt ? { isCorrect: true } : {}) } } },
      },
    },
  });
  if (!test) notFound();

  const header = (
    <div>
      <Link href="/dashboard/tests" className="text-sm font-semibold text-violet hover:underline">
        ← Все тесты
      </Link>
      <h1 className="mt-1 font-display text-3xl font-extrabold">{test.title}</h1>
      {test.description && <p className="mt-2 whitespace-pre-wrap text-ink-soft">{test.description}</p>}
    </div>
  );

  if (!attempt) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <TakeTestForm
          testId={test.id}
          questions={test.questions.map((q) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            imageUrl: q.imageUrl,
            points: q.points,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          }))}
        />
      </div>
    );
  }

  const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="brutal-card p-6 text-center">
        {attempt.status === "GRADED" ? (
          <>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Ваш результат</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{formatScore(attempt.score, attempt.maxScore)}</p>
          </>
        ) : (
          <>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Тест сдан</p>
            <p className="mt-1 text-sm text-ink-soft">
              Автоматически проверено: {attempt.score} баллов. Развёрнутые ответы проверит учитель — итоговая
              оценка появится здесь.
            </p>
          </>
        )}
      </div>

      {test.questions.map((q, i) => {
        const ans = answerByQuestion.get(q.id);
        return (
          <div key={q.id} className="brutal-card flex flex-col gap-3 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-violet">Вопрос {i + 1}</p>
              {q.type === "CHOICE" ? (
                ans?.option?.isCorrect ? (
                  <Badge tone="lime">верно +{q.points}</Badge>
                ) : (
                  <Badge tone="coral">неверно</Badge>
                )
              ) : ans?.pointsAwarded != null ? (
                <Badge tone="lime">
                  {ans.pointsAwarded} из {q.points}
                </Badge>
              ) : (
                <Badge tone="sun">ждёт проверки</Badge>
              )}
            </div>
            <p className="whitespace-pre-wrap font-semibold">{q.text}</p>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.imageUrl} alt="" className="max-h-96 max-w-full rounded-xl border border-line" />
            )}

            {q.type === "CHOICE" ? (
              <ul className="flex flex-col gap-1 text-sm">
                {q.options.map((o) => {
                  const chosen = ans?.optionId === o.id;
                  const correct = "isCorrect" in o && o.isCorrect;
                  return (
                    <li
                      key={o.id}
                      className={`rounded-lg px-3 py-2 ${
                        correct ? "bg-lime/30 font-semibold" : chosen ? "bg-coral/15" : "text-ink-soft"
                      }`}
                    >
                      {correct ? "✓" : chosen ? "✗" : "•"} {o.text}
                      {chosen && <span className="ml-2 text-xs text-ink-soft">(ваш ответ)</span>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <p className="whitespace-pre-wrap rounded-xl bg-paper-dim p-3 text-sm">
                  {ans?.textAnswer || <span className="text-ink-soft">— ответ не дан —</span>}
                </p>
                {ans?.teacherComment && (
                  <p className="rounded-xl bg-sky/15 p-3 text-sm text-ink-soft">Комментарий учителя: {ans.teacherComment}</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
