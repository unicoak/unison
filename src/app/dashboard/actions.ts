"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/guards";
import { signOut } from "@/auth";

export async function acknowledgeLevelUp() {
  const session = await requireSession();
  await prisma.studentProfile.update({
    where: { userId: session.user.id },
    data: { celebrateLevel: null },
  });
  revalidatePath("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
