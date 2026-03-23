-- CreateTable: Sector
CREATE TABLE "Sector" (
    "id"        SERIAL NOT NULL,
    "name"      VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Sector name unique
CREATE UNIQUE INDEX "Sector_name_key" ON "Sector"("name");

-- CreateTable: JobType
CREATE TABLE "JobType" (
    "id"        SERIAL NOT NULL,
    "name"      VARCHAR(100) NOT NULL,
    "sectorId"  INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: JobType unique (name, sectorId)
CREATE UNIQUE INDEX "JobType_name_sectorId_key" ON "JobType"("name", "sectorId");

-- AddForeignKey: JobType.sectorId -> Sector.id
ALTER TABLE "JobType" ADD CONSTRAINT "JobType_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
