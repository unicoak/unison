import { prisma } from "@/lib/prisma";
import { SUBMISSION_STATUS_LABELS } from "@/lib/labels";

export type Cell = string | number | null;
export type Table = { key: ExportType; title: string; headers: string[]; rows: Cell[][] };

export const EXPORT_TYPES = ["students", "quests", "submissions", "tests", "xp"] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export const EXPORT_INFO: Record<ExportType, { title: string; description: string }> = {
  students: {
    title: "Ученики",
    description: "Уровень, XP, сколько квестов назначено / сдано / принято, тесты, ачивки",
  },
  quests: { title: "Квесты", description: "По каждому квесту: сколько назначено, сдано, принято, не сдано" },
  submissions: {
    title: "Сдачи квестов",
    description: "Каждая пара «ученик — квест»: статус, полученный XP, даты, комментарий (включая несданные)",
  },
  tests: { title: "Результаты тестов", description: "Каждая пара «ученик — тест»: баллы, максимум, процент" },
  xp: { title: "История опыта", description: "Все начисления и списания XP с причинами" },
};

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Sakhalin",
});
const fmt = (d: Date | null | undefined): string => (d ? dateFmt.format(d) : "");

const percent = (score: number, max: number) => (max > 0 ? Math.round((score / max) * 100) : 0);

async function studentsTable(): Promise<Table> {
  const [students, assignments, submissions, testAssignments, attempts, achievements] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { studentProfile: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.questAssignment.findMany({ select: { studentId: true } }),
    prisma.questSubmission.findMany({ select: { studentId: true, status: true } }),
    prisma.testAssignment.findMany({ select: { studentId: true } }),
    prisma.testAttempt.findMany({ select: { studentId: true, score: true, maxScore: true, status: true } }),
    prisma.userAchievement.groupBy({ by: ["userId"], _count: { _all: true } }),
  ]);

  const count = <T extends { studentId: string }>(rows: T[], id: string, pred: (r: T) => boolean = () => true) =>
    rows.filter((r) => r.studentId === id && pred(r)).length;
  const achievementCount = new Map(achievements.map((a) => [a.userId, a._count._all]));

  return {
    key: "students",
    title: "Ученики",
    headers: [
      "Имя и фамилия",
      "Никнейм",
      "E-mail",
      "Уровень",
      "Звание",
      "XP",
      "Квестов назначено",
      "Сдано",
      "Принято",
      "На проверке",
      "На доработке",
      "Отклонено",
      "Не сдано",
      "Ачивок получено",
      "Тестов выдано",
      "Тестов сдано",
      "Средний % по тестам",
      "Зарегистрирован",
    ],
    rows: students.map((s) => {
      const assigned = count(assignments, s.id);
      const submitted = count(submissions, s.id);
      const graded = attempts.filter((a) => a.studentId === s.id && a.status === "GRADED");
      const avg = graded.length
        ? Math.round(graded.reduce((sum, a) => sum + percent(a.score, a.maxScore), 0) / graded.length)
        : null;
      return [
        s.displayName,
        s.username ?? "",
        s.email ?? "",
        s.studentProfile?.level ?? 1,
        s.studentProfile?.title ?? "",
        s.studentProfile?.xp ?? 0,
        assigned,
        submitted,
        count(submissions, s.id, (r) => r.status === "APPROVED"),
        count(submissions, s.id, (r) => r.status === "SUBMITTED"),
        count(submissions, s.id, (r) => r.status === "NEEDS_REVISION"),
        count(submissions, s.id, (r) => r.status === "REJECTED"),
        Math.max(0, assigned - submitted),
        achievementCount.get(s.id) ?? 0,
        count(testAssignments, s.id),
        count(attempts, s.id),
        avg,
        fmt(s.createdAt),
      ];
    }),
  };
}

async function questsTable(): Promise<Table> {
  const quests = await prisma.quest.findMany({
    include: { assignments: { select: { id: true } }, submissions: { select: { status: true } }, achievement: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    key: "quests",
    title: "Квесты",
    headers: [
      "Квест",
      "Награда, XP",
      "Ачивка",
      "Статус",
      "Дедлайн",
      "Откроется",
      "Создан",
      "Назначено",
      "Сдано",
      "Принято",
      "На проверке",
      "На доработке",
      "Отклонено",
      "Не сдано",
    ],
    rows: quests.map((q) => {
      const by = (st: string) => q.submissions.filter((s) => s.status === st).length;
      return [
        q.title,
        q.xpReward,
        q.achievement?.name ?? "",
        q.status === "CLOSED" ? "Закрыт" : "Открыт",
        fmt(q.dueAt),
        fmt(q.availableAt),
        fmt(q.createdAt),
        q.assignments.length,
        q.submissions.length,
        by("APPROVED"),
        by("SUBMITTED"),
        by("NEEDS_REVISION"),
        by("REJECTED"),
        Math.max(0, q.assignments.length - q.submissions.length),
      ];
    }),
  };
}

async function submissionsTable(): Promise<Table> {
  const assignments = await prisma.questAssignment.findMany({
    include: {
      student: { select: { displayName: true, username: true } },
      quest: { include: { submissions: true } },
    },
    orderBy: [{ quest: { createdAt: "desc" } }, { student: { displayName: "asc" } }],
  });
  return {
    key: "submissions",
    title: "Сдачи квестов",
    headers: ["Ученик", "Никнейм", "Квест", "Статус", "XP получено", "Сдан", "Проверен", "Комментарий учителя"],
    rows: assignments.map((a) => {
      const sub = a.quest.submissions.find((s) => s.studentId === a.studentId);
      return [
        a.student.displayName,
        a.student.username ?? "",
        a.quest.title,
        sub ? SUBMISSION_STATUS_LABELS[sub.status].label : "Не сдано",
        sub?.xpAwarded ?? null,
        fmt(sub?.submittedAt),
        fmt(sub?.reviewedAt),
        sub?.teacherComment ?? "",
      ];
    }),
  };
}

async function testsTable(): Promise<Table> {
  const assignments = await prisma.testAssignment.findMany({
    include: {
      student: { select: { displayName: true, username: true } },
      test: { include: { attempts: true, questions: { select: { points: true } } } },
    },
    orderBy: [{ test: { createdAt: "desc" } }, { student: { displayName: "asc" } }],
  });
  return {
    key: "tests",
    title: "Результаты тестов",
    headers: ["Ученик", "Никнейм", "Тест", "Статус", "Баллы", "Максимум", "Процент", "Сдан"],
    rows: assignments.map((a) => {
      const att = a.test.attempts.find((x) => x.studentId === a.studentId);
      const max = a.test.questions.reduce((s, q) => s + q.points, 0);
      return [
        a.student.displayName,
        a.student.username ?? "",
        a.test.title,
        !att ? "Не сдано" : att.status === "SUBMITTED" ? "На проверке" : "Оценено",
        att ? att.score : null,
        att?.maxScore ?? max,
        att && att.status === "GRADED" ? percent(att.score, att.maxScore) : null,
        fmt(att?.submittedAt),
      ];
    }),
  };
}

async function xpTable(): Promise<Table> {
  const entries = await prisma.xpTransaction.findMany({
    include: {
      user: { select: { displayName: true, username: true } },
      createdBy: { select: { displayName: true } },
    },
    orderBy: [{ user: { displayName: "asc" } }, { createdAt: "asc" }],
  });
  return {
    key: "xp",
    title: "История опыта",
    headers: ["Ученик", "Никнейм", "Дата", "Изменение XP", "Причина", "Кто начислил"],
    rows: entries.map((e) => [
      e.user.displayName,
      e.user.username ?? "",
      e.createdAt.getFullYear() <= 2020 ? "раньше" : fmt(e.createdAt),
      e.amount,
      e.reason,
      e.createdBy?.displayName ?? "",
    ]),
  };
}

const BUILDERS: Record<ExportType, () => Promise<Table>> = {
  students: studentsTable,
  quests: questsTable,
  submissions: submissionsTable,
  tests: testsTable,
  xp: xpTable,
};

export function buildTable(type: ExportType) {
  return BUILDERS[type]();
}

export async function buildAllTables() {
  return Promise.all(EXPORT_TYPES.map((t) => BUILDERS[t]()));
}

/** Stops spreadsheets from running a cell as a formula (=, +, -, @ at the start). */
function safe(cell: Cell): Cell {
  return typeof cell === "string" && /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
}

/** Semicolon-separated with a BOM: Russian-locale Excel opens this with the right columns and encoding. */
export function toCsv(table: Table) {
  const esc = (c: Cell) => {
    const v = safe(c);
    const s = v === null ? "" : String(v);
    return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [table.headers, ...table.rows].map((r) => r.map(esc).join(";"));
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export async function toXlsx(tables: Table[]): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Школа блогеров";
  for (const t of tables) {
    const ws = wb.addWorksheet(t.title.slice(0, 31));
    ws.addRow(t.headers).font = { bold: true };
    t.rows.forEach((r) => ws.addRow(r.map(safe)));
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: t.headers.length } };
    ws.columns.forEach((col, i) => {
      const longest = Math.max(t.headers[i].length, ...t.rows.map((r) => String(r[i] ?? "").length));
      col.width = Math.min(50, Math.max(10, longest + 2));
    });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
