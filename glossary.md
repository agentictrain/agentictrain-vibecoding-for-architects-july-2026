# Course glossary

A shared reference for terms used across all four days. Each day's guide
introduces some of these in context; this file collects them in one place so
you don't have to leave the course to look one up.

> **Scope:** workshop-only. These definitions describe how the terms are used
> in this disposable proof of concept, not how they work in production systems.

---

## Application and data terms

**WeatherSignal** — the app's own clean, bounded copy of the raw Open-Meteo
response. It has three nested sections (`current`, `hourly`, `daily`), each
with its own fields and units, plus shared fields (`location`, `latitude`,
`longitude`, `timezone`, `sourceUrl`, `isFallback`). It is the only shape the
model is allowed to see.

**Open-Meteo** — a free public weather API. The app uses two of its endpoints:
geocoding (city name → coordinates) and forecast (coordinates → current +
hourly + daily weather). It is the only public data source the app may call.

**WMO weather code** — a number Open-Meteo uses to describe the sky
condition (0 = clear, 1 = mainly clear, 61 = slight rain, 95 = thunderstorm).
The full table is published by the World Meteorological Organization. The app
passes the number through unchanged; it does not translate it to a word.

**Fallback data** — a fictional, deterministic, always-the-same
`WeatherSignal` for "Workshop Harbor, Fictional Coast", with `isFallback: true`.
It exists so the app can be demoed without a live network. It must never appear
as a successful live response — a visible **FICTIONAL FALLBACK** banner and the
`isFallback` flag keep it honest.

**Provenance** — where a piece of data came from. In this app, provenance is
the `sourceUrl` field on the `WeatherSignal` (the exact Open-Meteo address
that returned the data) and the `isFallback` flag. A reviewer can trace any
claim back to its source.

**Advisory** — the output of this app is a workshop-only opinion, not an
approved decision. Every model-generated review is labeled "Model inference —
workshop-only advisory, not approved architecture."

---

## Browser and accessibility terms

**Debounce** — wait a short time (the shipped example uses 300 ms; your
Day 2 plan pins the value for your build) after the user stops
typing before acting, so the app doesn't search on every keystroke.

**Focus trap** — when a modal dialog is open, Tab and Shift+Tab cycle only
inside the dialog. Focus can't escape to the page behind it. Esc closes the
dialog and focus returns to the button that opened it.

**Live region** — an invisible page area that announces changes to a screen
reader. The app uses one to say "loading", "N results found", "no results",
"selected: city name", and errors out loud.

**Keyboard focus** — the on-screen element that receives keyboard input. The
app must show a visible outline around whatever has focus at every step, so a
keyboard-only user can see where they are.

**WAI-ARIA** — attributes the app adds to HTML so screen readers understand
roles and states. Used here: `role="dialog"`, `aria-modal="true"`,
`aria-labelledby`, `aria-busy`, `aria-live`.

**CORS (Cross-Origin Resource Sharing)** — a browser security rule that
decides whether a web page is allowed to call a given URL. If the model
endpoint doesn't allow browser CORS, the request fails. This is why the course
moved from ollama cloud (HTTP 405 on browser requests) to Groq Free tier
(accepts browser requests).

---

## Model and prompt terms

**OpenAI-compatible chat completions** — a request shape where the app sends
a list of messages (system + user) to an endpoint and receives a single
assistant reply. Groq Free tier speaks this shape.

**JSON mode** — a request option (`response_format: { type: "json_object" }`)
that tells the model to return only valid JSON, not prose. The app uses it so
the five-field review can be parsed reliably.

**Stale-response race** — a timing bug where an old model reply arrives after
the user has already changed the settings, the scenario, or the weather
evidence. The app must ignore the old reply, not overwrite the newer state.

**Bounded prompt** — a prompt that contains only reviewed inputs (the
`WeatherSignal` and the scenario) and never the credential, internal system
names, or unrelated context. The credential goes only in the `Authorization`
header, never in the prompt body.

**Grounding** — tying a model's claim to a specific piece of source evidence.
The review's `evidence` field lists `WeatherSignal.current.temperature` (and
similar paths) so a reviewer can check each claim against the actual data.

---

## Planning and review terms

**Spec (feature spec / PRD)** — a document that states the goal, users,
constraints, functional requirements, data contract, visible states, safety
boundaries, and non-goals. Produced on Day 2 with the `write-spec` skill.

**ADR (Architecture Decision Record)** — a short document that records one
decision, its drivers, the alternatives considered, and the consequences.
Produced on Day 2 with the `architecture` skill.

**Implementation plan** — an ordered list of small, testable build steps,
each with a handling strategy for its failure paths. Produced on Day 2 with
the `writing-plans` skill.

**Grill** — a relentless interview (run by the `grill-with-docs` skill) that
surfaces edge cases, failure states, and unstated assumptions in a brief
before specs are written from it. The thinking the skills can't do for you.

**Inquisition** — an adversarial review (run by the `inquisition` skill) that
reads the project's doctrine (AGENTS.md, TECH.md, the spec, the plan) and
reports deviations as "heresies" with severity levels: **Mortal** (must fix),
**Grave** (should fix), **Venial** (judgment call), **Suspicion** (worth a
look).

**Rubber duck** — a built-in critic in the GitHub Copilot App that reviews
your work using a **different AI model** from the one driving your session.
Categorizes findings as **Blocking**, **Non-blocking**, or **Suggestion**.

**Spar** — a review mode in the GitHub Copilot App that challenges your code
the way a human reviewer would, citing the spec section and code location for
each finding.

---

## Security terms

**Threat model** — a short list of: the **assets** (what an attacker wants),
the **trust boundaries** (where data crosses from a safe zone to a risky
one), the **attacker capabilities** (what an attacker can do), and the
**abuse paths** (how they combine to reach an asset). For each abuse path you
name one mitigation the code already has, and any gap.

**Credential boundary** — the rule that the temporary model credential lives
only in page memory and goes only in the `Authorization` header. It must never
enter `localStorage`, `sessionStorage`, cookies, IndexedDB, the URL, the
prompt, the request body, logs, screenshots, or files. It clears on reload.

**Script injection (XSS)** — an attack where hostile text sent by the model is
rendered as HTML and runs as code. The app prevents it by rendering every
review field as plain text (text nodes, not `innerHTML`), so `<script>` tags
appear as visible text instead of executing.

---

## Skills terms (Day 5)

**Skill** — a reusable, triggerable workflow package with resources and stop
conditions. Install once, invoke by name later. Think "review my ADR" instead
of re-typing the whole review prompt every time.

**Prompt** — a one-time request for this interaction. Not reusable.

**Custom instruction** — persistent local guidance that applies to every
session.

**Agent** — reasoning, context, and tools acting on a task.

**MCP tool** — a connection to an external capability or data source.

**skills.sh** — the public catalog where you search for, inspect, and install
skills. Listings are not guaranteed safe or high quality — inspect before you
install.

**CLI telemetry** — anonymous usage data the skills CLI sends by default.
`DISABLE_TELEMETRY=1` turns it off for a single command.

---

## Course structure terms

**Checkpoint folder** — a complete, known-good snapshot of the app at one
stage. Named `phase N/` (the state at the end of Phase N) or `final/` (the
finished day). The `starter/` folder is the beginning-of-day shell.

**`implementation/` folder** — inside each checkpoint, where Copilot records
decisions it made without asking you (`decisions.md`), changed files
(`changed-files.md`), debug notes (`debug-notes.md`), and verification results
(`verify.md`). Read it first when the code looks odd.

**`plans/` folder** — inside each checkpoint, where the spec, ADR, plan, and
glossary live. The course ships a known-good set at
`course/day-3/starter/plans/`.

**Recovery** — when you're blocked, keep your work, open the next checkpoint
folder the course ships, rerun its syntax checks plus `npm run verify`, and
continue from that verified folder. Never edit an earlier checkpoint to make
later work pass.