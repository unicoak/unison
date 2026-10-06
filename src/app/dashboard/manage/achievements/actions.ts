"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { achievementSchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string } | undefined;

function revalidateAll() {
  revalidatePath("/dashboard/manage/achievements");
  revalidatePath("/dashboard/achievements");
}

function parseFields(formData: FormData) {
  return achievementSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    secret: formData.get("secret") === "on",
  });
}

export async function createAchievementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const parsed = parseFields(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  await prisma.achievement.create({ data: { ...parsed.data, code: `custom-${randomUUID()}` } });
  revalidateAll();
  return { success: "Ачивка создана" };
}

export async function updateAchievementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const id = String(formData.get("id") ?? "");
  const parsed = parseFields(formData);
  if (!id || !parsed.success) return { error: parsed.success ? "Ачивка не найдена" : parsed.error.issues[0]?.message ?? "Проверьте поля" };

  // `code` is left alone: auto-awarded achievements are looked up by it.
  const result = await prisma.achievement.updateMany({ where: { id }, data: parsed.data });
  if (result.count === 0) return { error: "Ачивка не найдена" };

  revalidateAll();
  return { success: "Сохранено" };
}
