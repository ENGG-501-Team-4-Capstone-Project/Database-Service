CREATE EXTENSION IF NOT EXISTS vector;
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INSPECTOR', 'SUPERVISOR');

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "model_number" TEXT,
    "serial_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manuals" (
    "id" SERIAL NOT NULL,
    "equipment_type_id" INTEGER,
    "title" TEXT NOT NULL,
    "manufacturer" TEXT,
    "version" TEXT,
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manuals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_chunks" (
    "id" SERIAL NOT NULL,
    "manual_id" INTEGER NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "page_number" INTEGER,
    "section_title" TEXT,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INSPECTOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_requirements" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "equipment_type_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "inspection_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_criteria" (
    "id" SERIAL NOT NULL,
    "verifier_id" INTEGER NOT NULL,
    "inspection_requirement_id" INTEGER NOT NULL,
    "pass_condition" TEXT NOT NULL,
    "fail_condition" TEXT NOT NULL,

    CONSTRAINT "inspection_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_types_name_key" ON "equipment_types"("name");

-- CreateIndex
CREATE INDEX "equipment_equipment_type_id_idx" ON "equipment"("equipment_type_id");

-- CreateIndex
CREATE INDEX "manuals_equipment_type_id_idx" ON "manuals"("equipment_type_id");

-- CreateIndex
CREATE INDEX "manual_chunks_manual_id_idx" ON "manual_chunks"("manual_id");

-- CreateIndex
CREATE INDEX "inspection_requirements_equipment_type_id_idx" ON "inspection_requirements"("equipment_type_id");

-- CreateIndex
CREATE INDEX "inspection_requirements_creator_id_idx" ON "inspection_requirements"("creator_id");

-- CreateIndex
CREATE INDEX "inspection_criteria_verifier_id_idx" ON "inspection_criteria"("verifier_id");

-- CreateIndex
CREATE INDEX "inspection_criteria_inspection_requirement_id_idx" ON "inspection_criteria"("inspection_requirement_id");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_equipment_type_id_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manuals" ADD CONSTRAINT "manuals_equipment_type_id_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_chunks" ADD CONSTRAINT "manual_chunks_manual_id_fk" FOREIGN KEY ("manual_id") REFERENCES "manuals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_requirements" ADD CONSTRAINT "inspection_requirement_user_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_requirements" ADD CONSTRAINT "inspection_requirement_equipment_type_fk" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_criteria" ADD CONSTRAINT "inspection_criteria_user_fk" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_criteria" ADD CONSTRAINT "inspection_criteria_inspection_requirement_fk" FOREIGN KEY ("inspection_requirement_id") REFERENCES "inspection_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
