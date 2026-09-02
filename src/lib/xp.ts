import { prisma } from "@/lib/prisma";

export type LevelDef = { level: number; requiredXp: number; title: string };

export function computeLevelFromDefs(xp: number, defs: LevelDef[]) {
  const sorted = [...defs].sort((a, b) => a.level - b.level);
  const base: LevelDef = sorted[0] ?? { level: 1, requiredXp: 0, title: "Новичок" };
  let current = base;
  for (const def of sorted) {
    if (xp >= def.requiredXp) current = def;
    else break;
  }
  const currentIndex = sorted.findIndex((d) => d.level === current.level);
  const next = sorted[currentIndex + 1];
  const xpIntoLevel = xp - current.requiredXp;
  const xpForNextLevel = next ? next.requiredXp - current.requiredXp : null;
  const progressPercent =
    next && xpForNextLevel ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;

  return {
    level: current.level,
    title: current.title,
    xp,
    xpIntoLevel,
    xpForNextLevel,
    nextLevel: next?.level ?? null,
    nextTitle: next?.title ?? null,
    progressPercent,
    isMaxLevel: !next,
  };
}

export async function getLevelDefinitions() {
  return prisma.levelDefinition.findMany({ orderBy: { level: "asc" } });
}

export async function getStudentXpSummary(userId: string) {
  const [profile, defs] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    getLevelDefinitions(),
  ]);
  if (!profile) return null;
  return { ...computeLevelFromDefs(profile.xp, defs), raw: profile };
}

/**
 * Increments a student's XP, recomputes level/title, and reports whether
 * the student leveled up (so the caller can trigger a celebration).
 */
export async function awardXp(userId: string, amount: number) {
  const defs = await getLevelDefinitions();
  const beforeUpdate = await prisma.studentProfile.update({
    where: { userId },
    data: { xp: { increment: amount } },
  });
  const result = computeLevelFromDefs(beforeUpdate.xp, defs);
  const leveledUp = result.level > beforeUpdate.level;

  if (leveledUp || result.title !== beforeUpdate.title) {
    await prisma.studentProfile.update({
      where: { userId },
      data: {
        level: result.level,
        title: result.title,
        ...(leveledUp ? { celebrateLevel: result.level } : {}),
      },
    });
  }

  return { ...result, leveledUp, previousLevel: beforeUpdate.level };
}
