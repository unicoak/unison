import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный e-mail"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Минимум 2 символа").max(60),
  email: z.string().trim().toLowerCase().email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов").max(100),
});

export const questSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(120),
  description: z.string().trim().min(3, "Добавьте описание").max(4000),
  xpReward: z.coerce.number().int().min(0).max(100000),
  dueAt: z.string().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
});

export const submissionSchema = z.object({
  questId: z.string(),
  textContent: z.string().trim().max(4000).optional(),
  links: z.array(z.string().trim().url("Некорректная ссылка")).max(10).optional(),
});

export const reviewSchema = z.object({
  submissionId: z.string(),
  decision: z.enum(["APPROVED", "NEEDS_REVISION", "REJECTED"]),
  teacherComment: z.string().trim().max(2000).optional(),
  xpOverride: z.coerce.number().int().min(0).max(100000).optional(),
});

export const manualXpSchema = z.object({
  studentId: z.string(),
  amount: z.coerce.number().int().min(-100000).max(100000),
  reason: z.string().trim().max(300).optional(),
});

export const awardAchievementSchema = z.object({
  studentId: z.string(),
  achievementId: z.string(),
});

export const scheduleSlotSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Формат ЧЧ:ММ"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Формат ЧЧ:ММ"),
  subject: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
});

export const curriculumSectionSchema = z.object({
  title: z.string().trim().min(1).max(150),
  order: z.coerce.number().int().min(0).max(10000),
  period: z.string().trim().min(1).max(60),
  description: z.string().trim().max(4000),
  resources: z
    .array(z.object({ label: z.string().trim().min(1).max(120), url: z.string().trim().url() }))
    .max(20)
    .optional(),
});
