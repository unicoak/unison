"use server";

import { revalidatePath } from "next/cache";
import { requireGod } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

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
