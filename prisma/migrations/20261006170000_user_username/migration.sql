-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
