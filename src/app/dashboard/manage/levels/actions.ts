"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { levelLadderSchema } from "@/lib/validation";
import { computeLevelFromDefs } from "@/lib/xp";

export type ActionState = { error?: string; success?: string } | undefined;

export async function saveLevelsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const titles = formData.getAll("title");
  const xps = formData.getAll("requiredXp");
  const parsed = levelLadderSchema.safeParse(titles.map((title, i) => ({ title, requiredXp: xps[i] })));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  const defs = parsed.data.map((row, i) => ({ level: i + 1, requiredXp: row.requiredXp, title: row.title }));
  const profiles = await prisma.studentProfile.findMany({ select: { id: true, xp: true, level: true, title: true } });

  // Replace the ladder and re-place every student on it in one transaction.
  // No celebration is triggered: a changed ladder is not a level-up.
  await prisma.$transaction([
    prisma.levelDefinition.deleteMany({}),
    prisma.levelDefinition.createMany({ data: defs }),
    ...profiles.flatMap((p) => {
      const r = computeLevelFromDefs(p.xp, defs);
      return r.level === p.level && r.title === p.title
        ? []
        : [prisma.studentProfile.update({ where: { id: p.id }, data: { level: r.level, title: r.title } })];
    }),
  ]);

  revalidatePath("/dashboard/manage/levels");
  revalidatePath("/dashboard");
  return { success: "Уровни сохранены" };
}
