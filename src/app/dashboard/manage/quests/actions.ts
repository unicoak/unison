"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { parseSiteDateTime } from "@/lib/quests";
import { questSchema, reviewSchema } from "@/lib/validation";
import { awardXp, getStudentXpSummary } from "@/lib/xp";
import { checkSubmissionAchievements, checkLevelAchievements, grantQuestAchievement } from "@/lib/achievements";

export type ActionState = { error?: string } | undefined;

export async function createQuestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const parsed = questSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    xpReward: formData.get("xpReward"),
    dueAt: formData.get("dueAt") || undefined,
    achievementId: formData.get("achievementId") || undefined,
    availableAt: formData.get("availableAt") || undefined,
    assigneeIds: formData.getAll("assigneeIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" };
  }

  const { title, description, xpReward, dueAt, achievementId, assigneeIds, availableAt } = parsed.data;
  const availableAtDate = availableAt ? parseSiteDateTime(availableAt) : null;
  if (availableAt && !availableAtDate) return { error: "Некорректная дата открытия квеста" };

  const assignToAll = formData.get("assignToAll") === "on";

  const studentIds = assignToAll
    ? (await prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true } })).map((u) => u.id)
    : assigneeIds ?? [];

  if (studentIds.length === 0) {
    return { error: "Выберите хотя бы одного ученика" };
  }

  const quest = await prisma.quest.create({
    data: {
      title,
      description,
      xpReward,
      dueAt: dueAt ? new Date(dueAt) : null,
      createdById: session.user.id,
      achievementId: achievementId ?? null,
      availableAt: availableAtDate,
      assignments: { create: studentIds.map((studentId) => ({ studentId })) },
    },
  });

  revalidatePath("/dashboard/manage/quests");
  redirect(`/dashboard/manage/quests/${quest.id}`);
}

export async function closeQuestAction(questId: string) {
  await requireStaff();
  await prisma.quest.update({ where: { id: questId }, data: { status: "CLOSED" } });
  revalidatePath("/dashboard/manage/quests");
  revalidatePath(`/dashboard/manage/quests/${questId}`);
}

export async function deleteQuestAction(questId: string) {
  await requireStaff();
  // Assignments, submissions and their files go with the quest (onDelete: Cascade).
  // XP already awarded for approved submissions is intentionally left as is.
  await prisma.quest.deleteMany({ where: { id: questId } });
  revalidatePath("/dashboard/manage/quests");
  revalidatePath("/dashboard/quests");
  revalidatePath("/dashboard");
  redirect("/dashboard/manage/quests");
}

export async function reviewSubmissionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const parsed = reviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    decision: formData.get("decision"),
    teacherComment: formData.get("teacherComment") || undefined,
    xpOverride: formData.get("xpOverride") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" };
  }

  const { submissionId, decision, teacherComment, xpOverride } = parsed.data;

  const submission = await prisma.questSubmission.findUnique({
    where: { id: submissionId },
    include: { quest: true },
  });
  if (!submission) return { error: "Сдача не найдена" };

  const xpAmount = decision === "APPROVED" ? xpOverride ?? submission.quest.xpReward : null;

  // If this submission was already approved before (teacher revising their
  // decision), reconcile the XP delta instead of double-awarding or leaving
  // stale XP behind.
  const previouslyAwarded = submission.status === "APPROVED" ? submission.xpAwarded ?? 0 : 0;
  const delta = (xpAmount ?? 0) - previouslyAwarded;

  await prisma.questSubmission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      teacherComment,
      xpAwarded: xpAmount,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  if (delta !== 0) {
    await awardXp(submission.studentId, delta);
  }

  if (decision === "APPROVED") {
    const summary = await getStudentXpSummary(submission.studentId);
    await grantQuestAchievement(submission.studentId, submission.quest.achievementId);
    await checkSubmissionAchievements(submission.studentId);
    if (summary) await checkLevelAchievements(submission.studentId, summary.level);
  }

  revalidatePath(`/dashboard/manage/quests/${submission.questId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/achievements");
  return {};
}
