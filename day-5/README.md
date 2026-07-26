# Day 5 — Architect skills: find, run, and judge

Today you learn the full skill lifecycle — search, inspect, install, run,
and judge — by practicing it on real architect tasks. A **skill** is a
reusable AI workflow you install once and trigger by name instead of
re-prompting every time. You'll browse the catalog, then do five hands-on
exercises: draft an ADR, review an architecture, generate an API spec,
explore a codebase, and build a dashboard from a spreadsheet. The same
habit from all week: the skill's output is a claim, not a fact, until
you've read it critically.

You will not write the code yourself — you tell GitHub Copilot what to
build, check the result, and fix what's wrong.

The whole thing takes two hours. Every exercise follows the same loop:
read the problem, find a skill, inspect it, install it, run it, and
read the output critically.

> [!NOTE]
> A shared [course glossary](../glossary.md) defines every technical term
> used across all four days. Open it in a tab and refer back when a term is
> unfamiliar.

## Prerequisites and preflight

Before the clock starts, make sure you have:

- GitHub Copilot working in your editor.
- `npx` available in your terminal (the skills CLI needs it).
- `git` available in your terminal (one exercise clones a public repo).
- A web browser open to [skills.sh](https://skills.sh).

> [!WARNING]
> Only install skills from sources you've inspected. Do not paste
> personal or production credentials into any skill, prompt, or terminal.

> [!NOTE]
> **Every exercise today needs internet.** You'll browse [skills.sh](https://skills.sh),
> install skills from it, and (in one exercise) clone a public GitHub repo.
> If your network blocks any of those, you can still read the `PROBLEM.md`
> files and the shipped `finish/` examples — but you won't be able to run
> the install-invoke-verify loop yourself. If you're working alone with no
> network at all, work through the exercises you can and read the
> `finish/` folders for the rest.

> [!NOTE]
> **About `DISABLE_TELEMETRY=1`.** The `npx skills` CLI sends anonymous
> usage data (which commands you run, which skills you install) to the
> skills.sh service by default. It does not send file contents, prompts,
> or credentials. Every install and remove command in this guide prefixes
> `DISABLE_TELEMETRY=1` so the command you run sends nothing. If you'd
> rather turn it off for your whole session, run
> `export DISABLE_TELEMETRY=1` once in your terminal before you start.

## What is a skill

Quick reference for the terms you'll see today:

- A **prompt** is a one-time request for this interaction.
- A **custom instruction** is persistent local guidance.
- A **skill** is a reusable, triggerable workflow package with resources
  and stop conditions — install once, invoke by name later. Think
  "review my ADR" instead of re-typing the whole review prompt every
  time.
- An **agent** combines reasoning, context, and tools to act on a task.
- An **MCP tool** connects the agent to an external capability or data
  source.

You want **skills** — things you install once and trigger by name.

## The loop you follow all day

Every exercise is the same seven steps:

1. **Read the problem.** Understand what artifact you need.
2. **Find a skill.** Search [skills.sh](https://skills.sh) for words
   related to the task.
3. **Inspect the source.** Before installing, read every file: `SKILL.md`,
   scripts, references. What does the skill do when it runs? What does it
   touch on your machine? Specifically check:
   - **Commands** — what runs on your machine when you invoke it?
   - **Network** — does it call any URL? Which ones?
   - **File writes** — where does it write? Only inside your project, or
     elsewhere?
   - **Credentials** — does it ask for a key, token, or login? (If yes,
     stop — never paste a real credential into a skill.)
   - **Stop conditions** — how do you know when it's done? How do you
     undo it?
4. **Install it.** Install the skill after inspecting the source.
5. **Run it.** Invoke the skill on a small, fictional version of the
   task. No real internal systems, vendor names, or secrets.
6. **Read the output critically.** Label each claim: source evidence /
   model inference / assumption / unsupported claim. Did the skill
   invent constraints, policies, or stakeholders? Did it fill gaps with
   plausible-sounding but unsupported reasoning?
7. **Keep or remove.** Is the output good enough you'd put your name on
   it? If not, remove the skill and prove cleanup:
   ```bash
   DISABLE_TELEMETRY=1 npx skills remove <skill-name> --yes
   npx skills list
   ```
   A success message isn't proof — run `npx skills list` and confirm the
   skill is gone.

## How checkpoints work

Each exercise has its own `starter/` and `finish/` folder. The `starter/`
folder has the problem description and any input files you need. The
`finish/` folder has a known-good result for comparison.

> [!NOTE]
> The `finish/` folder is **one example answer**, not the only answer.
> Different skills, different prompts, and different models produce
> different output — that's expected. Use `finish/` to check whether your
> result is in the right shape (the ADR has the right sections, the API
> spec traces to the mapping, the dashboard charts match the CSV), not to
> match it word for word.

If you get stuck, open the `finish/` folder for that exercise. Keep your
blocked work so you can compare.

The checkpoint path for Day 5:

```text
course/day-5/phase 1/starter/   browse skills.sh
course/day-5/phase 2/starter/   draft an ADR
course/day-5/phase 3/starter/   review an architecture
course/day-5/phase 4/starter/   generate an API spec
course/day-5/phase 5/starter/   review an existing codebase
course/day-5/phase 6/starter/   build a dashboard from a spreadsheet
course/day-5/phase 7/starter/   turn meeting notes into a decision doc (optional)
```

## Outcome and two-hour route

- **0–10 min — Phase 1: Browse skills.sh.** See the catalog, search, and
  bookmark it.
- **10–30 min — Phase 2: Draft an ADR.** Find an ADR skill, run it, read
  the output.
- **30–50 min — Phase 3: Review an architecture.** Find a review skill,
  run it, read the output.
- **50–70 min — Phase 4: Generate an API spec.** Find an API spec skill,
  run it, validate against the source mapping.
- **70–90 min — Phase 5: Review an existing codebase.** Clone a public
  repo, find a codebase exploration skill, ask it questions.
- **90–110 min — Phase 6: Build a dashboard from a spreadsheet.** Find a
  dashboard or charting skill, run it against a CSV, check the charts
  match the data.
- **110–120 min — Hand off.** Show one skill, one artifact, one claim you
  caught.
- **If you have time left — Optional Phase 7: Turn meeting notes into a
  decision document.**

---

## Phase 1 — Browse skills.sh

Open [skills.sh](https://skills.sh). Spend a few minutes getting
familiar:

- **The catalog.** Browse the list. What categories exist? What are the
  most popular skills?
- **Search.** Try words related to your job: "ADR," "architecture
  review," "API spec," "OpenAPI," "codebase," "dashboard," "meeting
  notes," "decision." See what comes up.
- **A skill page.** Click into a skill. Look at the description,
  publisher, install command, and the source files. What does the page
  tell you about what the skill does and what it touches?

Bookmark the site. You'll be searching it for every exercise.

**Checkpoint 1:** you've browsed skills.sh and searched for at least
three task words.

---

## Phase 2 — Exercise 1: Draft an ADR

Open `course/day-5/phase 2/starter/` and read `PROBLEM.md`. It describes
a fictional decision you need an ADR for.

**The problem:** You need an Architecture Decision Record for a fictional
decision: "should we use event sourcing for our order service?" You could
write it from scratch, or find a skill that drafts ADRs from a short
problem statement.

**Find and install a skill:**

1. Search skills.sh for "ADR" or "architecture decision."
2. Inspect its source: read the `SKILL.md`, any scripts, and the
   install command. What does it do when it runs? What does it write?
3. Install it:
   ```bash
   DISABLE_TELEMETRY=1 npx --yes skills add <skill-source> --yes
   ```

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Here's a short, fictional decision I need
an ADR for: should we use event sourcing for our order service? Draft
the ADR. Don't invent constraints, policies, or stakeholders that
aren't in the problem statement.
```

**Read the output critically:**

- Does the ADR state the decision, drivers, alternatives, and
  consequences?
- Did the model invent constraints, policies, or stakeholders?
- Which claims are source evidence, which are inferences, which are
  unsupported?
- Fix the overclaims. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 2/finish/` to see a known-good
ADR.

**Checkpoint 2:** you've drafted an ADR with a skill and labeled the
claims.

---

## Phase 3 — Exercise 2: Review an architecture for missing NFRs

Open `course/day-5/phase 3/starter/` and read `PROBLEM.md`. It has a
fictional architecture description you'll review.

**The problem:** You have a short fictional architecture description. You
need to find missing non-functional requirements, risks, and
dependencies.

**Find and install a skill:**

1. Search skills.sh for "architecture review," "NFR," or "risk review."
2. Inspect the source, then install it.

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Review this fictional architecture for
missing non-functional requirements, risks, and dependencies:

A small e-commerce checkout service. A single Node.js backend handles
cart, payment, and order creation. It talks to Stripe for payments and
PostgreSQL for order storage. The frontend is a React SPA. There is no
queue, no cache, and no CDN. Deployed on a single VM.

Don't invent compliance requirements or SLAs that aren't stated.
```

**Read the output critically:**

- Which findings are grounded in the description?
- Which are reasonable inferences (e.g. "no cache means slow under
  load")?
- Which are unsupported (e.g. "GDPR requires..." when GDPR wasn't
  mentioned)?
- Did it miss something obvious (e.g. no backup strategy, no
  rate-limiting)?
- Fix the overclaims. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 3/finish/` to see a known-good
review.

**Checkpoint 3:** you've reviewed an architecture with a skill and
labeled the findings.

---

## Phase 4 — Exercise 3: Generate an API spec from a data mapping

Open `course/day-5/phase 4/starter/` and read `PROBLEM.md`. It has the
`WeatherSignal` data mapping you'll turn into an API spec.

**The problem:** You have a small data mapping — the `WeatherSignal`
shape from Day 3. You need an API spec with endpoints, request/response
shapes, and error codes.

**Find and install a skill:**

1. Search skills.sh for "API spec," "OpenAPI," or "Swagger."
2. Inspect the source, then install it.

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Generate an API spec from this data
mapping. Include endpoints, request/response shapes, and error codes.
Don't invent endpoints, fields, or auth schemes that aren't in the
source mapping.

WeatherSignal {
  location: string
  latitude: number
  longitude: number
  timezone: string
  isFallback: boolean
  current: {
    temperature: number
    apparentTemperature: number
    humidity: number
    precipitation: number
    weatherCode: number
    windSpeed: number
    windDirection: number
    windGusts: number
    cloudCover: number
    pressure: number
    isDay: number
  }
  hourly: {
    time: string[24]
    temperature: number[24]
    precipitationProbability: number[24]
    precipitation: number[24]
    weatherCode: number[24]
    windSpeed: number[24]
  }
  daily: {
    date: string[7]
    temperatureMax: number[7]
    temperatureMin: number[7]
    precipitationSum: number[7]
    precipitationProbabilityMax: number[7]
    weatherCode: number[7]
    windSpeedMax: number[7]
    sunrise: string[7]
    sunset: string[7]
  }
}
```

**Validate the spec against the mapping:**

- Does every field in the spec trace back to the mapping?
- Did it invent endpoints or fields that don't exist in the source?
- Did it add auth schemes the PoC doesn't have?
- Are the error codes sensible or invented?
- Fix the overclaims. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 4/finish/` to see a known-good
spec.

**Checkpoint 4:** you've generated an API spec with a skill and
validated it against the source.

---

## Phase 5 — Exercise 4: Review an existing codebase

Open `course/day-5/phase 5/starter/` and read `PROBLEM.md`. It tells you
which repo to explore and what questions to ask.

**The problem:** You explore a small codebase. You need to understand what it
does, how it's structured, and where the risks are — without reading every
file yourself.

**Set up — pick one:**

- **Bundled sample (offline):** use the tiny todo app shipped at
  `course/day-5/phase 5/starter/sample-repo/`. It's a three-file app with a
  couple of intentional smells. No clone needed.
- **Public repo (online):**
  ```bash
  git clone https://github.com/<a-small-public-repo> .
  ```
  Pick a small, public, non-sensitive repo — for example a todo app, a
  weather app, or any small open-source project you're curious about.

**Find and install a skill:**

1. Search skills.sh for "codebase," "code review," "onboarding," or
   "explore."
2. Inspect the source, then install it.

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Explore this codebase and answer:
1. What does this codebase do?
2. Where are the main entry points?
3. What are the biggest risks or code smells?
Don't hallucinate files or patterns that don't exist. If you're not
sure, say so.
```

**Read the answers critically:**

- Does each claim trace to actual code you can point to?
- Did it hallucinate files, functions, or patterns that don't exist?
- Did it miss something obvious (e.g. no tests, no error handling,
  hardcoded secrets)?
- Is the structure description accurate or guessed?
- Verify two claims by opening the actual files. Fix or discard the
  skill's wrong answers. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 5/finish/` to see a known-good
exploration.

**Checkpoint 5:** you've explored a codebase with a skill and verified
the claims against the real code.

---

## Phase 6 — Exercise 5: Build a dashboard from a spreadsheet

Open `course/day-5/phase 6/starter/` and read `PROBLEM.md`. It has a CSV
file with fictional operational data you'll turn into a dashboard.

**The problem:** You have a CSV file with fictional operational data.
You need a visual dashboard a stakeholder can read — a Power BI
replacement, built with plain HTML/CSS/JS and no backend.

**Find and install a skill:**

1. Search skills.sh for "dashboard," "chart," "data visualization," or
   "report."
2. Inspect the source, then install it.

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Build an HTML dashboard from the CSV file
at course/day-5/phase 6/starter/data.csv. Include charts for revenue
by region, orders by month, and returns rate. Use plain HTML, CSS, and
JavaScript — no build step, no npm, no backend. The dashboard must open
by double-clicking index.html. Don't invent metrics that aren't in the
file.
```

**Read the output critically:**

- Do the charts match the data in the CSV?
- Are the labels and units correct?
- Did it invent metrics or columns that aren't in the file?
- Does it work from a double-click with no install?
- Does it look readable at a narrow width (390px)?
- **Accessibility:** Tab through the dashboard — every chart and table must
  be reachable with the keyboard and have a visible focus outline. Run
  Lighthouse → Accessibility on the generated `index.html`. Fix anything
  below 100 (missing labels, low contrast, no `<main>` landmark). A
  stakeholder dashboard that a screen-reader user can't read isn't done.
- Fix the overclaims. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 6/finish/` to see a known-good
dashboard.

**Checkpoint 6:** you've built a dashboard with a skill and verified
the charts match the data.

---

## Optional Phase 7 — Exercise 6: Turn meeting notes into a decision document

If you have time left, try one more.

Open `course/day-5/phase 7/starter/` and read `PROBLEM.md`. It has a
fictional meeting transcript you'll turn into a decision document.

**The problem:** You have a short fictional meeting transcript. You need
a decision document: the decision, the rationale, who agreed, what's
open.

**Find and install a skill:**

1. Search skills.sh for "meeting notes," "decision document," or
   "summary."
2. Inspect the source, then install it.

**Ask Copilot** (copy this whole block):

```text
Use the <skill-name> skill. Turn this meeting transcript into a
decision document with: the decision, the rationale, who agreed, and
what's still open. Don't attribute opinions to people who didn't speak.
Don't invent a consensus that wasn't reached.

Meeting: Platform team sync, 2026-07-24
Attendees: Alice (tech lead), Bob (infra), Carlos (backend), Dana (data)

Alice: We need to pick a message broker for the new order service.
  Kafka or SQS?
Bob: Kafka gives us replay and ordering, but ops is heavier. We'd need
  a cluster.
Carlos: SQS is simpler. We don't need replay for orders. But we lose
  ordering guarantees across consumers.
Dana: For analytics, replay would be nice. But we can batch from the DB
  instead.
Alice: So the trade-off is ops cost vs replay. Anyone feel strongly?
Bob: I'd rather not run a Kafka cluster for one service.
Carlos: Agreed. SQS for now, revisit if we need replay.
Alice: OK. SQS. Dana, you're OK with batching from DB?
Dana: Yes, for now.
Alice: Open question: what happens if SQS has a regional outage? Bob,
  can you look into a fallback?
Bob: I'll check multi-region options for next week.
```

**Read the output critically:**

- Did the model attribute opinions to people who didn't speak?
- Did it invent a consensus that wasn't reached?
- Did it fill gaps with plausible-sounding but unsupported reasoning?
- Are the open questions captured accurately?
- Fix the overclaims. Keep or remove the skill.

If you're stuck, open `course/day-5/phase 7/finish/` to see a known-good
decision document.

**Checkpoint 7 (optional):** you've turned meeting notes into a decision
document with a skill and labeled the claims.

---

## Common mistakes

- **Installing without inspecting.** The whole day turns on
  inspect-before-install. If you skip the source read, you've handed a
  third-party workflow write access to your machine with no idea what it
  does. A stop at inspection is a valid result.
- **Trusting the install count.** A popular skill isn't a safe skill. The
  count is anonymous CLI telemetry, not a quality signal. Read the
  `SKILL.md`, the scripts, and the network targets before you install.
- **Pasting a real credential into a skill.** Skills are third-party
  workflows. If one asks for an API key, token, or login, stop. Use
  fictional inputs only.
- **Accepting the skill's output as fact.** Every skill's output is a claim.
  Label each one: source evidence / inference / assumption / unsupported.
  The most common failure is invented constraints, policies, or
  stakeholders that weren't in the problem statement.
- **Forgetting to remove the skill.** "Keep or remove" is a real step. If
  the output isn't good enough to put your name on, remove the skill and
  prove cleanup with `npx skills list`. A success message isn't proof.
- **Not verifying claims against the source.** In the codebase exercise,
  open the actual files and check two claims the skill made. In the
  dashboard exercise, confirm the charts match the CSV numbers. Trust is
  earned by cross-checking, not by shape.

---

## Hand off

For the five-minute close, show (or write down, if you're working offline):

- One skill you used and what it produced.
- One claim you caught and fixed (source evidence vs unsupported).
- One sentence on whether you'd use this skill on Monday — and what you
  wouldn't trust it for.

If you're working offline or didn't finish every exercise, that's fine —
write the same three lines for whichever exercise you completed. The
deliverable is the judgment, not the count.

Close with the repeatable loop you used all week and all day:

```text
read the problem -> find a skill -> inspect the source -> install ->
run it -> read the output critically -> keep or remove
```

The skill is a tool. Its output is a claim, not a fact, until you've read
it critically. The same habit you built all week: specify, generate,
validate, read critically — now applied to reusable skills for real
architect tasks.

---

## References

The full list lives at [course/references.md](../references.md). The most
relevant for today:

- [skills.sh](https://skills.sh) — the catalog you search for every exercise
- [skills CLI](https://github.com/superpowers-extra/skills) — the `npx skills`
  command reference (`add`, `remove`, `list`, `DISABLE_TELEMETRY`)
- [GitHub Copilot docs](https://docs.github.com/en/copilot) — for invoking
  the skills once installed
- [Lighthouse accessibility audit](https://developer.chrome.com/docs/lighthouse/accessibility/scoring) —
  for the dashboard exercise a11y check