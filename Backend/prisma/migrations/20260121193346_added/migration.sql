/*
  Warnings:

  - Added the required column `notebook_id` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "notebook_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Notebook" ADD COLUMN     "folder_id" TEXT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
