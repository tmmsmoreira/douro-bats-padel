-- Add tokenVersion column used to invalidate all outstanding refresh tokens
-- (e.g. after a password reset). Existing rows start at 0 so previously-issued
-- JWTs remain valid until their 7-day expiry.
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
