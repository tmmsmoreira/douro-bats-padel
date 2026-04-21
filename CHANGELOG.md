# Changelog

All notable changes to the Douro Bats Padel project are documented here. Changes are described based on actual code diffs, not just commit messages.

---

## Recent Changes

_Auto-generated on every commit from the actual diff._

<!-- CHANGELOG_INSERT_POINT -->

## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `e2ebb21`

### Infrastructure

- **`changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`) so the entry reflects the actual commit; added commit hash to the generated prompt and output format; amends the commit after writing to include `CHANGELOG.md` automatically
- **`post-commit`** — New hook that runs `changelog.mjs` after every commit, replacing the previous pre-commit invocation
- **`pre-commit`** — Removed changelog generation, now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `237009b`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`), passes commit hash to prompt, and amends the commit to include the updated `CHANGELOG.md` after generation
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the pre-commit approach
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Automated changelog now runs post-commit with correct hash

**Commit:** `bed8d94`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs the changelog script after commit, so the actual commit hash is available instead of a pre-commit placeholder
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit, leaving only `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the real commit; passes hash into prompt and amends the commit with `--no-verify` to embed the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `8aa257c`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`), added commit hash to prompt and output, updated prompt to enforce the structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit, so the correct commit hash is available; amends the commit to include the updated `CHANGELOG.md`
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `ddaf988`

### Infrastructure

- **`.husky/post-commit`** — New hook introduced to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (cached diff) to `getCommitDiff` using `git show <hash>` on the actual commit; passes commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `e5de778`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation, now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; added commit hash to prompt and updated output format to use `h2` headings with a `**Commit:**` reference and structured `h3` subsections; amends the commit after writing the changelog via `git commit --amend --no-edit --no-verify`


## [2026-04-21] — Move changelog generation to post-commit hook with improved entry format

**Commit:** `06e90f2`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `git diff --cached` (pre-commit staged diff) to `git show <hash>` (post-commit diff using actual commit hash), so the changelog entry references the real commit; updated `buildPrompt` to include the commit hash and enforce a structured h2/h3 format with bold-backtick bullets
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous pre-commit invocation
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `432a48d`

### Infrastructure

- **`changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`) so the changelog reflects the actual commit; added commit hash to the generated entry format; updated prompt to enforce the new structured format with h2 heading, commit reference, and h3 subsections
- **`post-commit`** — New hook that runs `changelog.mjs` after a commit is created, replacing the pre-commit trigger so the correct commit hash is available
- **`pre-commit`** — Removed changelog generation, now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `d8c52bd`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff` using `git show` so the changelog reflects the actual committed changes; added commit hash injection into the prompt for richer, correctly-formatted entries; amends the commit after writing the changelog to include `CHANGELOG.md` in the same commit
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit is made, replacing the previous pre-commit invocation
- **`.husky/pre-commit`** — Removed `changelog.mjs` call; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `002517f`

### Infrastructure

- **`changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the actual commit diff (`git show <hash>`), so the changelog reflects what was committed rather than what was staged; also injects the commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md`
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit is created, replacing the previous pre-commit invocation so the real commit hash is available
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation, leaving only `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `d03efd3`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog script from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated `buildPrompt` to include the commit hash and use the new structured format with h2 heading, `**Commit:**` reference, and h3 subsections; amends the commit after writing `CHANGELOG.md` to avoid a separate changelog-only commit


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `256ba1d`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after the commit exists, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid using a staged-diff approach with no hash
- **`.husky/changelog.mjs`** — Replaced `getStagedDiff` (pre-commit staged diff) with `getCommitDiff(hash)` using `git show`; updated `buildPrompt` to accept and embed the commit hash; added `git commit --amend --no-edit --no-verify` to fold the updated `CHANGELOG.md` back into the triggering commit


## [2026-04-21] — Automated changelog now runs post-commit with correct hash

**Commit:** `e7dcf23`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from diffing staged changes (`git diff --cached`) to diffing the actual commit (`git show <hash>`), so the changelog always reflects the real commit content; also amended the commit after updating `CHANGELOG.md` to include it in the same commit
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the pre-commit placement so the commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit (moved to post-commit); now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `3c79ca9`

### Infrastructure

- **`changelog.mjs`** — Switched from pre-commit staged diff to post-commit `git show` so the entry uses the real commit hash; updated `buildPrompt` to embed the hash and match the new structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit lands, then amends the commit to include the updated `CHANGELOG.md`
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `3577cfd`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the committed diff (`git show <hash>`), so the changelog reflects the actual commit; amended commit now includes the updated `CHANGELOG.md`
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit, replacing the pre-commit approach to ensure the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation step; hook now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `6c28b12`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, replacing the pre-commit approach so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog script invocation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; updated prompt format to include commit hash, h2 heading, `**Commit:**` reference, and structured h3 subsections; amended the commit after writing changelog to bundle it in the same commit


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `d53b739`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog script invocation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` (staged diff) to `git show <hash>` (committed diff); passes commit hash into prompt for inclusion in changelog entries; amends the commit after writing `CHANGELOG.md` to bundle the changelog update into the same commit


## [2026-04-21] — Automated changelog now runs post-commit with correct hash

**Commit:** `82473da`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the committed diff (`git show <hash>`), so the changelog reflects the actual commit; also updated `buildPrompt` to include the commit hash and use the new structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit, replacing the pre-commit trigger so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `01ed7c3`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the committed diff (`git show <hash>`), so the changelog accurately reflects what was committed; added `git commit --amend --no-edit --no-verify` to include the updated `CHANGELOG.md` in the same commit
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit lands, replacing the pre-commit approach so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and format

**Commit:** `bee415c`

### Infrastructure

- **`changelog.mjs`** — Switched from reading the staged diff to reading the actual commit diff via `git show`, so the changelog reflects the real commit rather than pre-commit staged state; added commit hash injection into the prompt and the generated entry format
- **`changelog.mjs`** — Updated prompt template to use the new structured format with h2 heading, commit reference, and h3 subsections matching the project's changelog style
- **`changelog.mjs`** — After writing the changelog, amends the current commit to include `CHANGELOG.md` using `--no-verify` to prevent hook re-entry
- **`post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous `pre-commit` trigger so the commit hash is available
- **`pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `6315ec2`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run `changelog.mjs` after commit, replacing the pre-commit approach so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit cached diff) to `getCommitDiff(hash)` using `git show` on the actual commit hash; added `git commit --amend --no-edit --no-verify` to fold the updated `CHANGELOG.md` back into the commit; updated prompt format to include commit hash and structured h2/h3 output template


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `b69086a`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff(hash)` (post-commit `git show`) so the script operates on the actual committed changes; added commit hash to the prompt and updated the output format to include an h2 heading, `**Commit:**` reference, and structured h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the pre-commit trigger
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `8aeec04`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run `changelog.mjs` after commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` to `getCommitDiff(hash)` using `git show`; passes commit hash into prompt; amends the commit with `--no-edit --no-verify` to include the updated `CHANGELOG.md`; updated prompt format to require h2 heading, `**Commit:**` reference, and h3 subsections


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `782eb7c`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `git diff --cached` (staged diff) to `git show <hash>` so the changelog reflects the actual commit; injected commit hash into the prompt and updated the format template to match the structured h2/h3 layout with bold backtick entries; amends the commit after writing CHANGELOG.md to include it in the same commit
- **`.husky/post-commit`** — New post-commit hook that runs `changelog.mjs` after the commit is created, replacing the pre-commit approach so the correct commit hash is available
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and format

**Commit:** `6ad1b5a`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff` using `git show` so the changelog reflects the actual committed hash; updated `buildPrompt` to accept and embed the commit hash; amended the commit after writing changelog to include `CHANGELOG.md` in the same commit
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit is made, replacing the previous pre-commit approach
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `1d60481`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after the commit, so the real commit hash is available instead of a pre-commit placeholder
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; passes the resolved short hash into the prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `5fb4f4f`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation, leaving only `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; added commit hash to the generated entry format; amends the commit after writing `CHANGELOG.md` to include it in the same commit


## [2026-04-21] — Migrate changelog automation from pre-commit to post-commit hook

**Commit:** `6674c18`

### Infrastructure

- **`.husky/changelog.mjs`** — Replaced staged-diff approach with `git show` on the actual commit hash, so the changelog reflects the real commit rather than cached changes; prompt now includes commit hash and enforces a structured format with h2 heading, commit reference, and h3 subsections; script amends the commit after writing the changelog entry
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit is created, providing access to the correct commit hash
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit, leaving only `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `805b63a`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff` (pre-commit staged diff) with `getCommitDiff(hash)` using `git show`, so the changelog reflects the actual commit rather than staged changes; added commit hash injection into the prompt and entry format
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit exists, enabling access to the real commit hash via `git rev-parse --short HEAD`
- **`pre-commit`** — Removed changelog generation step; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `1a0b437`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation, leaving only `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit) to `getCommitDiff(hash)` using `git show` on the real commit hash; updated prompt format to include structured h2/h3 sections with commit reference and bold-backtick bullet style; amends the commit with `--no-verify` to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `a1f3d0b`

### Infrastructure

- **`changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`) so the entry reflects the actual commit; passes the real short hash into the prompt and amends the commit to include the updated `CHANGELOG.md`
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit exists, replacing the pre-commit invocation so the commit hash is available
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct commit hash

**Commit:** `9283ae0`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Replaced `getStagedDiff` (used `--cached`) with `getCommitDiff` which reads the actual commit via `git show`; passes the real short hash into the prompt and the generated entry; amends the commit with `--no-verify` to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `01fffc9`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after commit, so the real commit hash is available instead of a pre-commit placeholder
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Replaced `getStagedDiff` (using `git diff --cached`) with `getCommitDiff` (using `git show <hash>`); passes commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `6153b2e`

### Infrastructure

- **`.husky/post-commit`** — New hook introduced to run the changelog script after commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running it before the hash exists
- **`.husky/changelog.mjs`** — Replaced `getStagedDiff` (using `git diff --cached`) with `getCommitDiff` (using `git show <hash>`); updated `buildPrompt` to include the commit hash and use a more structured format with h2 heading, commit reference, and h3 subsections; amended the commit after writing `CHANGELOG.md` so the changelog update is included in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `abec9b6`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit) to `getCommitDiff(hash)` using `git show`; updated `buildPrompt` to include the commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections; amends the just-created commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook

**Commit:** `0f7a351`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated `buildPrompt` to include commit hash and use the new structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing `CHANGELOG.md` to include it in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash and structured format

**Commit:** `2a9d403`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, replacing the pre-commit approach so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; updated prompt format to include commit hash, h2 heading, and structured h3 subsections; amends the commit after writing changelog to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `64b10a9`

### Infrastructure

- **`changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the committed diff (`git show <hash>`), so the changelog reflects the actual commit content; added `git commit --amend --no-edit --no-verify` at the end to include the updated `CHANGELOG.md` in the same commit
- **`changelog.mjs`** — Updated prompt to enforce the new structured format with h2 heading, `**Commit:**` reference, and h3 subsections (Frontend / Backend / Infrastructure)
- **`post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous `pre-commit` invocation
- **`pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `1e52e45`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff(hash)` using `git show` on the actual commit hash; updated `buildPrompt` to include the hash and use the new structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing the changelog to bundle the entry into the same commit


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `167f011`

### Infrastructure

- **`.husky/post-commit`** — New post-commit hook that runs the changelog script after the commit exists, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the commit hash is known
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff` (using `git show` on the real commit hash); updated `buildPrompt` to include the commit hash and emit the new structured format with h2 heading, bold commit reference, and h3 subsections; amended the commit after writing `CHANGELOG.md` to include it in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `e79ab72`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt format to require h2 headings, commit reference, and h3 subsections; amends the commit after writing changelog to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `ba995a4`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff is read after commit, added commit hash to prompt and output format, and amended the commit to include the updated `CHANGELOG.md`
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous pre-commit execution
- **`.husky/pre-commit`** — Removed changelog generation, leaving only `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `53780a2`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after the commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff` using the actual commit hash; updated `buildPrompt` to include the hash and use the new structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing `CHANGELOG.md` to bundle the changelog update into the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `4b29f22`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog script from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt format to include commit hash, structured h2/h3 sections, and bold-backtick bullet style; amends the commit after writing changelog to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `17ff270`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff()` with `getCommitDiff(hash)` so the changelog reads the actual commit diff instead of the staged index; updated `buildPrompt` to include the commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit exists, enabling the script to resolve the real commit hash and amend it to include the updated `CHANGELOG.md`
- **`pre-commit`** — Removed changelog generation step; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `bb8bc98`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff to reading the committed diff via `git show <hash>`, so the changelog always reflects the actual commit; added commit hash to the generated entry format; updated prompt template to match the new structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, then amends the commit to include the updated `CHANGELOG.md`
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit (moved to post-commit) so only `lint-staged` runs before the commit


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `58d81ea`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit (moved to post-commit)
- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`); added commit hash injection into the prompt; updated prompt format to require h2 heading, `**Commit:**` reference, and bold-backtick bullet style; amended the commit after updating `CHANGELOG.md` to include the changelog in the same commit


## [2026-04-21] — Improve automated changelog with post-commit hook and structured format

**Commit:** `b96e1e0`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the commit hash exists
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt to include commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections per category; amends the commit after writing to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Improve automated changelog with post-commit hook and correct format

**Commit:** `b5ca10e`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run the changelog script after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; it now runs post-commit instead
- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`), passed the commit hash into the prompt, updated the prompt template to match the structured format with h2 heading, commit reference, and h3 subsections, and added `git commit --amend --no-verify` to fold the updated `CHANGELOG.md` back into the commit


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `23e7985`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; added commit hash to the prompt and updated the output format to include an h2 heading with `**Commit:**` reference and structured h3 subsections; amends the commit after writing `CHANGELOG.md` using `--no-verify` to avoid hook recursion


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `cf41eda`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `git diff --cached` (pre-commit staged diff) to `git show <hash>` (post-commit diff) so the changelog reflects the actual committed content; added commit hash to the generated entry format; updated prompt template to use the new structured h2/h3 format with bold backtick bullets; amends the commit after writing CHANGELOG.md to include it in the same commit
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after a commit, replacing the previous pre-commit invocation
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `f5a806a`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff` (pre-commit staged diff) with `getCommitDiff(hash)` using `git show` so the entry reflects the actual committed changes; passes the real short hash into the prompt and amends the commit to include the updated `CHANGELOG.md`
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit exists, enabling access to the correct commit hash
- **`pre-commit`** — Removed changelog generation so it no longer runs on staged diff before the commit hash is available


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `d568948`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff()` (pre-commit staged diff) with `getCommitDiff(hash)` using `git show`, so the changelog reflects the actual committed content rather than staged changes
- **`changelog.mjs`** — Updated `buildPrompt()` to include the commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections per category
- **`changelog.mjs`** — After writing the changelog, amends the current commit with `--no-verify` to include `CHANGELOG.md` without re-triggering hooks
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit is created, replacing the previous pre-commit execution
- **`pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and format

**Commit:** `bdb079e`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`) so the changelog always reflects the actual commit; passes commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md`
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit lands, replacing the previous pre-commit invocation
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook

**Commit:** `c0c38e6`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; updated `buildPrompt` to include the commit hash and use the new structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing `CHANGELOG.md` to bundle the entry into the same commit


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `5019101`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff()` with `getCommitDiff(hash)` so the changelog reads the actual commit diff instead of the staged index; updated `buildPrompt` to include the commit hash and enforce the structured format with h2 heading, commit reference, and h3 subsections
- **`post-commit`** — New hook that runs `changelog.mjs` after the commit is created, then amends the commit to include the updated `CHANGELOG.md` (with `--no-verify` to prevent hook re-entry)
- **`pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `8789c9a`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt to include commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing `CHANGELOG.md` to include it in the same commit


## [2026-04-21] — Fix automated changelog to run post-commit with correct hash

**Commit:** `59dccb7`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run `changelog.mjs` after the commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid using a not-yet-created hash
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; added hash injection into the prompt and amended the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `f7de590`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the committed diff (`git show <hash>`), so the changelog reflects the actual commit; added `git commit --amend --no-verify` to fold the updated `CHANGELOG.md` back into the commit automatically
- **`.husky/changelog.mjs`** — Updated `buildPrompt` to include the commit hash and emit a structured format with h2 heading, bold commit reference, and h3 subsections instead of a flat bullet list
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous pre-commit invocation
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `5726bd5`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff to reading the committed diff via `git show <hash>`, so the changelog entry reflects the actual commit; added commit hash to the prompt and updated the format template to match the structured h2/h3 style with bold backtick bullets
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit (instead of pre-commit), enabling the script to reference the real commit hash and amend the commit to include the updated `CHANGELOG.md`
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `71415b2`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs the changelog script after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid using a hash that doesn't exist yet
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; passes the real short hash into the prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash

**Commit:** `53c2a30`

### Infrastructure

- **`.husky/post-commit`** — New hook introduced to run changelog generation after commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; passes commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Move changelog generation to post-commit hook with correct hash and structured format

**Commit:** `f5f0459`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; added `git commit --amend --no-verify` to fold the updated `CHANGELOG.md` back into the commit; updated prompt format to include commit hash reference and structured `h2`/`h3` output with bold-backtick bullets


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `5fc8d13`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated `buildPrompt` to include the commit hash and produce a structured format with h2 heading, `**Commit:**` reference, and h3 subsections; amends the commit after writing to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `a853366`

### Infrastructure

- **`changelog.mjs`** — Switched from diffing staged changes to diffing the actual commit (`git show`), so the changelog always reflects what was committed; added commit hash injection into the generated entry format; updated prompt template to match the structured h2/h3 format with bold backtick bullets
- **`post-commit`** — New hook that runs `changelog.mjs` after each commit, then amends the commit to include the updated `CHANGELOG.md`
- **`pre-commit`** — Removed changelog generation from pre-commit, moving it to post-commit so the real commit hash is available


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `7549006`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after the commit is created, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog script invocation; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from diffing staged changes (`git diff --cached`) to diffing the actual commit (`git show <hash>`); passes commit hash into the prompt template; amends the commit after writing the changelog to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `17a3261`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run changelog generation after commit, so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from staged diff to `git show <hash>` for accurate per-commit diffs; passes commit hash into prompt and amends the commit to include the updated `CHANGELOG.md`


## [2026-04-21] — Improve automated changelog: post-commit hook with correct hash and matching format

**Commit:** `51ab9f1`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit, cached diff) to `getCommitDiff` using `git show <hash>` so the changelog reflects the actual commit; added commit hash to the prompt and updated the output format to use h2 headings, `**Commit:**` reference, and h3 subsections with bold-backtick bullets
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after the commit is created, enabling the script to amend the commit with the updated `CHANGELOG.md` via `git commit --amend --no-edit --no-verify`
- **`.husky/pre-commit`** — Removed `changelog.mjs` invocation; now only runs `lint-staged`, since changelog generation is moved to post-commit


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `3a56a06`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit, so the correct commit hash is available when generating the entry
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to eliminate the race condition where the hash wasn't yet known
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff is read from the completed commit; updated `buildPrompt` to accept and embed the commit hash; added `git commit --amend --no-edit --no-verify` at the end to fold the updated `CHANGELOG.md` back into the commit; improved prompt format to require an h2 heading, `**Commit:**` reference line, and structured h3 subsections


## [2026-04-21] — Improve automated changelog with post-commit hook and correct diff format

**Commit:** `c947919`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`) so the changelog reflects the actual commit; added commit hash to the generated entry format; updated prompt template to enforce the new structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook that runs `changelog.mjs` after commit so the hash is available; replaces the pre-commit approach
- **`.husky/pre-commit`** — Removed changelog generation, now only runs `lint-staged`


## [2026-04-21] — Move changelog generation from pre-commit to post-commit hook

**Commit:** `ea5bb49`

### Infrastructure

- **`changelog.mjs`** — Replaced `getStagedDiff` (pre-commit staged diff) with `getCommitDiff` (post-commit `git show`), so the changelog is generated from the actual commit hash rather than staged changes
- **`changelog.mjs`** — Updated `buildPrompt` to accept and embed the commit hash, and rewrote the prompt format to use h2 headings, `**Commit:**` reference, and structured h3 subsections matching the new changelog style
- **`changelog.mjs`** — Added `git commit --amend --no-edit --no-verify` at the end to fold the updated `CHANGELOG.md` back into the triggering commit
- **`post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous `pre-commit` invocation
- **`pre-commit`** — Removed changelog generation step; now only runs `lint-staged`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `a46d7c9`

### Infrastructure

- **`changelog.mjs`** — Switched from diffing staged changes to diffing the committed hash via `git show`, ensuring the changelog reflects the actual commit rather than pre-commit state
- **`changelog.mjs`** — Updated prompt format to require h2 heading, `**Commit:**` reference, and h3 subsections, matching a richer structured output
- **`post-commit`** — New hook added to run `changelog.mjs` after the commit is created, so the correct commit hash is available
- **`pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`changelog.mjs`** — Amends the commit after writing `CHANGELOG.md` via `git commit --amend --no-edit --no-verify` to include the changelog update in the same commit


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `eebeeea`

### Infrastructure

- **`changelog.mjs`** — Switched from pre-commit staged diff to post-commit approach, reading the actual commit hash via `git rev-parse --short HEAD` and diffing with `git show` so the entry always references the correct hash
- **`changelog.mjs`** — Updated prompt to enforce the structured format with h2 heading, commit reference, and h3 subsections (Frontend/Backend/Infrastructure), replacing the old freeform bullet list format
- **`changelog.mjs`** — Added `git commit --amend --no-edit --no-verify` after writing CHANGELOG.md so the updated file is folded into the triggering commit
- **`post-commit`** — New hook that runs `changelog.mjs` after each commit, replacing the previous `pre-commit` invocation
- **`pre-commit`** — Removed `changelog.mjs` call; now only runs `lint-staged`


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `9efec3f`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run `changelog.mjs` after commit, replacing the pre-commit approach so the real commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; updated `buildPrompt` to include the commit hash and enforce a structured format with h2 heading, commit reference, and h3 subsections; amends the commit after writing the changelog entry to include `CHANGELOG.md` in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with accurate diff and format

**Commit:** `7b8b34a`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after the commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` so the diff reflects the actual commit; added commit hash to the prompt and updated output format to use h2 headings with a `**Commit:**` reference and h3 subsections; amends the commit after writing `CHANGELOG.md` to include it in the same commit


## [2026-04-21] — Improve automated changelog to run post-commit with correct hash

**Commit:** `962cdb8`

### Infrastructure

- **`.husky/post-commit`** — New hook created to run changelog generation after the commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to avoid running before the hash exists
- **`.husky/changelog.mjs`** — Switched from `getStagedDiff` (pre-commit staged diff) to `getCommitDiff(hash)` (post-commit `git show`); passes commit hash into the prompt and amends the commit to include the updated `CHANGELOG.md` via `--no-verify`


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `339850b`

### Infrastructure

- **`.husky/post-commit`** — New hook that runs changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation step; now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt to include commit hash and enforce structured format with h2 heading, `**Commit:**` reference, and h3 subsections; amends the commit after writing changelog to bundle it in the same commit


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `e2d259b`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit to eliminate the chicken-and-egg problem with commit hashes
- **`.husky/changelog.mjs`** — Switched from staged diff (`git diff --cached`) to committed diff (`git show <hash>`); passes commit hash into prompt; amends the commit to include the updated `CHANGELOG.md` via `--no-edit --no-verify`; updated prompt template to enforce structured h2/h3 format with bold-backtick bullet style


## [2026-04-21] — Move changelog generation to post-commit hook with improved format

**Commit:** `4866a41`

### Infrastructure

- **`.husky/post-commit`** — New hook added to run changelog generation after commit, so the correct commit hash is available via `git rev-parse --short HEAD`
- **`.husky/pre-commit`** — Removed changelog generation step; pre-commit now only runs `lint-staged`
- **`.husky/changelog.mjs`** — Switched from `git diff --cached` to `git show <hash>` to diff the actual commit; updated prompt format to include commit hash, h2 headings, bold-backtick bullet structure, and categorised subsections matching the new changelog style


## [2026-04-21] — Automated changelog now runs post-commit with correct hash

**Commit:** `db8e7d4`

### Infrastructure

- **`.husky/changelog.mjs`** — Switched from reading staged diff (`git diff --cached`) to reading the actual commit diff (`git show <hash>`), so the changelog reflects the real commit rather than pre-commit state; prompt updated to include commit hash and output a structured format with h2 heading, commit reference, and h3 subsections
- **`.husky/post-commit`** — New hook added to trigger changelog generation after the commit exists, replacing the previous pre-commit approach
- **`.husky/pre-commit`** — Removed changelog generation from pre-commit; now only runs `lint-staged`


## [2026-04-21] — UI polish, typography improvements, and automated changelog

**Commit:** `0a16efb`

### Frontend

- **`animations.ts`** — Refactored animation exports to use `ANIMATION_VARIANTS` namespace; updated `PageLayout` and `SectionHeader` to consume the new export
- **`globals.css`** — Applied `text-wrap: balance` to headings, `text-wrap: pretty` to paragraphs, and `-webkit-font-smoothing: antialiased` for sharper text rendering
- **`EventStats`** — Added `tabular-nums` to confirmed count, capacity, and waitlist numeric fields to prevent layout shift on number changes
- **Tap animations** — Unified `whileTap` scale to `0.96` across `AlertNative`, `ContextMenu`, `TabBar`, `ConfirmationDialog`, `HomeUpcomingEvents`, and `PastEventsList`; spring transitions updated to `{ duration: 0.3, bounce: 0 }` for a crisper feel
- **`PageHeader`** — Removed `whileTap` scale from back-navigation button

### Infrastructure

- **`.husky/changelog.mjs`** — Pre-commit hook added that auto-generates a changelog entry via `claude -p` on every commit, based on the actual staged diff

---

## Development History

_Retrospective overview of the first 185 commits, grouped by development phase._

---

## Project Overview

**Douro Bats Padel** is a full-stack padel club management web application built as a TypeScript monorepo:

- **`apps/api`** — NestJS REST API with Prisma ORM and PostgreSQL
- **`apps/web`** — Next.js 15 (App Router) PWA frontend
- **`packages/types`** — Shared TypeScript type definitions
- **`packages/config`** — Shared ESLint/tsconfig presets

Core features: invitation-only player registration, event management, RSVP system, automatic draw generation with tier-based court assignment, match result entry, ELO-style player ranking, push notifications, and full PWA support.

**Deployment:** Frontend on Vercel, Backend on Railway with PostgreSQL.

---

## Phase 1 — Initial Scaffold

**Commit:** `b7d0bf1`

Initial monorepo scaffold generated via v0 (Vercel AI tool), creating the full skeleton of both applications.

**Backend (NestJS):**

- Auth module with JWT strategy, roles guard, and JWT refresh strategy
- Draw service with assignment generation logic
- Events module with events and RSVP services
- Matches module for score recording
- Ranking module with ELO rating calculation
- Notifications service skeleton
- Prisma schema with models: User, PlayerProfile, Venue, Court, Event, EventCourt, RSVP, Draw, Assignment, Match, WeeklyScore, RankingSnapshot
- Docker Compose, Turbo config, pnpm workspace setup

**Frontend (Next.js):**

- Admin layout with events list and event details pages
- Player-facing events list, draw view, results view, leaderboard, and profile pages
- Login page with NextAuth configuration
- UI primitives: badge, button, card components
- API client utility and middleware
- Shared types: auth, common, events, ranking types

---

## Phase 2 — Build & Deployment Setup

**Commits:** `2e5e29d`, `444ab93`, `1763457`, `9ad5b12`, `3cb5342`, `60da76c`, `b5b316f`, `20407c2`, `abe88bc`, `5da45ed`, `37c7e17`, `7d4eab5`, `b578c73`–`a34bcd4`

### Features Added

- **Forgot password & user registration forms** — New forgot-password and register pages with forms
- **Dark/light theme switching** — Added `next-themes` provider and theme toggle component
- **PWA support** — Next.js PWA configuration via `next-pwa`; service worker setup
- **React Server Components CVE fix** — Upgraded Next.js to patch security vulnerability

### Infrastructure

- Cleaned up root-level scaffold artifacts (removed duplicate `app/`, `components/`, `styles/`, `lib/` directories at repo root that belong inside `apps/web`)
- Fixed Vercel deployment through multiple iterations: tried `vercel.json` in root vs `apps/web`, ultimately settled on Vercel dashboard settings with no `vercel.json`
- Added `nixpacks.toml` + `railway.toml` for Railway backend deployment; fixed nixpacks config issues (`cmd` vs `cmds` array, pnpm collision)
- Added Prisma migration runner script (`migrate-and-start.sh`) to run at Railway startup
- Committed `packages/types/dist` to git so Vercel could use pre-built types without building them
- Moved CSS build tools and TypeScript packages from `devDependencies` to `dependencies` for Vercel production builds
- Made Husky `prepare` script optional (`"prepare": "is-ci || husky"`) to prevent failures in CI environments
- Fixed `next.config.ts` → `next.config.js` to avoid TypeScript transpilation issues on Vercel

---

## Phase 3 — Core Authentication & Events

**Commits:** `359eeba`, `61d3d83`, `5e6d353`, `3bf328f`, `7e8a4a5`

### Authentication

- **Google OAuth** — Backend gained `googleSignin()` in `auth.service.ts`; login and register forms got Google sign-in buttons; NextAuth config updated to handle Google provider and store profile photo
- **JWT token refresh system** — Sliding-window refresh implemented in `apps/web/src/lib/auth.ts`; `JwtRefreshStrategy` added to API; access tokens refreshed automatically before expiry
- **SMTP email verification** — Nodemailer integration via `email.service.ts`; `emailVerificationToken` and `emailVerificationExpires` columns added to User model; new pages: `/verify-email`, `/resend-verification`, `/clear-session`; verification form with countdown timer and resend button
- **Forgot password flow** — `resetPasswordToken` and `resetPasswordExpires` added to User model; full email-based reset flow with backend endpoints
- **`OptionalJwtAuthGuard`** added so public endpoints can optionally attach authenticated user context

### Events

- **Event creation form** — Rich form with date picker, time picker, venue selector, and tier rules configuration; new UI components: calendar, popover, select, datetime-picker, time-picker
- **Venue module** — `venues.controller.ts`, `venues.service.ts`, `venues.module.ts` created; `EventCourt` join model added to schema allowing events to select specific courts per tier
- **Events controller** improvements: list public events, get event by ID (public), admin CRUD endpoints, RSVP endpoint

---

## Phase 4 — Venues, Players, Localization & Tier System

**Commits:** `750d417`, `6d93f15`, `1da4c49`, `d756370`, `a4d8d44`, `f63ac74`

### Backend

- **Venue CRUD** — Full create/read/update/delete venue endpoints; venue logo field added to schema
- **Players module** — `players.controller.ts`, `players.service.ts` created; `GET /players` (admin list) and `GET /players/:id` (public profile) endpoints
- **Tier system redesign** — `tierRules` JSON field on Event stores `mastersTimeSlot.courtIds`, `explorersTimeSlot.courtIds`, `masterCount`/`masterPercentage`; draw service splits players into MASTERS/EXPLORERS tiers based on court capacity; `Tier` enum (MASTERS, EXPLORERS) used in Assignment model; ranking service calculates display tier dynamically from player rating

### Frontend

- **Venue list, create, and edit pages** — Admin pages at `/admin/venues`, `/admin/venues/new`, `/admin/venues/[id]/edit` with venue form (name, address, court configuration)
- **Static pages** — About, Contact, FAQ, Privacy Policy, Terms, Cookies pages added
- **Footer component** with links to all static pages
- **Players admin list** — `/admin/players` page with player management table
- **Multi-language support (i18n)** — All pages moved under `/[lang]/` route segment; `DictionaryProvider` context, `useLocale` hook, `LanguageSwitcher` dropdown, EN and PT dictionaries; `src/i18n/config.ts` and `get-dictionary.ts`

---

## Phase 5 — Deployment Stabilization & Email Improvements

**Commits:** `e362472`–`7243bcd`, `5b5863c`, `2926266`, `40db9f3`

### Infrastructure

- Committed initial Prisma migration SQL (`20260211000331_init`)
- Added email verification and venue logo migration SQL
- Dropped `tier` field from `PlayerProfile` model (tier is event-specific, not a persistent user attribute)
- Fixed `profilePhoto` not being stored in Google OAuth JWT session

### UX & Email

- **Switched email provider from Nodemailer/SMTP to Resend** — Replaced all SMTP config with `RESEND_API_KEY`; cleaner API with better deliverability
- **React Email templates** — Branded HTML email templates using `@react-email/components` for verification email (`verification-email.tsx`) and password reset email (`password-reset-email.tsx`)
- **Language toggle button** — Replaced dropdown language switcher with a simple EN/PT toggle button
- **Flag emojis** — EN/PT text labels replaced with 🇬🇧/🇵🇹 flag emojis in the language toggle
- **Theme toggle button** — `ThemeToggleButton` component added to all navigation bars (admin, player, home) so theme switching is accessible without being logged in
- **Leaderboard cleanup** — Removed tier display from leaderboard; now shows rank, name, weeks played, rating, and rating delta
- **Dev-only UI hidden in production** — Demo credentials, verification tokens, and reset tokens hidden behind `NODE_ENV === 'development'` checks

---

## Phase 6 — Translations, Draw System & UI Polish

**Commits:** `24578e21`, `e40c76e`, `a082f3c`, `304b9ee`, `b1e75d2`, `81437b4`, `59ebf1b`, `f26641b`

### Internationalization

- **Migrated from custom dictionary to `next-intl`** — Replaced `DictionaryProvider`/`useLocale` pattern with `next-intl` hooks (`useTranslations`); updated `next.config.js`, `middleware.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`; all components switched to `useTranslations()`
- Expanded EN and PT translation dictionaries to cover all admin and player-facing screens

### Draw System

- **Draw generation overhaul** — `draw.service.ts` calculates tier split from court capacity: top-rated players → MASTERS, rest → EXPLORERS; player count adjusted to nearest multiple of 4; supports `masterCount`, `masterPercentage`, or default 50/50 split
- **Admin draw UI** — `admin-draw-view.tsx` and `generate-draw.tsx` components for visualizing and editing the draw with tier accordion UI
- **Player draw view** — Significantly expanded to show tier sections, match assignments, and court labels
- **Draw lock/publish** — Admin can lock and publish draws; `lockedAt` timestamp added to Draw model

### New UI Components

- `ui/dialog.tsx` — Modal dialog component
- `ui/alert-dialog.tsx` — Confirmation alert dialog
- **Public player profile page** — `public-player-profile.tsx` accessible at `/players/[id]`

### Auth Pages

- Login and register pages redesigned with full-page layout; language and theme toggles integrated into auth pages

---

## Phase 7 — Code Formatting, Invitation System & Safety

**Commits:** `d4370ec`, `181373f`, `901fe1e`, `42e019b`, `e8a88d2`, `5c51685`, `7dc7691`, `50d315d`, `a280f0a`

### Code Quality

- `.editorconfig`, `.husky/pre-commit`, `.lintstagedrc.js`, `.vscode/settings.json` added
- Prettier and ESLint formatting applied across the entire codebase

### Invitation System

- **Invitation-only registration** — `Invitation` model added to schema with fields: email, name, token (unique), status (PENDING/ACCEPTED/REVOKED/EXPIRED), invitedBy, expiresAt, usedAt
- `InvitationsModule` created with full CRUD: create, list, validate token, revoke invitation
- `signup()` in `auth.service.ts` now requires and validates an invitation token; registrant email must match invitation
- **Invitation email** — `invitation-email.tsx` React Email template for sending invitations via Resend
- **Admin invitations UI** — `/admin/invitations` page with `invitations-list.tsx` and `create-invitation-dialog.tsx` components
- **Register form** updated to accept invitation token from URL query parameter

### Bug Fixes

- Fixed race condition in event details component caused by multiple simultaneous state updates
- Mobile menu completely rewritten to fix rendering issues and improve responsive behavior
- Added request safety guards in draw service to validate event state before operations
- `EventEditForm` page added at `/admin/events/[id]/edit`

---

## Phase 8 — Shared Components, Refactoring & Results Entry

**Commits:** `c745efd`, `616ffc7`, `17f96f4`, `746f886`, `d9a4032`, `b707e32`

### Architecture

- **Shared components refactor** — Extracted reusable components to `src/components/shared/`: `EventCard`, `EventStats`, `PlayerList`, `RSVPBadges`, `RSVPButtons`, `EventsList` shared between admin and player views; ~50% reduction in duplicated lines
- **Custom hooks** — `useAPI()` for generic authenticated fetches, `useEvents()` for event queries and mutations (RSVP, state changes), all co-located in `src/hooks/`

### Features

- **Results entry UI** — `results-entry.tsx` component for admins to enter match scores; `/admin/events/[id]/results` page
- **Resend invitation** — `POST /invitations/:id/resend` backend endpoint added; frontend invitations list shows resend button
- **`ConfirmationDialog`** — Reusable dialog component replacing scattered `window.confirm` calls
- **`useMediaQuery` hook** — Responsive breakpoint detection

### Translations

- Major expansion of EN and PT dictionaries to cover all admin screens, venues, invitations, and results
- Confirmation dialog strings translated

---

## Phase 9 — UI/UX Polish Wave 1

**Commits:** `6c4e3d0`, `2939608`, `31c959f`, `2aee095`, `076192c`, `87778c7`, `d4a4845`, `0457dee`, `46df2e4`, `5d27b94`, `767f1db`, `441cbef`, `866b4d5`, `397f8e7`, `621b4c6`, `0a1a4f0`, `1e58eab`, `632de82`, `e3d700e`

### Architecture & Code Organization

- Components reorganized into `shared/` and `public/` subdirectories
- `AdaptiveNav` component created for role-aware navigation rendering
- Mobile menu extracted to `shared/mobile-menu.tsx`

### Data Model

- **Phone number and date of birth** — `phoneNumber` (unique) and `dateOfBirth` fields added to User model; migration applied
- **Profile update endpoint** — `PATCH /auth/profile` allows users to update name, phone, date of birth, and profile photo

### Features

- **Event "unfreeze"** — `POST /events/:id/unfreeze` endpoint reverts a FROZEN event back to OPEN state
- **User profile form** improvements — Avatar upload with preview, date of birth picker, phone field with validation
- `Tooltip` UI component added
- **Past events list** component for historical event display
- **`useMinimumLoading` hook** — Ensures loaders display for a minimum duration to avoid flicker
- **`useScrollDirection` hook** — Tracks scroll direction for auto-hiding/showing navigation bars
- **Spinner component** for loading states

### Bug Fixes

- `RSVPStatus` button visibility corrected (RSVP buttons no longer shown for past events)
- Mobile menu scroll overflow fixed
- Lint configuration finalized and applied project-wide

---

## Phase 10 — PWA Integration & New Logo

**Commits:** `bf89d9e`, `c1386c0`, `c7d6dad`

### PWA

- **Full PWA implementation** — Comprehensive service worker via `next-pwa`; offline fallback page (`public/offline.html`); `manifest.json` with display modes, theme colors, and screenshot entries
- **`AppLoadingScreen`** — Splash screen component shown on app launch in standalone mode
- **`OfflineIndicator`** — Banner shown when device goes offline; `useOnlineStatus` hook
- **Pull-to-refresh** — `PullToRefreshContainer` component and `usePullToRefresh` hook with native iOS-style indicator

### Branding

- **New logo** — Custom padel club logo added; all navbar brand marks updated
- **Favicon set** — 16×16, 32×32, 48×48 PNG + SVG favicons
- **Apple touch icons** — All required sizes generated: 72, 96, 120, 128, 144, 152, 167, 192, 384, 512 px
- Scripts added for favicon generation

### Components

- **`ScrollableFadeContainer`** — Horizontally scrollable container with gradient fade on edges, used for draw court sections

---

## Phase 11 — Draw System Refactor & Shared Components

**Commits:** `133927e`, `fa5193c`, `b83fee9`, `f216efc`, `d201129`, `525e536`, `09207bd`, `e3e0e7a`

### Architecture

- **Shared draw components** — `src/components/shared/draw/` directory with: `DrawHeader`, `MatchAssignment`, `TierSection`, `WaitlistSection`, `draw/types.ts`
- **Shared event components** — `src/components/shared/event/` directory with: `EventCard`, `EventStats`, `EventsList`, `PastEventsList`, `RSVPBadges`, `RSVPButtons`, `ConfirmedPlayersSection`, `EventHeader`
- `MatchResultEntry` component extracted from inline results form
- `EventHeader` component with event title, date, venue, and state badge
- **`AuthPageLayout`** and `CenteredAuthLayout` wrappers for auth page consistency
- **Shared layout components** — `PageLayout`, `SectionHeader`, `EmptyState`, `PageHeader`

### UI Features

- **Animations library** — `src/lib/animations.ts` centralizing Framer Motion variants: `staggerContainer`, `staggerItem`, `fadeInUp`, `scaleIn`; applied across all list and page components
- **Animated icons** — Animated icon buttons added to event details
- **Draw service improvements** — Improved round-robin scheduling logic; better handling of multiple rounds across courts

---

## Phase 12 — Inactivity System, Forms & Haptics

**Commits:** `da72a13`, `4852bda`, `db77968`, `33be96f`, `14398ee`

### Backend

- **Player inactivity cron job** — `InactivityService` with `@nestjs/schedule`; scheduled task marks players INACTIVE when they haven't RSVP'd for a configurable number of consecutive events; `PlayerStatus.INACTIVE` enum value added
- **`notificationsPaused` field** added to PlayerProfile for per-player notification preferences
- **Player status display** in admin players list with color-coded ACTIVE/INACTIVE/INVITED badges

### Frontend

- **Form system** — `useFormState` and `useFormMutation` hooks for unified form state management (loading, error, success); `TextField`, `NumberField`, `SelectField`, `LoadingButton` form components
- **Haptic feedback** — `useHaptic` hook using Web Vibration API for button press feedback on mobile devices
- **Mobile menu redesign** — Full-screen slide-in menu with animation, backdrop blur, and proper scroll locking
- **Accessibility improvements** — `SkipLinks` component added; ARIA labels on all navigation items; `ImageBlur` utility for progressive image loading; Security headers added to `next.config.js`

---

## Phase 13 — Mobile-First Experience

**Commits:** `2917300`, `a1ca4b9`, `2fb5b4f`, `2aa0641`, `ce71c71`, `08f055b`, `50b9a21`, `fff1d26`, `edb9782`, `8fd6165`, `4d42397`, `5e1887a`, `852d9c3`, `456cf43`, `3dc1290`

### New Mobile Components

- **`BottomSheet`** — Draggable bottom sheet overlay with snap points for mobile modal interactions
- **`TabBar`** — Native-style tab bar component for bottom navigation
- **`ToastNative`** — iOS-style toast notification component with `useToastNative` hook
- **`AlertNative`** — Native-style alert/confirm dialog with `useAlertNative` hook
- **`ContextMenu`** — Long-press context menu component
- **`Skeleton`** — Multiple skeleton loading variants (list items, cards, profiles)
- **`Pagination`** — Client-side pagination component for long lists

### New Hooks

- **`useSwipeBack`** — Gesture-based back navigation (iOS swipe from left edge)
- **`useSwipeTabs`** — Swipe left/right to change tabs
- **`useLongPress`** — Long-press detection for context menus
- **`useBfcache`** — Back/forward cache detection; triggers data refresh when page is restored from bfcache
- **`useScrollDirection`** — Hides nav bar on scroll down, shows on scroll up (improved)
- **`useMediaQuery`** improved — Mobile/tablet/desktop breakpoint detection

### UI Improvements

- Safe area insets for iPhone notch handled via CSS `env()` variables
- `PageLayout` and `PageHeader` used consistently across all pages
- Calendar component updated with touch-friendly larger tap targets
- Date and time pickers made mobile-native (use `<input type="date">` on mobile)
- **`DataStateWrapper`** component for unified empty/loading/error state handling
- Mobile menu: haptic feedback on open/close, backdrop tap to close, iOS bounce animation

---

## Phase 14 — Player Profile & Public Profile

**Commits:** `9c2c37b`, `1c2341e`, `b92c54f`, `ff949d8`, `98d6e8e`, `f516fbb`, `c86b9db`, `4dabc13`, `21379d0`, `99f32dd`, `e8555f5`, `fd8f6d4`, `a5551b0`, `108177a`, `ba3dd69`, `e63ebee`, `0ac01ef`

### Backend

- **Invitation re-validation fix** — Invitation service correctly marks invitations as ACCEPTED when user completes registration
- **Player profile API** improvements — `GET /players/:id` returns full profile with match history and rating snapshots

### Types

- **Shared types expansion** — New `UserProfile`, `UpdateProfileDto` types; `EventFormat` enum; expanded `Venue` type with logo field

### Frontend

- **Public player profile page** redesigned — Shows avatar, name, rating, win rate, full match history with animated list; distinguishes own profile from other players' profiles
- **Player profile form** improvements — Photo upload with preview, date of birth field, phone number field, inline validation error messages
- **Custom flag icon components** — `EnFlagIcon` and `PtFlagIcon` SVG React components replacing emoji flags for consistent cross-platform rendering
- **Mobile menu scrolling** fixed — Proper `overflow-y: scroll` on menu container
- **`ScrollArea` component** added for overflow scroll regions with custom scrollbar styling
- **TypeScript/ESLint config** migrated to flat config (`eslint.config.mjs`)
- **Invitation fix** — Register form properly reads and passes invitation token from URL query parameters

---

## Phase 15 — Mutations Refactor & PWA Install

**Commits:** `092d026`, `ddffd92`, `4393a22`

### Architecture

- **Custom mutation hooks** — All API mutations extracted from components into dedicated hook files: `useDraws()`, `useInvitations()`, `useMatches()`, `usePlayers()`, `useProfile()`, `useVenues()`; components significantly simplified
- **Inner event layout with tab navigation** — Events have a shared layout (`events/[id]/layout.tsx`) with `EventTabs` component providing Draw/Results/Players tabs; player and admin views share the same route structure

### Features

- **PWA install button** — `PwaInstallButton` component with `usePwaInstall` hook; listens for `beforeinstallprompt` browser event; shows "Add to Home Screen" option in footer
- **`EventActionsDropdown`** — Admin event actions (edit, freeze, unfreeze, delete) consolidated in a single dropdown
- **`EventNotificationsToggle`** — Per-event notification subscription toggle

### Backend

- **`rsvpOpensAt` / `rsvpClosesAt` calculation** endpoint added — Auto-computes RSVP window from event date
- `EventState.OPEN` transition from DRAFT added as explicit endpoint
- Event state machine documentation added (`docs/EVENT_STATES.md`): DRAFT → OPEN → FROZEN → DRAWN → PUBLISHED
- Translation key checker script (`scripts/check-translations.js`) added

---

## Phase 16 — Draw Generation v2 & Event Format

**Commits:** `bc6e9e7`, `8f0893b`, `cfe1e18`, `01ab684`, `da68b9d`, `db40f76`, `c80b664`, `4e2b920`, `d6645ba`

### Backend

- **Draw edit assignments** — `PUT /draw/:id/assignment/:assignmentId` endpoint allows admin to edit team members in a generated draw without regenerating the full draw
- **`EventFormat` enum** added to Event model (`NON_STOP` initially); migration applied

### Frontend

- **Date utility fix** — `formatDate()` guards against `Invalid Date` when parsing event dates
- **`TierSection` component** — Displays court assignments organized by tier in both admin and player views
- **`TeamList` component** — Shows both teams in a match with player names and court label
- **`EditAssignmentDialog`** — Admin dialog to swap players between teams in an existing draw
- **`PlayerSelectionColumn`** — Column UI for assigning players to courts
- **`TierAccordionItem`** — Accordion item wrapping tier sections in admin draw view
- **`ui/accordion.tsx`** added
- **`DrawUtils` library** (`lib/draw-utils.ts`) — Helper functions for draw manipulation and validation
- **Home page** created (`/[lang]/page.tsx`) — Shows upcoming events, recent results, and leaderboard snippet; `HomeUpcomingEvents` component
- **Events list page** (`/[lang]/events/page.tsx`) — Full events listing for players
- **Admin events list** improved with management actions
- **Empty states** — `ui/empty.tsx` component with illustrations; `MailboxIcon` animated SVG for empty invitations list
- **Improved home page** — Event cards with RSVP status, next event countdown, registration count display

---

## Phase 17 — Vulnerability Fix & Draw UI Improvements

**Commits:** `0e33cf6`, `3393384`, `9e1e337`, `5bf2706`, `c028d7b`

### Security

- **Dependency vulnerability fix** — `package.json` overrides added to force safe versions of vulnerable transitive dependencies; `pnpm-lock.yaml` updated

### Draw System

- **Draw generation UX** redesigned — Step-by-step wizard with clearer tier capacity display and real-time validation
- **Admin draw view** refactored — Cleaner layout with tier tabs; matches displayed as cards showing Team A vs Team B
- **`MessageCircleCheckIcon`** animated SVG icon for "draw published" confirmation state

### Results & Classification

- **Tier classification table** — `TierClassificationTable` component showing per-tier standings within an event (wins, losses, points); displayed in the results tab
- **`TierCollapsibleItem`** — Collapsible tier section for results view
- **`MatchCard`** component — Visual match result card with scores; refactored from `MatchAssignment`
- **Results view** redesigned — Match cards with scores, classification table, and player stats
- **"Classification" tab** added to event tabs alongside Draw/Results/Players
- **Hook consolidation** — `useRankings`, `useVenues`, `useDraws`, `useMatches`, `usePlayers`, `useProfile` hooks finalized; all components migrated to use hooks instead of inline fetch calls

---

## Phase 18 — Native App Feel & Role-Based Routing

**Commits:** `3aafd45`, `fc7af4b`, `5b22413`, `d63bc5c`, `ab49d72`, `a8eacae`, `66b2ce7`, `82a38d4`, `20c7387`, `91bd624`

### Architecture — Major Refactor

- **Removed `/admin/` route prefix** — Admin and player routes unified; access control based purely on user `Role` (EDITOR/ADMIN); `EditorGuard` component wraps admin-only UI sections; `useIsEditor()` hook
- **`UnifiedNav`** — Single navigation component that adapts to user role and authentication state, replacing separate `AdminNav` and `PlayerNav`
- **404 page** — `not-found.tsx` with animated illustration and navigation options; catch-all `[...not-found]` route

### Animations

- **Page transition animations** — `motion/react` (Motion One) used for enter animations on all page content; stagger animations on list items
- **`useIsFromBfcache` hook** — Skips entrance animations when page is restored from bfcache to avoid visual stutter

### Mobile Feel

- **Swipe back blink fix** — `page-layout.tsx` and `data-state-wrapper.tsx` prevent content flash during iOS swipe-back gesture
- **Pull-to-refresh** enhanced with spring physics animation; bfcache restoration also triggers data refresh

---

## Phase 19 — Code Review, Controllers & Email Templates

**Commits:** `3ef406f`, `b57dadb`, `24d15b4`, `c3867f1`

### Backend Improvements

- **Email templates for all notification types** — 4 new React Email templates: `event-notification-email.tsx`, `rsvp-confirmation-email.tsx`, `waitlist-notification-email.tsx`, `promotion-notification-email.tsx`
- **Notification service expanded** — `NotificationService` now sends emails for: draw published, RSVP confirmation, waitlist joined, promoted from waitlist, event announced
- **Rate limiting** — NestJS Throttler added to API; configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT` env vars
- **Helmet** added for HTTP security headers
- **CORS** configured properly for production domains
- **Auth fixes** — Google OAuth `access_type: 'offline'` added for refresh tokens; CORS credentials handling fixed
- **Error pages** — `error.tsx` and `events/[id]/error.tsx` added with user-friendly error UI
- **`useAuthFetch` hook** — Wrapper around `fetch` that automatically injects the Authorization header from the active session

---

## Phase 20 — Push Notifications, Profile & Rankings Recompute

**Commits:** `b223f04`, `2b2b3db`, `ffcdb0f`, `9a8d686`, `f95656e`, `06fb06e`, `843dd2b`, `96e2ef0`, `595c43f`

### Push Notifications (Web Push)

- **`PushModule`** added — `push.controller.ts` with `POST /push/subscribe` and `DELETE /push/unsubscribe`; `push.service.ts` using `web-push` library with VAPID key configuration
- **`PushSubscription` model** added to database (endpoint, p256dh, auth keys per user)
- **`PushNotificationToggle`** component — Subscribe/unsubscribe toggle in player profile
- Push notifications sent alongside emails for: draw published, RSVP confirmed, waitlist joined, promoted from waitlist
- **Service worker** (`worker/index.ts`) handles `push` events, shows notifications with event details and action buttons
- **`PwaInstallInstructions`** component — Step-by-step guide for iOS (Safari share → Add to Home Screen) and Android; shown on home page when app is not installed

### Player Profile

- **`WeeklyScoresCard`** — Displays player's weekly performance history
- **`PlayerStatsStrip`** — Compact stats row showing wins, losses, rating, and weeks played
- **Public player profile** redesigned — Full match history, rating display, stats; social share support
- **`notificationsPaused` toggle** added to player profile settings

### Rankings

- **Recompute rankings feature** — Admin button in results view triggers `POST /ranking/recompute/:eventId`; recalculates all player ratings from stored match results
- **Database index** added on `PlayerProfile.status` for faster inactive player queries

### Code Quality

- **`profile.dto.ts`** — Proper DTO with class-validator decorators for profile updates
- **`SWUpdatePrompt`** component — Shows update banner when a new service worker version is available
- **`api-client.ts` removed** — Replaced entirely by per-feature hooks with direct fetch calls
- **`.env.example` files** added for both `apps/api` and `apps/web`

---

## Phase 21 — Final Polish, Skeleton Loading & PWA Refinement

**Commits:** `1f7436a`, `b9d1e0e`, `97dff6c`, `d1101f7`, `9fbe8c1`, `74a0de3`, `558eba0`, `ef12571`

### Features

- **Skeleton loading screens** — `loading.tsx` files added for all major pages: events list, leaderboard, players list, profile, event details; route group `(view)` created to scope loading states for event detail pages
- **`FieldFeedback` and `FieldFeedbackIcon`** — UI components for inline form validation messages
- **`EventTabs`** improvements — Animated tab indicator; active tab persists across navigations
- **Event edit form** consolidated — Moved to `/events/[id]/edit` (role-guarded) from the separate admin route
- **Results view** (`results-view.tsx`) — Combined score entry and classification table in a single admin view
- **Draw ranking migration** — New database migration adds `algoVersion` to RankingSnapshot for future algorithm versioning

### Static Pages

- About, Contact, Cookies, FAQ, Privacy Policy, and Terms pages fully translated in both EN and PT with complete content
- Cookie policy and privacy policy content significantly expanded
- Contact page updated with club-specific information

### PWA Refinements

- **Manifest.json** updated: `display_override: ["standalone", "window-controls-overlay"]`, scope, `start_url` with `?source=pwa` tracking parameter
- **Splash screen** (`AppLoadingScreen`) refined — Detects standalone mode via `useIsStandalone` hook; shows animated club logo on PWA launch; auto-dismisses once the app is ready
- **Offline page** (`public/offline.html`) redesigned with club branding
- Next.js PWA config cleaned up; removed unused image optimization domains

### Bug Fixes

- Button variant CSS corrected in several places (ghost vs outline)
- Layout fixes for Contact and Cookies pages on mobile
- Animation initial state fixed for players list and venues list components

---

## Summary

| Area                  | Details                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total commits         | 185                                                                                                                                                  |
| Development period    | October 2025 – April 2026                                                                                                                            |
| Backend API modules   | 10 (auth, draw, events, invitations, matches, notifications, players, push, ranking, venues)                                                         |
| Database models       | 14 (User, PlayerProfile, Venue, Court, Event, EventCourt, RSVP, Draw, Assignment, Match, WeeklyScore, RankingSnapshot, Invitation, PushSubscription) |
| Frontend pages/routes | 25+ (under `/[lang]/` i18n prefix)                                                                                                                   |
| Translation languages | 2 (English, Portuguese)                                                                                                                              |
| Deployment            | Vercel (web) + Railway (API + PostgreSQL)                                                                                                            |
