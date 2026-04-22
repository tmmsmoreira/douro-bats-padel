-- Promote any existing EDITOR user to ADMIN before we drop the enum value.
-- Replaces EDITOR with ADMIN in the roles array and de-duplicates the result.
UPDATE "User"
SET "roles" = (
  SELECT COALESCE(array_agg(DISTINCT role ORDER BY role), ARRAY[]::"Role"[])
  FROM unnest(
    array_replace("roles", 'EDITOR'::"Role", 'ADMIN'::"Role")
  ) AS role
)
WHERE 'EDITOR'::"Role" = ANY("roles");

-- Drop the EDITOR value from the Role enum by rebuilding the type.
-- Postgres does not support dropping individual enum values, so we create a
-- new enum without EDITOR, migrate the column, then rename it into place.
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('VIEWER', 'ADMIN');

ALTER TABLE "User"
  ALTER COLUMN "roles" TYPE "Role"[]
  USING "roles"::text[]::"Role"[];

DROP TYPE "Role_old";
