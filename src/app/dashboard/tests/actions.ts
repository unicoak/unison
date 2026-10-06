"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export type SubmitTestState = { error?: string; done?: boolean } | undefined;

export async function submitTestAction(_prev: SubmitTestState, formData: FormData): Promise<SubmitTestState> {
  const session = await requireRole(["STUDENT"]);
  const studentId = session.user.id;
  const testId = String(formData.get("testId") ?? "");

  const assignment = await prisma.testAssignment.findUnique({
    where: { testId_studentId: { testId, studentId } },
  });
  if (!assignment) return { error: "Этот тест вам не выдан" };

  const existing = await prisma.testAttempt.findUnique({ where: { testId_studentId: { testId, studentId } } });
  if (existing) return { error: "Вы уже сдали этот тест" };

  const questions = await prisma.testQuestion.findMany({
    where: { testId },
    include: { options: true },
    orderBy: { order: "asc" },
  });
  if (questions.length === 0) return { error: "В тесте нет вопросов" };

  let score = 0;
  let hasText = false;
  const answers = questions.map((q) => {
    if (q.type === "CHOICE") {
      const chosen = q.options.find((o) => o.id === formData.get(`answer-${q.id}`));
      const points = chosen?.isCorrect ? q.points : 0;
      score += points;
      return { questionId: q.id, optionId: chosen?.id ?? null, pointsAwarded: points };
    }
    hasText = true;
    const text = String(formData.get(`answer-${q.id}`) ?? "").trim().slice(0, 4000);
    return { questionId: q.id, textAnswer: text || null };
  });

  try {
    await prisma.testAttempt.create({
      data: {
        testId,
        studentId,
        score,
        maxScore: questions.reduce((sum, q) => sum + q.points, 0),
        status: hasText ? "SUBMITTED" : "GRADED",
        answers: { create: answers },
      },
    });
  } catch {
    return { error: "Не удалось сохранить ответы. Возможно, тест уже сдан." };
  }

  revalidatePath(`/dashboard/tests/${testId}`);
  revalidatePath("/dashboard/tests");
  revalidatePath(`/dashboard/manage/tests/${testId}`);
  return { done: true };
}
