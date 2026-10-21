/*
  Warnings:

  - Changed the type of `student_dept` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "student_dept",
ADD COLUMN     "student_dept" "Branch" NOT NULL;
