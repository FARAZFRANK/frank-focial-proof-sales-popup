-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "maxVisitors" INTEGER DEFAULT 25;
ALTER TABLE "Settings" ADD COLUMN "minVisitors" INTEGER DEFAULT 5;
ALTER TABLE "Settings" ADD COLUMN "showVisitorCount" BOOLEAN DEFAULT false;
