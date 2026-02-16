/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Notebook` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notebook" ADD COLUMN     "code" VARCHAR(20);

-- CreateTable
CREATE TABLE "NotebookMember" (
    "id" SERIAL NOT NULL,
    "notebook_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotebookMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotebookMember_notebook_id_user_id_key" ON "NotebookMember"("notebook_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Notebook_code_key" ON "Notebook"("code");

-- AddForeignKey
ALTER TABLE "NotebookMember" ADD CONSTRAINT "NotebookMember_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotebookMember" ADD CONSTRAINT "NotebookMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
