"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireGod } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export async function changeRoleAction(userId: string, role: "STUDENT" | "TEACHER") {
  await requireGod();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "GOD") return;

  await prisma.user.update({ where: { id: userId }, data: { role } });

  if (role === "STUDENT") {
    await prisma.studentProfile.upsert({ where: { userId }, update: {}, create: { userId } });
  }

  revalidatePath("/dashboard/manage/users");
}

export type ResetPasswordState = { error?: string; success?: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireGod();

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" };

  const { userId, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Пользователь не найден" };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/dashboard/manage/users");
  return { success: "Пароль обновлён" };
}
