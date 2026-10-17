-- Availability lifecycle for saved repos: track when a repo's GitHub node
-- stopped resolving, and when it was archived after the grace period.
-- AlterTable
ALTER TABLE "SavedRepo" ADD COLUMN "unavailableSince" TIMESTAMP(3);
ALTER TABLE "SavedRepo" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SavedRepo_userId_archivedAt_idx" ON "SavedRepo"("userId", "archivedAt");
