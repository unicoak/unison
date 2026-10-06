import type { Prisma } from "@prisma/client";

/** The site works in Sakhalin time, UTC+11 with no DST (the footer shows it too). */
export const SITE_UTC_OFFSET = "+11:00";

/** Parses a `datetime-local` value ("2026-10-10T15:00") as Sakhalin time. */
export function parseSiteDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${SITE_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatSiteDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Sakhalin",
  }).format(date);
}

/** Prisma filter for quests a student may already see. */
export function questOpenedFilter(now = new Date()): Prisma.QuestWhereInput {
  return { OR: [{ availableAt: null }, { availableAt: { lte: now } }] };
}
