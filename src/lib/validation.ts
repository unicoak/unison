import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().trim().toLowerCase().min(1, "Введите e-mail или никнейм"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Минимум 2 символа").max(60),
  email: z.string().trim().toLowerCase().email("Введите корректный e-mail"),
  password: z.string().min(6, "Минимум 6 символов").max(100),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(6, "Минимум 6 символов").max(100),
});

export const questSchema = z.object({
  title: z.string().trim().min(3, "Минимум 3 символа").max(120),
  description: z.string().trim().min(3, "Добавьте описание").max(4000),
  xpReward: z.coerce.number().int().min(0).max(100000),
  dueAt: z.string().optional().nullable(),
  achievementId: z.string().optional(),
  availableAt: z.string().optional(),
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
  number: z
    .string()
    .trim()
    .regex(/^\d{1,5}(\.\d{1,5}){0,3}$/, "Номер: цифры, можно через точку — например 3 или 1.2"),
  period: z.string().trim().min(1).max(60),
  description: z.string().trim().max(4000),
  resources: z
    .array(z.object({ label: z.string().trim().min(1).max(120), url: z.string().trim().url() }))
    .max(20)
    .optional(),
});

export const achievementSchema = z.object({
  name: z.string().trim().min(2, "Название: минимум 2 символа").max(60),
  description: z.string().trim().min(2, "Добавьте описание").max(300),
  icon: z.string().trim().min(1, "Укажите эмодзи").max(8, "Иконка — одно эмодзи"),
  secret: z.boolean(),
});

export const forumTopicSchema = z.object({
  title: z.string().trim().min(3, "Заголовок: минимум 3 символа").max(120),
  body: z.string().trim().min(1, "Напишите сообщение").max(4000),
});

export const forumPostSchema = z.object({
  topicId: z.string().min(1),
  body: z.string().trim().min(1, "Напишите сообщение").max(4000),
});

export const levelLadderSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1, "У каждого уровня должно быть название").max(40, "Название уровня: максимум 40 символов"),
      requiredXp: z.coerce.number().int("XP — целое число").min(0, "XP не может быть отрицательным").max(10000000),
    }),
  )
  .min(1, "Нужен хотя бы один уровень")
  .max(50, "Не больше 50 уровней")
  .superRefine((rows, ctx) => {
    if (rows[0] && rows[0].requiredXp !== 0) {
      ctx.addIssue({ code: "custom", message: "Первый уровень должен начинаться с 0 XP" });
    }
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].requiredXp <= rows[i - 1].requiredXp) {
        ctx.addIssue({
          code: "custom",
          message: `Уровень ${i + 1}: XP должен быть больше, чем у уровня ${i}`,
        });
        break;
      }
    }
  });

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.-]{3,30}$/, "Никнейм: 3–30 символов, латиница, цифры и . _ -");

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя").max(40),
  lastName: z.string().trim().min(1, "Введите фамилию").max(40),
  username: usernameSchema,
  password: z.string().min(6, "Пароль: минимум 6 символов").max(100),
});
