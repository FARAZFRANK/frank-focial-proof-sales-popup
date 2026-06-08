-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "displayDuration" INTEGER DEFAULT 5000;
ALTER TABLE "Settings" ADD COLUMN "initialDelay" INTEGER DEFAULT 3000;
ALTER TABLE "Settings" ADD COLUMN "position" TEXT DEFAULT 'bottom-left';
