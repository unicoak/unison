"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { storeFile } from "@/lib/storage";

export type SubmitQuestState = { error?: string } | undefined;

export async function submitQuestAction(
  _prevState: SubmitQuestState,
  formData: FormData,
): Promise<SubmitQuestState> {
  const session = await requireRole(["STUDENT"]);
  const studentId = session.user.id;
  const questId = formData.get("questId") as string;

  const assignment = await prisma.questAssignment.findUnique({
    where: { questId_studentId: { questId, studentId } },
  });
  if (!assignment) return { error: "Этот квест вам не назначен" };

  const textContent = ((formData.get("textContent") as string) || "").trim() || undefined;
  const linksRaw = (formData.get("links") as string) || "";
  const links = linksRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const link of links) {
    try {
      new URL(link);
    } catch {
      return { error: `Некорректная ссылка: ${link}` };
    }
  }

  if (!textContent && links.length === 0 && formData.getAll("files").every((f) => !(f instanceof File) || f.size === 0)) {
    return { error: "Добавьте текст, ссылку или файл" };
  }

  const incomingFiles = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const uploaded: { url: string; type: "IMAGE" | "VIDEO" | "OTHER"; filename: string; size: number }[] = [];
  try {
    for (const file of incomingFiles) {
      const { url, kind } = await storeFile(file);
      uploaded.push({ url, type: kind, filename: file.name, size: file.size });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не удалось загрузить файл" };
  }

  const fileMutation = uploaded.length > 0 ? { files: { deleteMany: {}, create: uploaded } } : {};

  await prisma.questSubmission.upsert({
    where: { questId_studentId: { questId, studentId } },
    update: {
      textContent,
      links,
      status: "SUBMITTED",
      submittedAt: new Date(),
      teacherComment: null,
      xpAwarded: null,
      reviewedAt: null,
      reviewedById: null,
      ...fileMutation,
    },
    create: {
      questId,
      studentId,
      textContent,
      links,
      status: "SUBMITTED",
      files: { create: uploaded },
    },
  });

  revalidatePath(`/dashboard/quests/${questId}`);
  revalidatePath("/dashboard/quests");
  redirect(`/dashboard/quests/${questId}`);
}
