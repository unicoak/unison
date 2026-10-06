"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { storeFile, validateFile } from "@/lib/storage";

export type AvatarState = { error?: string; success?: string } | undefined;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function updateAvatarAction(_prev: AvatarState, formData: FormData): Promise<AvatarState> {
  const session = await requireSession();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Выберите фото" };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Фото слишком большое (максимум 5 МБ)" };

  const check = validateFile(file);
  if (!check.ok || check.kind !== "IMAGE") {
    return { error: "Подойдёт изображение: jpg, png, webp или gif" };
  }

  let url: string;
  try {
    url = (await storeFile(file)).url;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось загрузить фото" };
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl: url } });
  revalidatePath("/dashboard", "layout");
  return { success: "Фото обновлено" };
}

export async function removeAvatarAction() {
  const session = await requireSession();
  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl: null } });
  revalidatePath("/dashboard", "layout");
}
