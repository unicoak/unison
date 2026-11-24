import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/xp";

export function formatScore(score: number, max: number) {
  const percent = max > 0 ? Math.round((score / max) * 100) : 0;
  return `${score} из ${max} (${percent}%)`;
}

/** Prisma filter for tests a student may already see (same idea as quests). */
export function testOpenedFilter(now = new Date()): Prisma.TestWhereInput {
  return { OR: [{ availableAt: null }, { availableAt: { lte: now } }] };
}

export type TestXpConfig = { xpMode: "NONE" | "PER_QUESTION" | "TOTAL"; xpTotal: number };

/** The most XP a test can give, for display. */
export function maxTestXp(test: TestXpConfig, questions: { xp: number }[]) {
  if (test.xpMode === "TOTAL") return test.xpTotal;
  if (test.xpMode === "PER_QUESTION") return questions.reduce((s, q) => s + q.xp, 0);
  return 0;
}

/**
 * XP an attempt has earned. Always proportional to the points scored:
 * TOTAL — xpTotal × score/maxScore; PER_QUESTION — each question's xp × its points share.
 */
export function computeTestXp(
  test: TestXpConfig,
  questions: { id: string; points: number; xp: number }[],
  attempt: { score: number; maxScore: number; answers: { questionId: string; pointsAwarded: number | null }[] },
) {
  if (test.xpMode === "TOTAL") {
    return attempt.maxScore > 0 ? Math.round((test.xpTotal * attempt.score) / attempt.maxScore) : 0;
  }
  if (test.xpMode === "PER_QUESTION") {
    const byQuestion = new Map(attempt.answers.map((a) => [a.questionId, a.pointsAwarded ?? 0]));
    return questions.reduce((sum, q) => {
      if (q.points <= 0) return sum;
      const got = Math.min(byQuestion.get(q.id) ?? 0, q.points);
      return sum + Math.round((q.xp * got) / q.points);
    }, 0);
  }
  return 0;
}

/**
 * Pays out (or corrects) the XP for a graded attempt. Only the difference to what was already
 * paid is applied, so it is safe to call again after re-grading or after the test is edited.
 */
export async function settleTestXp(attemptId: string, createdById?: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true, test: { include: { questions: true } } },
  });
  if (!attempt || attempt.status !== "GRADED") return;

  const target = computeTestXp(attempt.test, attempt.test.questions, attempt);
  const delta = target - attempt.xpAwarded;
  if (delta === 0) return;

  // Compare-and-set so two parallel calls can't pay the same difference twice.
  const claimed = await prisma.testAttempt.updateMany({
    where: { id: attemptId, xpAwarded: attempt.xpAwarded },
    data: { xpAwarded: target },
  });
  if (claimed.count === 0) return;

  const title = `Тест «${attempt.test.title}»`;
  await awardXp(attempt.studentId, delta, {
    reason: attempt.xpAwarded === 0 ? title : `${title} (пересчёт)`,
    createdById,
  });
}
