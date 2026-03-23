-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECRUITER');

-- AlterTable: rewrite User model
ALTER TABLE "User"
  ADD COLUMN "login"        TEXT,
  ADD COLUMN "firstName"    TEXT,
  ADD COLUMN "lastName"     TEXT,
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "role"         "Role" NOT NULL DEFAULT 'RECRUITER',
  ADD COLUMN "active"       BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "User" SET
  "login"        = email,
  "firstName"    = COALESCE(name, 'Unknown'),
  "lastName"     = '',
  "passwordHash" = '$2b$12$placeholder.hash.for.migration.only';

ALTER TABLE "User"
  ALTER COLUMN "login"        SET NOT NULL,
  ALTER COLUMN "firstName"    SET NOT NULL,
  ALTER COLUMN "lastName"     SET NOT NULL,
  ALTER COLUMN "passwordHash" SET NOT NULL;

-- CreateIndex
ALTER TABLE "User" ADD CONSTRAINT "User_login_key" UNIQUE ("login");

-- DropColumn
ALTER TABLE "User" DROP COLUMN "name";
