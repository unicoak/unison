"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { curriculumSectionSchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string } | undefined;

function parseSectionForm(formData: FormData) {
  const linksRaw = (formData.get("resources") as string) || "";
  const resources = linksRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((p) => p.trim());
      return { label: label || url, url: url || label };
    });

  return curriculumSectionSchema.safeParse({
    title: formData.get("title"),
    number: formData.get("number"),
    period: formData.get("period"),
    description: formData.get("description"),
    resources,
  });
}

function revalidateCurriculum() {
  revalidatePath("/dashboard/manage/curriculum");
  revalidatePath("/dashboard/curriculum");
}

export async function createCurriculumSectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const parsed = parseSectionForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  await prisma.curriculumSection.create({
    data: { ...parsed.data, order: Number.parseInt(parsed.data.number, 10), resources: parsed.data.resources ?? [] },
  });
  revalidateCurriculum();
  return {};
}

export async function updateCurriculumSectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const id = String(formData.get("id") ?? "");
  const parsed = parseSectionForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const result = await prisma.curriculumSection.updateMany({
    where: { id },
    data: { ...parsed.data, order: Number.parseInt(parsed.data.number, 10), resources: parsed.data.resources ?? [] },
  });
  if (result.count === 0) return { error: "Раздел не найден" };

  revalidateCurriculum();
  return { success: "Сохранено" };
}

export async function deleteCurriculumSectionAction(sectionId: string) {
  await requireStaff();
  await prisma.curriculumSection.delete({ where: { id: sectionId } });
  revalidatePath("/dashboard/manage/curriculum");
  revalidatePath("/dashboard/curriculum");
}
