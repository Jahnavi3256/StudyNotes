-- CreateEnum
CREATE TYPE "NotebookType" AS ENUM ('PERSONAL', 'SHARED');

-- AlterTable
ALTER TABLE "Notebook" ADD COLUMN     "type" "NotebookType" NOT NULL DEFAULT 'PERSONAL';
