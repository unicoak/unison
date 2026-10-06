-- AlterTable
ALTER TABLE "public"."Quest" ADD COLUMN     "achievementId" TEXT;
-- AddForeignKey
ALTER TABLE "public"."Quest" ADD CONSTRAINT "Quest_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
