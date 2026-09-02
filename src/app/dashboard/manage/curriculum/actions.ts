"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { curriculumSectionSchema } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

export async function createCurriculumSectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const linksRaw = (formData.get("resources") as string) || "";
  const resources = linksRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((p) => p.trim());
      return { label: label || url, url: url || label };
    });

  const parsed = curriculumSectionSchema.safeParse({
    title: formData.get("title"),
    order: formData.get("order"),
    period: formData.get("period"),
    description: formData.get("description"),
    resources,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  await prisma.curriculumSection.create({
    data: { ...parsed.data, resources: parsed.data.resources ?? [] },
  });
  revalidatePath("/dashboard/manage/curriculum");
  revalidatePath("/dashboard/curriculum");
  return {};
}

export async function deleteCurriculumSectionAction(sectionId: string) {
  await requireStaff();
  await prisma.curriculumSection.delete({ where: { id: sectionId } });
  revalidatePath("/dashboard/manage/curriculum");
  revalidatePath("/dashboard/curriculum");
}
