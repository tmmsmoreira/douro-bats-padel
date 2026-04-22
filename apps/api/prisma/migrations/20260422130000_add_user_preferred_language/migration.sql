-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'PT');

-- AlterTable: add preferredLanguage. Existing users default to PT (primary
-- audience is Portugal-based). New signups from the /en URL will override.
ALTER TABLE "User" ADD COLUMN "preferredLanguage" "Locale" NOT NULL DEFAULT 'PT';
