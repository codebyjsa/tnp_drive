-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CSE', 'IT', 'RAI', 'ME', 'CE', 'EE', 'ECE', 'BCA', 'MCA', 'BBA', 'MBA', 'BVoc', 'BArch');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP');

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" UUID NOT NULL,
    "admin_name" TEXT NOT NULL,
    "admin_email" TEXT NOT NULL,
    "admin_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" BIGSERIAL NOT NULL,
    "admin_id" UUID NOT NULL,
    "student_name" TEXT NOT NULL,
    "crn" BIGINT NOT NULL,
    "urn" BIGINT NOT NULL,
    "student_dept" TEXT NOT NULL,
    "student_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "teacher_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "teacher_dept" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "Placement_posts" (
    "placement_id" BIGSERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "job_Role" TEXT NOT NULL,
    "drive_date" TIMESTAMP(3) NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "eligible_branches" "Branch"[],
    "min_cgpa" DOUBLE PRECISION NOT NULL,
    "job_type" "JobType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_posts_pkey" PRIMARY KEY ("placement_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_admin_email_key" ON "Admin"("admin_email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_crn_key" ON "Student"("crn");

-- CreateIndex
CREATE UNIQUE INDEX "Student_urn_key" ON "Student"("urn");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("admin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("admin_id") ON DELETE RESTRICT ON UPDATE CASCADE;
