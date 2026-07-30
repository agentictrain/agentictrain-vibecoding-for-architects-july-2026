# Phase 5 — Review an existing codebase

## The problem

You are onboarding to a public middleware repository. You need to explain
what it does, trace its important behavior, and identify evidence-backed
risks without trusting either the README or an AI-generated review blindly.

## 1. Choose an online or offline route

### Online route

Use the small, public, non-sensitive
[`expressjs/cookie-parser`](https://github.com/expressjs/cookie-parser)
repository. Pinning the revision makes everyone's evidence comparable.

```bash
phase5_repo_root="$(mktemp -d)"
git clone https://github.com/expressjs/cookie-parser.git \
  "$phase5_repo_root/cookie-parser"
git -C "$phase5_repo_root/cookie-parser" checkout --detach \
  1f2a3a2037c4efe01605e064e7cc326008be7287
cd "$phase5_repo_root/cookie-parser"
git rev-parse HEAD
git status --short --branch
```

The SHA must be
`1f2a3a2037c4efe01605e064e7cc326008be7287`.

### Offline route

If GitHub is unavailable, copy the bundled Tiny Todo repository into an
isolated temporary directory:

```bash
phase5_repo_root="$(mktemp -d)"
cp -R "day-5/phase 5/starter/sample-repo" \
  "$phase5_repo_root/tiny-todo"
cd "$phase5_repo_root/tiny-todo"
shasum -a 256 README.md index.html app.js \
  > "$phase5_repo_root/before.sha256"
```

Record `Tiny Todo offline fallback` instead of a repository URL and commit.
Follow the offline commands and prompt below; do not run the cookie-parser
package or test commands.

## 2. Establish a manual baseline

Before asking a skill, inspect the selected repository yourself.

For the online cookie-parser route:

```bash
rg --files --hidden -g '!.git'
sed -n '1,180p' README.md
sed -n '1,220p' package.json
sed -n '1,240p' index.js
sed -n '1,340p' test/cookieParser.js
```

For the offline Tiny Todo route:

```bash
rg --files
sed -n '1,220p' README.md
sed -n '1,260p' index.html
sed -n '1,260p' app.js
```

Write down:

- the repository's purpose and what it does **not** provide;
- for cookie-parser, the public exports, request-processing flow,
  dependencies, commands, and request/secret trust boundaries;
- for Tiny Todo, the HTML/JavaScript entry points, browser state flow,
  persistence behavior, available checks, and DOM/storage trust boundaries;
- two claims you expect the skill to confirm or challenge.

## 3. Find and inspect a skill

1. Search [skills.sh](https://skills.sh) for `codebase`, `code review`,
   `onboarding`, or `explore`.
2. Open the skill's source repository and read its complete `SKILL.md` plus
   any scripts it tells the agent to run.
3. Check for destructive commands, network calls, hidden instructions, and
   requests for secrets.
4. Install it only if the source is acceptable, using the exact command shown
   by skills.sh. Otherwise reject it and choose another candidate.
5. Record the skill name, source URL, install command, and keep/reject reason.

## 4. Run an evidence-first exploration

For the online cookie-parser route, open Copilot on the pinned repository and
copy this prompt:

```text
Use the <skill-name> skill to review this repository in read-only mode.
Do not edit files, install packages, or make network calls.

Answer:
1. What does the package do, and what is outside its scope?
2. What are its public entry points and exports?
3. Trace a Cookie header through the middleware to req.cookies and
   req.signedCookies.
4. What runtime dependencies, scripts, and tests define how it is built
   and verified?
5. What are the important trust boundaries, failure modes, API or
   documentation mismatches, and maintenance risks?

For every material claim, cite an existing file and line range. Label it
SOURCE EVIDENCE, INFERENCE, or UNKNOWN. Never invent a file or behavior.
End with five claims I should verify manually and the exact commands or
files to use. If evidence is missing, say UNKNOWN.
```

For the offline Tiny Todo route, use this prompt instead:

```text
Use the <skill-name> skill to review this repository in read-only mode.
Do not edit files, install packages, or make network calls.

Answer:
1. What does this app do, and what is outside its scope?
2. What are its entry points and browser state flow?
3. Trace adding, toggling, persisting, loading, and deleting a todo.
4. What trust boundaries, failure modes, accessibility gaps, and
   maintainability risks exist?
5. What verification is possible without a package manager or test suite?

For every material claim, cite an existing file and line range. Label it
SOURCE EVIDENCE, INFERENCE, or UNKNOWN. Never invent a file or behavior.
End with five claims I should verify manually.
```

Immediately check that the read-only review made no changes. For the online
route, run:

```bash
git status --short
```

For the offline route, run:

```bash
shasum -a 256 -c "$phase5_repo_root/before.sha256"
```

Stop and inspect any unexpected modification before continuing.

## 5. Verify the review

For the online route, verify at least five claims, including:

1. package purpose and dependencies;
2. public exports;
3. normal, signed, and JSON-cookie control flow;
4. behavior for invalid signatures and invalid JSON;
5. test and lint coverage.

Use targeted searches rather than rereading everything:

```bash
rg -n '"description"|"dependencies"|"scripts"|module\.exports' \
  package.json index.js
rg -n 'headers\.cookie|signedCookies|JSONCookie|JSON\.parse|return false' \
  index.js test/cookieParser.js README.md
```

For each checked claim, record `confirmed`, `corrected`, or `unsupported`,
with the actual file/lines or command output.

For the offline route, verify at least five claims with targeted searches:

```bash
rg -n 'localStorage|JSON\.parse|Date\.now|addEventListener|innerHTML' \
  README.md index.html app.js
rg -n 'checkbox|button|label|aria-' README.md index.html app.js
```

Record each checked claim as `confirmed`, `corrected`, or `unsupported`.

## 6. Run the route checks

### Online checks

Inspect `package.json` before downloading dependencies. This revision has no
lockfile, so avoid lifecycle scripts and do not create a new lockfile:

```bash
npm install --ignore-scripts --no-package-lock --no-audit --no-fund
npm test
npm run lint
```

After installation, probe an edge case the existing tests do not cover:

```bash
node - <<'NODE'
const parser = require('./index')
for (const value of ['j:false', 'j:0', 'j:null', 'plain']) {
  const cookies = {example: value}
  console.log(value, '=>', parser.JSONCookie(value), parser.JSONCookies(cookies))
}
NODE
```

Record the Node version and every result. If the checks fail before reaching
the tests on a very new Node release, do not misreport a product failure.
Capture the error and switch to an organization-approved, preinstalled Node
22 runtime or version manager. Do not use `npx node@22`; that command
downloads and executes another package without the source-inspection gate.
After switching, rerun:

```bash
node --version
npm test
npm run lint
```

### Offline checks

The Tiny Todo fallback has no package manifest or automated test suite. Run
the available syntax check, then open it directly:

```bash
node --check app.js
open index.html
```

Add, toggle, and delete a todo; reload the page; and confirm persistence.
Record the missing automated tests as a finding, not as a failed command.

## 7. Deliver and decide

Create `codebase-review.md` with:

- repository URL, exact commit, Node version, and skill provenance;
- purpose and scope;
- architecture and request-flow summary;
- trust-boundary table;
- claim-verification table;
- risks, limitations, and open unknowns;
- exact commands and results;
- the decision to keep or remove the skill, with a reason.

For the offline route, replace repository URL, commit, and request flow with
the recorded fallback, file inventory, and browser state flow. Compare it
with `day-5/phase 5/finish/codebase-review.md`; that reference covers the
online route, so compare review structure rather than findings.

Clean up only the temporary directory you created:

```bash
open -R "$phase5_repo_root"
```

Move that exact folder to Trash after confirming its path.

## Checklist

- [ ] Checked out the pinned commit or copied and recorded the offline fallback
- [ ] Established a manual baseline before invoking the skill
- [ ] Inspected the skill source and recorded its provenance
- [ ] Kept the skill run read-only and checked `git status`
- [ ] Verified at least five material claims against source or command output
- [ ] Probed one uncovered edge case or exercised the offline browser flow
- [ ] Ran the checks available for the selected route and recorded limitations
- [ ] Labeled claims as source evidence, inference, or unknown
- [ ] Wrote `codebase-review.md`
- [ ] Decided to keep or remove the skill
