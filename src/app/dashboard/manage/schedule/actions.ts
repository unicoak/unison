"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { scheduleSlotSchema } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

export async function createScheduleSlotAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();

  const parsed = scheduleSlotSchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    subject: formData.get("subject"),
    location: formData.get("location") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };

  if (parsed.data.endTime <= parsed.data.startTime) {
    return { error: "Время окончания должно быть позже начала" };
  }

  await prisma.scheduleSlot.create({ data: parsed.data });
  revalidatePath("/dashboard/manage/schedule");
  revalidatePath("/dashboard/schedule");
  return {};
}

export async function deleteScheduleSlotAction(slotId: string) {
  await requireStaff();
  await prisma.scheduleSlot.delete({ where: { id: slotId } });
  revalidatePath("/dashboard/manage/schedule");
  revalidatePath("/dashboard/schedule");
}
