-- CreateEnum
CREATE TYPE "public"."TestXpMode" AS ENUM ('NONE', 'PER_QUESTION', 'TOTAL');

-- AlterTable
ALTER TABLE "public"."Test" ADD COLUMN     "availableAt" TIMESTAMP(3),
ADD COLUMN     "xpMode" "public"."TestXpMode" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "xpTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."TestQuestion" ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."TestAttempt" ADD COLUMN     "xpAwarded" INTEGER NOT NULL DEFAULT 0;
