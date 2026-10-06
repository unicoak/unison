"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { manualXpSchema, awardAchievementSchema, createStudentSchema } from "@/lib/validation";
import { awardXp } from "@/lib/xp";
import { checkLevelAchievements } from "@/lib/achievements";

export type ActionState = { error?: string; success?: string } | undefined;

export async function manualXpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireStaff();

  const parsed = manualXpSchema.safeParse({
    studentId: formData.get("studentId"),
    amount: formData.get("amount"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const { studentId, amount, reason } = parsed.data;
  const result = await awardXp(studentId, amount, {
    reason: reason || (amount >= 0 ? "Начисление от учителя" : "Списание учителем"),
    createdById: session.user.id,
  });
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

export async function deleteStudentAction(studentId: string) {
  await requireStaff();
  // Only students can be removed here; profile, submissions, assignments and
  // achievements are removed by cascade.
  await prisma.user.deleteMany({ where: { id: studentId, role: "STUDENT" } });
  revalidatePath("/dashboard/manage/students");
  revalidatePath("/dashboard/manage/quests");
  redirect("/dashboard/manage/students");
}

export type CreateStudentState = { error?: string; success?: string } | undefined;

export async function createStudentAction(_prev: CreateStudentState, formData: FormData): Promise<CreateStudentState> {
  await requireStaff();

  const parsed = createStudentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" };

  const { firstName, lastName, username, password } = parsed.data;

  const taken = await prisma.user.findUnique({ where: { username } });
  if (taken) return { error: "Такой никнейм уже занят" };

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        passwordHash,
        role: "STUDENT",
        studentProfile: { create: {} },
      },
    });
  } catch {
    return { error: "Не удалось создать ученика, возможно никнейм уже занят" };
  }

  revalidatePath("/dashboard/manage/students");
  return { success: `Ученик «${firstName} ${lastName}» создан. Логин для входа: ${username}` };
}
