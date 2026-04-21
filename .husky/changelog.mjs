#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const INSERT_MARKER = "<!-- CHANGELOG_INSERT_POINT -->";

function getCommitDiff(hash) {
  return execSync(
    `git show ${hash} --unified=3 -- . ":(exclude)CHANGELOG.md"`,
    { maxBuffer: 10 * 1024 * 1024 }
  )
    .toString()
    .trim();
}

function buildPrompt(diff, date, hash) {
  return `Generate a changelog entry for the following git diff. The entry will be inserted into CHANGELOG.md.

Today's date: ${date}
Commit hash: ${hash}

Use EXACTLY this format (h2 heading, commit reference, then h3 subsections):

## [YYYY-MM-DD] — Brief title describing the overall change

**Commit:** \`${hash}\`

### Frontend

- **\`ComponentName\`** — What changed and why
- **\`hookName\`** — What changed

### Backend

- **\`ServiceName\`** — What changed

### Infrastructure

- **\`config-file\`** — What changed

Rules:
- Only include subsections (Frontend / Backend / Infrastructure / Bug Fixes) that actually have changes
- Each bullet: bold backtick name, em-dash, then a specific description
- Be specific: name the exact component, hook, endpoint, model, or file
- Skip trivial changes: formatting-only, lock file updates, minor renames
- Return ONLY the markdown entry, nothing else

Git diff:
\`\`\`diff
${diff.slice(0, 12000)}
\`\`\``;
}

const hash = execSync("git rev-parse --short HEAD").toString().trim();
const diff = getCommitDiff(hash);

if (!diff) {
  process.exit(0);
}

const date = new Date().toISOString().split("T")[0];
const prompt = buildPrompt(diff, date, hash);

let entry;
try {
  entry = execSync("claude -p", {
    input: prompt,
    timeout: 90_000,
    maxBuffer: 1024 * 1024,
  })
    .toString()
    .trim();
} catch {
  console.warn("⚠ Could not generate changelog entry (skipping)");
  process.exit(0);
}

if (!entry) {
  process.exit(0);
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
const markerIndex = changelog.indexOf(INSERT_MARKER);

if (markerIndex === -1) {
  console.warn("⚠ CHANGELOG.md insert marker not found (skipping)");
  process.exit(0);
}

const insertAt = markerIndex + INSERT_MARKER.length;
const updated =
  changelog.slice(0, insertAt) +
  "\n\n" +
  entry +
  "\n" +
  changelog.slice(insertAt);

writeFileSync("CHANGELOG.md", updated);
execSync("git add CHANGELOG.md");
// Amend the commit to include CHANGELOG.md; --no-verify prevents re-running hooks
execSync("git commit --amend --no-edit --no-verify");
console.log("✓ Changelog updated");
