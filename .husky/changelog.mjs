#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const INSERT_MARKER = "<!-- CHANGELOG_INSERT_POINT -->";

function getStagedDiff() {
  return execSync('git diff --cached --unified=3 -- . ":(exclude)CHANGELOG.md"', {
    maxBuffer: 10 * 1024 * 1024,
  })
    .toString()
    .trim();
}

function buildPrompt(diff, date) {
  return `Generate a concise changelog entry for the following git diff. The entry will be inserted into CHANGELOG.md.

Today's date: ${date}

Format your response as markdown like this example:

### [YYYY-MM-DD] Brief title describing the change

- Specific thing added or changed (component/file names welcome)
- Another specific thing
- Bug fixed: what was broken and how it was fixed

Rules:
- Be specific: name components, endpoints, hooks, pages, models
- Skip trivial changes (formatting, minor renames, lock file updates)
- Max 6 bullet points
- Return ONLY the markdown, nothing else

Git diff:
\`\`\`diff
${diff.slice(0, 12000)}
\`\`\``;
}

const diff = getStagedDiff();

if (!diff) {
  process.exit(0);
}

const date = new Date().toISOString().split("T")[0];
const prompt = buildPrompt(diff, date);

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
console.log("✓ Changelog updated");
