# Email Change Flow

**Status:** Proposed design — not implemented. Build when a user-facing need arises.

## Context

After auto-verifying users on invitation redemption and Google OAuth, the email-verification mechanism is otherwise idle: `emailVerified` is effectively always `true` for live users, and `UpdateProfileDto` does not currently accept `email`. There is no way for a user to change their email address today.

When that capability is added, the verification machinery becomes load-bearing again — but only inside the change flow, not as a global gate.

## Design Principle

The `User.email` column **always reflects a verified, working address**. Login, password reset, and notifications must keep working continuously through any change. We achieve this with a `pendingEmail` staging column: the change applies only after the new address proves itself.

## Schema additions

Add to the `User` Prisma model:

```prisma
pendingEmail         String?
pendingEmailToken    String?
pendingEmailExpires  DateTime?
```

Reuse the existing `emailVerificationToken` / `emailVerificationExpires` columns? **No** — keep them separate. The semantics differ: pending change vs. initial verification. Mixing them complicates rollback and audit.

The existing `verifyEmail()`, `sendVerificationEmail()`, and the email template can be **adapted** (not reused as-is) for the change-confirm step.

## Endpoints

### `POST /auth/email-change-request`

Body: `{ newEmail: string, currentPassword: string }`

1. Re-verify password (sensitive action — never trust an active session alone for account-takeover-class changes).
2. Reject if `newEmail` already exists on another `User`.
3. Reject if `newEmail === user.email` (no-op).
4. Generate a SHA-256-hashed token and 24h expiry, store on `pendingEmail*` columns.
5. Send the verification link to the **new** address only. The old address gets nothing yet.

Returns: neutral message ("If the address is available, we sent a verification link"). Do **not** leak whether the address is already taken — that's enumeration.

### `POST /auth/email-change-confirm`

Body: `{ token: string }`

1. Hash the token, look up the user by `pendingEmailToken`, validate `pendingEmailExpires`.
2. Re-check that `pendingEmail` is still unique (race — someone else may have claimed it).
3. In a single transaction:
   - `email = pendingEmail`
   - clear `pendingEmail`, `pendingEmailToken`, `pendingEmailExpires`
   - bump `tokenVersion` (logs out other devices on the next refresh)
   - `emailVerified` stays `true` — the new address is now proven.
4. Send a heads-up email to the **old** address: "Your account email was changed. If this wasn't you, contact us." This is the audit/rollback signal.

### Optional: `POST /auth/email-change-cancel`

Lets a user abort a pending change without waiting for expiry. Not strictly necessary — they can also just not click the link.

## Frontend

A "Change email" form on the profile/account page:

- Inputs: new email, current password
- After submit, show a "Check your inbox at *new@example.com*" state
- Pending state visible in the UI with a cancel button

Add a route handler at `/auth/confirm-email-change?token=…` that calls the confirm endpoint and signs the user out (because `tokenVersion` was bumped) with a success toast.

## What stays the same

- Login does **not** check `emailVerified` (already removed). The `email` column is always verified, so there's nothing to gate.
- `forgot-password` continues to send to `email` — safe because `email` is always proven.
- Invitation/signup flow does not touch any of this.
- Google OAuth: the email is set by Google; if a user wants to change it, they go through this flow like anyone else.

## Out of scope

- Letting Google-only accounts (no `passwordHash`) change their email — they'd need to set a password first, or we add a magic-link reauth instead of password reauth.
- Multi-email-per-user. Keep one canonical email.
- Allowing admin-initiated email changes from the admin panel (skip unless requested).

## Rough effort

- Migration + schema: 1 file
- Two endpoints + DTOs + service methods: ~150 LoC
- Tests: ~6 cases (happy path, expired token, taken address, race on confirm, password reauth fail, cancel)
- Email template: adapt the existing verification template
- Frontend form + confirm route: ~100 LoC
- Total: ~1 day of focused work

---

# Follow-up: Profile picture hosting

**Status:** Proposed design — not implemented. Build when Google avatars start breaking in production, or when a user asks to upload a custom photo.

## Context

`User.profilePhoto` is a string URL today. For Google OAuth users, that URL points at Google's CDN (`lh3.googleusercontent.com/...`). For email/password users, the field is just whatever URL they paste (rare in practice — most users either have a Google photo or no photo, falling back to initials).

Two real problems with the URL-only approach:

1. **Google CDN URLs rotate / rate-limit**. Avatars silently break over time and fall back to initials.
2. **Third-party tracking**. Every page that renders an avatar leaks the viewer's IP and user-agent to Google.

A full upload UX (drag-drop, crop, multiple sizes, EXIF strip) is overkill for this club's scale. A cheaper middle path solves both problems without changing the schema.

## Recommended approach: mirror Google's photo to our own storage

On the Google OAuth path, instead of storing Google's URL, fetch the photo once and store our own copy.

1. After Google auth resolves the user's photo URL, download the bytes server-side (with timeout + size cap).
2. Validate: must be image/\*, must be ≤ ~2MB, must decode (use `sharp` or similar).
3. Re-encode to a single canonical size (e.g. 256×256 WebP) — cheap, strips EXIF, normalizes format.
4. Upload to object storage under a deterministic key like `avatars/{userId}.webp`.
5. Store the public URL of _our copy_ in `User.profilePhoto`.
6. Re-mirror on subsequent Google sign-ins only if the upstream URL has changed (track the source URL in a separate column, or a hash).

**Object storage choice:** Cloudflare R2 is the path of least resistance — zero egress fees, S3-compatible API, free tier likely covers this club indefinitely. Supabase Storage or plain S3 work equally well.

## What stays the same

- The `profilePhoto: string` column. No migration.
- All frontend code reading the field.
- The fallback to initials when `profilePhoto` is null.
- Email/password users without a custom photo (still null until upload UX exists).

## What changes

- New env vars for the object store (endpoint, bucket, access keys).
- One new server-side helper: `mirrorRemoteImage(url) → publicUrl`.
- The `googleAuth` create + update branches call the helper before persisting.
- A tiny background job (or just lazy on next sign-in) to backfill existing Google avatars over to mirrored copies.

## Adding a real upload UX later

Once the bucket exists, the upload feature becomes:

- `POST /auth/profile-photo/upload-url` returns a presigned PUT URL → client uploads directly to R2.
- Server validates the uploaded object (size, format) and updates `User.profilePhoto` to point at the mirrored key.
- Frontend gains a drag-drop + crop component on the profile edit screen.

Estimated incremental effort once the mirror groundwork exists: half a day.

## Out of scope

- Multiple sizes per avatar (single 256×256 is enough for the entire app).
- A full media library / re-using uploaded images elsewhere.
- Moderation tooling — invite-only, low risk.
- Migrating existing email/password users' arbitrary URLs to the bucket; leave them alone, mirror only on next change.

## Rough effort (mirror only)

- R2 bucket provisioning + env vars: 1 hour
- `mirrorRemoteImage` helper with `sharp` re-encode: ~50 LoC
- Hook into `googleAuth` create/update: ~10 LoC
- Tests: 3 cases (happy path, oversize, non-image)
- Total: half a day
