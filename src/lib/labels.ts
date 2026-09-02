import type { AppRole } from "@/lib/guards";

export const ROLE_LABELS: Record<AppRole, string> = {
  STUDENT: "Ученик",
  TEACHER: "Учитель",
  GOD: "Бог",
};

export const SUBMISSION_STATUS_LABELS: Record<string, { label: string; tone: "lime" | "sun" | "coral" | "sky" }> = {
  SUBMITTED: { label: "На проверке", tone: "sun" },
  APPROVED: { label: "Принято", tone: "lime" },
  NEEDS_REVISION: { label: "На доработку", tone: "sky" },
  REJECTED: { label: "Отклонено", tone: "coral" },
};

export const DAY_LABELS = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
