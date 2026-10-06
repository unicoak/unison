"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { storeFile, validateFile } from "@/lib/storage";

export type ActionState = { error?: string; success?: string } | undefined;

const MAX_QUESTIONS = 50;
const MAX_OPTIONS = 10;

const draftSchema = z.object({
  title: z.string().trim().min(3, "Название: минимум 3 символа").max(120),
  description: z.string().trim().max(2000).optional(),
});

type QuestionDraft = {
  type: "CHOICE" | "TEXT";
  text: string;
  points: number;
  image: File | null;
  options: { text: string; isCorrect: boolean }[];
};

function readQuestions(formData: FormData): { questions?: QuestionDraft[]; error?: string } {
  const count = Number(formData.get("questionCount"));
  if (!Number.isInteger(count) || count < 1) return { error: "Добавьте хотя бы один вопрос" };
  if (count > MAX_QUESTIONS) return { error: `Не больше ${MAX_QUESTIONS} вопросов` };

  const questions: QuestionDraft[] = [];
  for (let i = 0; i < count; i++) {
    const n = i + 1;
    const type = formData.get(`q-${i}-type`) === "TEXT" ? "TEXT" : "CHOICE";
    const text = String(formData.get(`q-${i}-text`) ?? "").trim();
    const points = Number(formData.get(`q-${i}-points`));
    if (!text) return { error: `Вопрос ${n}: введите текст вопроса` };
    if (text.length > 2000) return { error: `Вопрос ${n}: слишком длинный текст` };
    if (!Number.isInteger(points) || points < 0 || points > 1000) {
      return { error: `Вопрос ${n}: баллы — целое число от 0 до 1000` };
    }

    const imageRaw = formData.get(`q-${i}-image`);
    const image = imageRaw instanceof File && imageRaw.size > 0 ? imageRaw : null;
    if (image) {
      const check = validateFile(image);
      if (!check.ok || check.kind !== "IMAGE") {
        return { error: `Вопрос ${n}: к вопросу можно прикрепить только изображение (jpg, png, webp, gif, до 10 МБ)` };
      }
    }

    const options: QuestionDraft["options"] = [];
    if (type === "CHOICE") {
      const optionCount = Math.min(Number(formData.get(`q-${i}-optionCount`)) || 0, MAX_OPTIONS);
      const correct = Number(formData.get(`q-${i}-correct`));
      for (let j = 0; j < optionCount; j++) {
        const optionText = String(formData.get(`q-${i}-opt-${j}`) ?? "").trim();
        if (optionText) options.push({ text: optionText.slice(0, 500), isCorrect: j === correct });
      }
      if (options.length < 2) return { error: `Вопрос ${n}: нужно минимум 2 варианта ответа` };
      if (!options.some((o) => o.isCorrect)) return { error: `Вопрос ${n}: отметьте правильный вариант` };
    }

    questions.push({ type, text, points, image, options });
  }
  return { questions };
}

export async function createTestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const parsed = draftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { questions, error } = readQuestions(formData);
  if (error || !questions) return { error };

  const assignToAll = formData.get("assignToAll") === "on";
  const studentIds = assignToAll
    ? (await prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true } })).map((u) => u.id)
    : (formData.getAll("assigneeIds") as string[]);
  if (studentIds.length === 0) return { error: "Выберите хотя бы одного ученика" };

  let imageUrls: (string | null)[];
  try {
    imageUrls = [];
    for (const q of questions) imageUrls.push(q.image ? (await storeFile(q.image)).url : null);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось загрузить изображение" };
  }

  const test = await prisma.test.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      createdById: session.user.id,
      questions: {
        create: questions.map((q, i) => ({
          order: i,
          type: q.type,
          text: q.text,
          points: q.points,
          imageUrl: imageUrls[i],
          options: { create: q.options.map((o, j) => ({ order: j, text: o.text, isCorrect: o.isCorrect })) },
        })),
      },
      assignments: { create: studentIds.map((studentId) => ({ studentId })) },
    },
  });

  revalidatePath("/dashboard/manage/tests");
  redirect(`/dashboard/manage/tests/${test.id}`);
}

export async function assignTestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const testId = String(formData.get("testId") ?? "");
  const studentIds = formData.getAll("studentIds") as string[];
  if (!testId || studentIds.length === 0) return { error: "Выберите хотя бы одного ученика" };

  await prisma.testAssignment.createMany({
    data: studentIds.map((studentId) => ({ testId, studentId })),
    skipDuplicates: true,
  });

  revalidatePath(`/dashboard/manage/tests/${testId}`);
  revalidatePath("/dashboard/tests");
  return { success: "Тест выдан" };
}

export async function deleteTestAction(testId: string) {
  await requireStaff();
  // Questions, options, assignments, attempts and answers go with the test (cascade).
  await prisma.test.deleteMany({ where: { id: testId } });
  revalidatePath("/dashboard/manage/tests");
  revalidatePath("/dashboard/tests");
  redirect("/dashboard/manage/tests");
}

export async function gradeAttemptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const attemptId = String(formData.get("attemptId") ?? "");
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: { include: { question: true } } },
  });
  if (!attempt) return { error: "Попытка не найдена" };

  const updates: { id: string; points: number; comment: string | null }[] = [];
  for (const answer of attempt.answers) {
    if (answer.question.type !== "TEXT") continue;
    const points = Number(formData.get(`points-${answer.id}`));
    if (!Number.isInteger(points) || points < 0 || points > answer.question.points) {
      return { error: `Баллы за вопрос «${answer.question.text.slice(0, 40)}»: от 0 до ${answer.question.points}` };
    }
    const comment = String(formData.get(`comment-${answer.id}`) ?? "").trim().slice(0, 1000);
    updates.push({ id: answer.id, points, comment: comment || null });
  }

  const textPoints = updates.reduce((sum, u) => sum + u.points, 0);
  const choicePoints = attempt.answers
    .filter((a) => a.question.type === "CHOICE")
    .reduce((sum, a) => sum + (a.pointsAwarded ?? 0), 0);

  await prisma.$transaction([
    ...updates.map((u) =>
      prisma.testAnswer.update({ where: { id: u.id }, data: { pointsAwarded: u.points, teacherComment: u.comment } }),
    ),
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score: choicePoints + textPoints,
        status: "GRADED",
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    }),
  ]);

  revalidatePath(`/dashboard/manage/tests/${attempt.testId}`);
  revalidatePath(`/dashboard/tests/${attempt.testId}`);
  revalidatePath("/dashboard/tests");
  return { success: "Оценка сохранена" };
}
