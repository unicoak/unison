-- CreateTable
CREATE TABLE "public"."XpTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "XpTransaction_userId_createdAt_idx" ON "public"."XpTransaction"("userId", "createdAt");
-- AddForeignKey
ALTER TABLE "public"."XpTransaction" ADD CONSTRAINT "XpTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "public"."XpTransaction" ADD CONSTRAINT "XpTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: approved quest submissions become history entries...
INSERT INTO "public"."XpTransaction" ("id", "userId", "amount", "reason", "createdAt")
SELECT 'bf' || md5(s."id"), s."studentId", s."xpAwarded", 'Квест «' || q."title" || '»', COALESCE(s."reviewedAt", s."submittedAt")
FROM "public"."QuestSubmission" s
JOIN "public"."Quest" q ON q."id" = s."questId"
WHERE s."status" = 'APPROVED' AND s."xpAwarded" IS NOT NULL AND s."xpAwarded" <> 0;

-- ...and whatever XP they have beyond that (manual awards, deleted quests) becomes one opening entry.
INSERT INTO "public"."XpTransaction" ("id", "userId", "amount", "reason", "createdAt")
SELECT 'bfb' || md5(p."userId"), p."userId", p."xp" - COALESCE(t."total", 0), 'Начисления до ведения истории', TIMESTAMP '2020-01-01 00:00:00'
FROM "public"."StudentProfile" p
LEFT JOIN (SELECT "userId", SUM("amount") AS "total" FROM "public"."XpTransaction" GROUP BY "userId") t ON t."userId" = p."userId"
WHERE p."xp" <> COALESCE(t."total", 0);
