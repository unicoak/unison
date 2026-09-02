import { prisma } from "@/lib/prisma";

/** Achievement codes auto-awarded by the platform (seeded in prisma/seed.ts). */
export const AUTO_ACHIEVEMENT_CODES = {
  FIRST_QUEST: "first-quest",
  FIVE_QUESTS: "five-quests",
  STREAK_LEVEL_5: "level-5",
} as const;

async function grantIfMissing(userId: string, code: string) {
  const achievement = await prisma.achievement.findUnique({ where: { code } });
  if (!achievement) return;

  await prisma.userAchievement.upsert({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
    update: {},
    create: { userId, achievementId: achievement.id },
  });
}

/** Called after a submission is approved — checks simple milestone triggers. */
export async function checkSubmissionAchievements(studentId: string) {
  const approvedCount = await prisma.questSubmission.count({
    where: { studentId, status: "APPROVED" },
  });

  if (approvedCount === 1) await grantIfMissing(studentId, AUTO_ACHIEVEMENT_CODES.FIRST_QUEST);
  if (approvedCount === 5) await grantIfMissing(studentId, AUTO_ACHIEVEMENT_CODES.FIVE_QUESTS);
}

/** Called after XP/level recompute — checks level-based milestone triggers. */
export async function checkLevelAchievements(studentId: string, level: number) {
  if (level >= 5) await grantIfMissing(studentId, AUTO_ACHIEVEMENT_CODES.STREAK_LEVEL_5);
}
