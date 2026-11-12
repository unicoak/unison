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
  id: string | null; // set when editing an existing question
  removeImage: boolean;
  type: "CHOICE" | "TEXT";
  text: string;
  points: number;
  image: File | null;
  options: { id: string | null; text: string; isCorrect: boolean }[];
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
        const optionId = String(formData.get(`q-${i}-optid-${j}`) ?? "") || null;
        if (optionText) options.push({ id: optionId, text: optionText.slice(0, 500), isCorrect: j === correct });
      }
      if (options.length < 2) return { error: `Вопрос ${n}: нужно минимум 2 варианта ответа` };
      if (!options.some((o) => o.isCorrect)) return { error: `Вопрос ${n}: отметьте правильный вариант` };
    }

    const id = String(formData.get(`q-${i}-id`) ?? "") || null;
    const removeImage = formData.get(`q-${i}-removeImage`) === "on";
    questions.push({ id, removeImage, type, text, points, image, options });
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

/** Edit a test in place. Existing questions/options keep their ids, so students' answers survive. */
export async function updateTestAction(testId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const parsed = draftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { questions, error } = readQuestions(formData);
  if (error || !questions) return { error };

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { include: { options: true } } },
  });
  if (!test) return { error: "Тест не найден" };

  const existing = new Map(test.questions.map((q) => [q.id, q]));
  for (const q of questions) {
    if (q.id && !existing.has(q.id)) return { error: "Тест уже изменён в другой вкладке. Обновите страницу." };
    // The type of an existing question is fixed: answers already given depend on it.
    if (q.id && existing.get(q.id)!.type !== q.type) return { error: "Тип существующего вопроса менять нельзя" };
  }

  let imageUrls: (string | null | undefined)[]; // undefined = leave as is
  try {
    imageUrls = [];
    for (const q of questions) {
      if (q.image) imageUrls.push((await storeFile(q.image)).url);
      else if (q.removeImage) imageUrls.push(null);
      else imageUrls.push(q.id ? undefined : null);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось загрузить изображение" };
  }

  const keptIds = new Set(questions.map((q) => q.id).filter(Boolean) as string[]);

  await prisma.$transaction(
    async (tx) => {
      await tx.test.update({
        where: { id: testId },
        data: { title: parsed.data.title, description: parsed.data.description ?? null },
      });

      const removed = test.questions.filter((q) => !keptIds.has(q.id)).map((q) => q.id);
      if (removed.length) await tx.testQuestion.deleteMany({ where: { id: { in: removed } } });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let questionId = q.id;
        if (questionId) {
          await tx.testQuestion.update({
            where: { id: questionId },
            data: {
              order: i,
              text: q.text,
              points: q.points,
              ...(imageUrls[i] !== undefined ? { imageUrl: imageUrls[i] } : {}),
            },
          });
        } else {
          const created = await tx.testQuestion.create({
            data: { testId, order: i, type: q.type, text: q.text, points: q.points, imageUrl: imageUrls[i] ?? null },
          });
          questionId = created.id;
        }

        if (q.type !== "CHOICE") continue;
        const oldOptions = new Map((existing.get(questionId)?.options ?? []).map((o) => [o.id, o]));
        const keptOptionIds = new Set(q.options.map((o) => o.id).filter((x): x is string => !!x && oldOptions.has(x)));
        const dropped = [...oldOptions.keys()].filter((oid) => !keptOptionIds.has(oid));
        if (dropped.length) await tx.testOption.deleteMany({ where: { id: { in: dropped } } });
        for (let j = 0; j < q.options.length; j++) {
          const o = q.options[j];
          if (o.id && oldOptions.has(o.id)) {
            await tx.testOption.update({ where: { id: o.id }, data: { order: j, text: o.text, isCorrect: o.isCorrect } });
          } else {
            await tx.testOption.create({ data: { questionId, order: j, text: o.text, isCorrect: o.isCorrect } });
          }
        }
      }

      // Re-grade finished attempts against the edited test.
      const fresh = await tx.testQuestion.findMany({ where: { testId }, include: { options: true } });
      const byId = new Map(fresh.map((q) => [q.id, q]));
      const maxScore = fresh.reduce((sum, q) => sum + q.points, 0);
      const attempts = await tx.testAttempt.findMany({ where: { testId }, include: { answers: true } });
      for (const attempt of attempts) {
        let score = 0;
        let hasText = false;
        for (const a of attempt.answers) {
          const q = byId.get(a.questionId);
          if (!q) continue;
          let points: number | null;
          if (q.type === "CHOICE") {
            points = q.options.find((o) => o.id === a.optionId)?.isCorrect ? q.points : 0;
          } else {
            hasText = true;
            points = a.pointsAwarded === null ? null : Math.min(a.pointsAwarded, q.points);
          }
          if (points !== a.pointsAwarded) {
            await tx.testAnswer.update({ where: { id: a.id }, data: { pointsAwarded: points } });
          }
          score += points ?? 0;
        }
        await tx.testAttempt.update({
          where: { id: attempt.id },
          data: {
            score,
            maxScore,
            // The only free-form question was removed: nothing is left to check.
            ...(attempt.status === "SUBMITTED" && !hasText ? { status: "GRADED" as const } : {}),
          },
        });
      }
    },
    { timeout: 30000, maxWait: 10000 },
  );

  revalidatePath("/dashboard/manage/tests");
  revalidatePath(`/dashboard/manage/tests/${testId}`);
  revalidatePath("/dashboard/tests");
  revalidatePath(`/dashboard/tests/${testId}`);
  redirect(`/dashboard/manage/tests/${testId}`);
}
