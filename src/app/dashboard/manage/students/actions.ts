"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { manualXpSchema, awardAchievementSchema } from "@/lib/validation";
import { awardXp } from "@/lib/xp";
import { checkLevelAchievements } from "@/lib/achievements";

export type ActionState = { error?: string; success?: string } | undefined;

export async function manualXpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const parsed = manualXpSchema.safeParse({
    studentId: formData.get("studentId"),
    amount: formData.get("amount"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { studentId, amount } = parsed.data;
  const result = await awardXp(studentId, amount);
  await checkLevelAchievements(studentId, result.level);

  revalidatePath(`/dashboard/manage/students/${studentId}`);
  return { success: `Начислено ${amount} XP` };
}

export async function awardAchievementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const parsed = awardAchievementSchema.safeParse({
    studentId: formData.get("studentId"),
    achievementId: formData.get("achievementId"),
  });
  if (!parsed.success) return { error: "Выберите ачивку" };

  const { studentId, achievementId } = parsed.data;

  await prisma.userAchievement.upsert({
    where: { userId_achievementId: { userId: studentId, achievementId } },
    update: {},
    create: { userId: studentId, achievementId, awardedById: session.user.id },
  });

  revalidatePath(`/dashboard/manage/students/${studentId}`);
  return { success: "Ачивка выдана" };
}
