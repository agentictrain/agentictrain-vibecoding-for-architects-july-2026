# Day 2 — Define, draw, and plan

In two hours, you will turn the Integration Architecture Copilot scenario into
a reviewed interface contract and a bounded Day 3 plan. You will draw the
wireframe, fire an agent with no specs, generate specs twice (once without
grilling, once with), and compare the results to see what grilling changes.

You will not implement application code today. The app stays mechanically
unchanged from the starter shell. The deliverable is a **planning contract**
for the Day 3 weather app: a wireframe, a spec, an ADR, and an
implementation plan.

> [!NOTE]
> A shared [course glossary](../glossary.md) defines every technical term
> used across all four days. Open it in a tab and refer back when a term is
> unfamiliar.

## Prerequisites and preflight

You need a current browser, [Excalidraw](https://excalidraw.com) (web, no
install), and the following agent skills installed for GitHub Copilot:

- `brainstorming` — explores user intent, requirements, and design before
  any creative work
- `using-superpowers` — establishes how to find and use skills, requiring
  skill invocation before any response
- `grill-with-docs` — relentless interview that also produces ADRs and a
  glossary as it goes
- `write-spec` — writes a feature spec or PRD from a problem statement
- `architecture` — creates an Architecture Decision Record
- `writing-plans` — writes an ordered implementation plan
- `inquisition` — adversarial review of specs, plans, or code against
  project doctrine; reports deviations as "heresies" with severity levels.
  Installed as a custom agent (see Phase 6).

Some of these skills come from **superpowers**, others you can find on
[skills.sh](https://skills.sh).

### Check and install the skills

Before you start, ask Copilot to check whether the seven skills are
installed:

```text
Check whether these GitHub Copilot skills are installed: brainstorming,
using-superpowers, grill-with-docs, write-spec, architecture,
writing-plans, inquisition. For each one, tell me whether it's installed
or missing. Don't install anything yet — just report the status.
```

If any skill is missing, find it and install it **globally** so it's
available in every project, not just this one. Some are part of
superpowers; others are on [skills.sh](https://skills.sh) — search by
name. Ask Copilot to install whatever is missing:

```text
The following skills are missing: [list them]. For each one, find it
(superpowers or skills.sh) and install it globally. After installing,
confirm each is available.
```

Complete the rest of this preflight before the two-hour clock starts:

1. Open `course/day-2/starter/app/index.html` in the browser. You should
   see three empty boxes with headings and disabled buttons.
2. Open [excalidraw.com](https://excalidraw.com) and confirm you can create,
   save (`.excalidraw`), and export a PNG.

## What we are building

The **Integration Architecture Copilot** is a complete weather app that turns
public Open-Meteo data into a grounded LLM review. The app fetches current
conditions, a 24-hour hourly forecast, and a 7-day daily forecast, maps them
into a bounded `WeatherSignal` contract, and later (Day 4) sends the evidence
to an LLM for a weather-grounded review.

The user is a workshop participant practicing an agent-assisted workflow.
The result is **not** an operational decision — it's a reviewable package
another person can challenge.

The app has three regions on a single page:

1. **Context and controls** — a public location search (Open-Meteo geocoding
   API), a fictional operational scenario selector (warehouse planning or
   delivery planning), a runtime model settings area (Groq endpoint,
   model name, temporary demo credential — entered at
   runtime, held in memory only, never persisted, never in the
   URL/prompt/logs, cleared on reload), and two actions: **Fetch weather**
   and **Generate review**.

2. **Weather evidence** — three layers of weather data from Open-Meteo:
   - **Current conditions**: temperature, apparent temperature, humidity,
     precipitation, weather code, wind speed, wind direction, wind gusts,
     cloud cover, pressure, is day or night.
   - **Hourly forecast** (next 24 hours): temperature, precipitation
     probability, precipitation, weather code, wind speed.
   - **Daily forecast** (next 7 days): temperature max/min, precipitation sum,
     precipitation probability, weather code, wind speed max, sunrise,
     sunset.
   - A collapsible raw Open-Meteo response viewer.
   - A mapped `WeatherSignal` object with three nested sections: `current`,
     `hourly`, and `daily` — each with its own fields and units.
   - Visible loading, success, fallback, empty, and error-with-retry states.
   - Fallback data is fictional, deterministic, and clearly labeled — it never
     appears as a successful live response.

3. **Weather-grounded review** — the LLM takes the `WeatherSignal` and the
   fictional scenario and returns a review with five fields: `summary` (what
   the weather means for the scenario), `risks` (weather-related operational
   risks), `actions` (recommended actions given these conditions),
   `questions` (what we don't know yet), and `evidence` (which `WeatherSignal`
   fields back each claim). A persistent label marks the output as
   workshop-only advisory.

The data flow:

1. User searches a public location via Open-Meteo geocoding.
2. User selects a location.
3. App fetches current conditions + hourly forecast + daily forecast from
   Open-Meteo in a single request.
4. App maps the response into the `WeatherSignal` contract (current, hourly,
   daily sections).
5. App displays the readable weather card, raw response, and mapped object
   as three distinct views.
6. User enters runtime model settings (Groq endpoint, model name,
   temporary credential) in the settings area. The credential lives in
   memory only — never persisted, never in the URL, prompt, or logs,
   cleared on reload.
7. User clicks "Generate review".
8. App builds a bounded prompt from the scenario and `WeatherSignal`,
   sends it to the Groq endpoint (OpenAI-compatible chat completions),
   and requests strict JSON with five fields: summary, risks, actions,
   questions, evidence.
9. App validates the response and displays the review. If the LLM call fails,
   the weather evidence stays visible.

**Constraints:** plain HTML, CSS, and JavaScript. No framework, no backend,
no database, no authentication, no analytics, no deployment, no CDN libraries.
Open-Meteo geocoding and forecast are the only public data sources. The LLM
endpoint, model, and credential are entered at runtime and held in memory
only. Every form control has an accessible name. Keyboard focus is visible.
Changing status is announced through a live region. The page is responsive
from 320 pixels upward without horizontal scrolling.

**Non-goals:** no production, no persistence, no real internal systems, no
real customer or supplier data, no autonomous approval.

**Today's scope:** Day 2 only produces the planning contract for the Day 3
weather app (Region 1 + Region 2). The LLM and weather-grounded review
(Region 3) arrive on Day 4. The architect brief you'll use in Phase 2
describes the full app so the no-specs build gets the whole picture — but
the specs you generate in Phases 3 and 5 bound Day 3 only.

## How checkpoints work

This day has **phases** (progress markers in this guide) and no folder
checkpoints you build yourself — Day 2 produces planning artifacts only. You
mark your progress as you complete each phase. The Day 3 `starter/` folder
shipped with the course contains the known-good Day 2 contract, so you can
open it directly on Day 3.

If you get stuck, the facilitator will share a recovery branch or folder with
the known-good state for that phase. Keep your blocked work for comparison.

## Outcome and two-hour route

- **0–15 min — Phase 1: Sketch the UI.** Excalidraw, three regions.
- **15–30 min — Phase 2: Build with no specs.** Copy the architect brief, fire Copilot, observe the unreviewable result.
- **30–45 min — Phase 3: Specs without grill.** Generate spec, ADR, plan from the raw brief.
- **45–60 min — Phase 4: Grill the brief.** Run `grill-with-docs` on the brief.
- **60–80 min — Phase 5: Specs with grill.** Generate spec, ADR, plan from the grilled brief.
- **80–95 min — Phase 6: Adversarial review.** Run the torquemada custom agent, the inquisition skill via #runSubagent, and/or rubber-duck on the v2 docs. Fix Blocking / Mortal / Grave findings.
- **95–110 min — Phase 7: Compare.** Compare v1 vs v2. See the difference grilling makes.
- **110–120 min — Hand off.** Use your Phase 7 result or open `course/day-3/starter/`.

---

## Phase 1 — Sketch the UI

You'll sketch what the app looks like on the page. This is a **UI
mockup**, not a technical diagram — just boxes and labels showing what
the person sees. It's the only artifact you author yourself today;
everything else is generated by Copilot and the skills.

Open [Excalidraw](https://excalidraw.com) (web, no install). Excalidraw's
hand-drawn look is intentional — it signals "mock, not final" and
removes pressure to polish. Spend 10–15 minutes.

Draw three boxes for the three page regions, with a short label inside
each box saying what goes there:

```
┌─────────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ 1. Context and controls     │  │ 2. Weather evidence   │  │ 3. Weather-grounded   │
│                             │  │                      │  │    review            │
│ - Location search           │  │ - Current conditions │  │ - Summary           │
│ - Scenario selector         │  │   (temp, wind, rain, │  │ - Risks             │
│ - Model settings            │  │    weather code...)  │  │ - Actions            │
│ - Fetch / Generate buttons  │  │ - 24h hourly forecast│  │ - Questions         │
│                             │  │ - 7-day daily forecast│  │ - Evidence          │
│                             │  │ - Raw API response   │  │                      │
│                             │  │ - Mapped WeatherSignal│  │                      │
│                             │  │ - States: loading,   │  │                      │
│                             │  │   success, fallback, │  │                      │
│                             │  │   empty, error       │  │                      │
└─────────────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

Add a small note somewhere on the canvas: "Workshop-only advisory — not
approved architecture."

You're telling Copilot "build this" — a picture of the UI you want — not
a data-flow graph or a sequence diagram. Non-technical people sketch
screens; they don't draw architecture diagrams. The spec, ADR, and plan
you generate later today describe the behavior in words; the sketch shows
the shape.

Save the `.excalidraw` source and export a PNG. Keep them somewhere you
can find them for the Phase 7 comparison.

**Checkpoint 1:** UI sketch complete. Save the files somewhere you can
find them.

---
## Phase 2 — Build with no specs

Now fire an agent with the architect brief below and no specs, no plan, no
ADR. Just the brief. See what happens.

Open Copilot in the `course/day-2/starter/` folder and paste this exact
prompt:

**Ask Copilot:**

```text
Read AGENTS.md and TECH.md in this folder. Build the Integration Architecture
Copilot app described below into app/. Replace the placeholder content in
index.html, styles.css, and app.js with a working implementation.

THE ARCHITECT BRIEF

Product: A disposable workshop proof of concept that turns public weather
data and a fictional scenario into an advisory weather-grounded review.
The user is a workshop participant practicing an agent-assisted architecture
workflow. The result is not approved architecture or a production decision.

The app has three regions:

Region 1 - Context and controls:
- A public location search (Open-Meteo geocoding API).
- A fictional operational scenario selector (warehouse planning or delivery
  planning).
- Runtime model settings area: labeled fields for an approved OpenAI-compatible
  endpoint, model name, and temporary demo credential, plus a "Clear model
  settings" control. The credential is never persisted. It is entered at
  runtime, held in memory only, and must never enter localStorage,
  sessionStorage, cookies, IndexedDB, the URL, the prompt, request body,
  logs, screenshots, or files. All three fields must clear on reload.
- Two actions: "Fetch weather" and "Generate review".

Region 2 - Weather evidence:
- Current conditions: temperature, apparent temperature, humidity,
  precipitation, weather code, wind speed, wind direction, wind gusts,
  cloud cover, pressure, is day or night.
- Hourly forecast (next 24 hours): temperature, precipitation probability,
  precipitation, weather code, wind speed.
- Daily forecast (next 7 days): temperature max/min, precipitation sum,
  precipitation probability, weather code, wind speed max, sunrise, sunset.
- A collapsible raw Open-Meteo response viewer.
- A mapped WeatherSignal object with three nested sections: current,
  hourly, and daily — each with its own fields and units.
- Visible loading, success, fallback, empty, and error-with-retry states.
- Fallback data is fictional, deterministic, and clearly labeled. It must
  never appear as a successful live response.

Region 3 - Weather-grounded review:
- Summary: what the weather means for the chosen scenario.
- Risks: weather-related operational risks for this scenario.
- Actions: recommended actions given these conditions.
- Questions: what we don't know yet.
- Evidence: which WeatherSignal fields back each claim.
- A persistent label that the output is workshop-only advisory and not
  approved architecture.

Data flow:
1. User searches a public location via Open-Meteo geocoding.
2. User selects a location.
3. App fetches current conditions + hourly forecast + daily
   forecast from Open-Meteo in a single request.
4. App maps the response into the WeatherSignal contract (current,
   hourly, daily sections).
5. App displays the readable weather card, raw response, and mapped object
   as three distinct views.
6. User enters runtime model settings (endpoint, model, credential) in the
   settings area. The credential lives in memory only — never persisted,
   never in the URL, prompt, or logs, cleared on reload.
7. User clicks "Generate review".
8. App builds a bounded prompt from the scenario and WeatherSignal,
   sends it to the Groq endpoint (OpenAI-compatible chat completions),
   and requests strict JSON with five fields: summary, risks, actions,
   questions, evidence.
9. App validates the response and displays the review.

Constraints:
- Plain HTML, CSS, and JavaScript. No framework, no backend, no database, no
  authentication, no analytics, no deployment, no CDN libraries.
- Open-Meteo geocoding and forecast are the only public data sources.
- The LLM endpoint, model, and credential are entered at runtime in a
  dedicated settings area and held in memory only. They must never be
  persisted (no localStorage, sessionStorage, cookies, IndexedDB), encoded
  in the URL, sent in the prompt or request body, written to logs, or saved
  to files. They must clear on reload.
- No Mermaid, no diagram rendering. The review is plain text.
- Every form control has an accessible name. Keyboard focus is visible.
  Changing status is announced through a live region.
- The page is responsive from 320 pixels upward without horizontal scrolling.

Non-goals:
- No production, no persistence, no real internal systems, no real customer
  or supplier data, no autonomous approval.
- This is a throwaway version to see what happens with no specs.

Build it. Open app/index.html in a browser and tell me what works and what
doesn't.
```

**What you should observe:**

- Copilot builds *something*. It probably works-ish for a demo.
- But it invents data shapes that don't match what Open-Meteo actually returns.
- It guesses at states (loading? error? fallback?) inconsistently.
- It makes up the LLM output structure without a contract.
- It can't explain *why* it made each choice.
- The result is not reviewable — there's no contract to check against.

This is the teaching moment: **a rich prompt is not a spec.** The agent builds,
but you can't review what it built because there's no contract to review
against.

Keep this build for comparison. Don't commit it yet.

**Checkpoint 2:** no-specs build complete. You've seen what happens without a
contract.

---

## Phase 3 — Specs without grill

Now generate the spec, ADR, and plan from the raw brief — without grilling it
first. This shows what the skills produce when given an ungrilled brief.

**Scope: the weather app only.** The LLM and weather-grounded review are
out of scope for these specs. They arrive later as a demonstration of
Copilot's plan mode. Don't spec them here.

> [!NOTE]
> Phases 3, 4, and 5 run in a **separate agent session** from Phase 2. The
> new session has no memory of Phase 2's prompt. Each prompt below includes
> the full app context inline so the agent has everything it needs without
> reading `plans/brief.md`.

**Where the planning artifacts live.** Every planning file you generate
today goes into the `plans/` folder inside your current checkpoint folder
(for example, `course/day-2/starter/plans/spec_v1.md`). The course ships a
known-good set at `course/day-3/starter/plans/` — if your plans go off the
rails, open that folder and compare.

**Ask Copilot:**

```text
Use the write-spec, architecture, and writing-plans skills.

CONTEXT (read-only — do not build anything from this block):

Product: a disposable workshop proof of concept that fetches public
weather data (Open-Meteo) and maps it into a bounded WeatherSignal contract.
The user is a workshop participant practicing an agent-assisted
architecture workflow. The result is not approved architecture or a
production decision.

This spec covers the weather app ONLY.

Three regions (only Regions 1 and 2 are implemented in this phase):

Region 1 - Context and controls:
- Public location search (Open-Meteo geocoding API).
- Fictional operational scenario selector (warehouse planning or delivery
  planning).
- One action: "Fetch weather".

Region 2 - Weather evidence:
- Current conditions: temperature, apparent temperature, humidity,
  precipitation, weather code, wind speed, wind direction, wind gusts,
  cloud cover, pressure, is day or night.
- Hourly forecast (next 24 hours): temperature, precipitation probability,
  precipitation, weather code, wind speed.
- Daily forecast (next 7 days): temperature max/min, precipitation sum,
  precipitation probability, weather code, wind speed max, sunrise, sunset.
- Collapsible raw Open-Meteo response viewer.
- Mapped WeatherSignal object with three nested sections: current, hourly,
  and daily — each with its own fields and units.
- Visible loading, success, fallback, empty, and error-with-retry states.
- Fallback data is fictional, deterministic, and clearly labeled. Never
  appears as a successful live response.

Region 3 - Placeholder:
- A reserved labeled region in the page shell. Out of scope for this phase.

Data flow (weather app slice):
1. User searches a public location via Open-Meteo geocoding.
2. User selects a location.
3. App fetches current conditions + hourly forecast + daily forecast from
   Open-Meteo in a single request.
4. App maps the response into the WeatherSignal contract (current, hourly,
   daily sections).
5. App displays the readable weather card, raw response, and mapped object
   as three distinct views.

Constraints:
- Plain HTML, CSS, JavaScript. No framework, no backend, no database, no
  authentication, no analytics, no deployment, no CDN libraries.
- Open-Meteo geocoding and forecast are the only public data sources.
- Every form control has an accessible name. Keyboard focus is visible.
  Changing status is announced through a live region.
- Page is responsive from 320 pixels upward without horizontal scrolling.

Non-goals:
- No production, no persistence, no real internal systems, no real customer
  or supplier data, no autonomous approval.

END CONTEXT

Before you write anything, ask me questions about the context above —
edge cases, failure states, missing details, anything that's unclear or
ambiguous. For each question, propose your own recommended answer or
default so I can just say "yes" or correct you. Wait for my answers
before you start writing.

Then produce three documents and save them:
1. Use the write-spec skill to write a feature spec / PRD covering: goal,
   target users, success metrics, constraints, functional requirements,
   the WeatherSignal contract, the three interface regions (but only the
   first two are implemented in this phase; the third is a placeholder),
   the visible states, the safety boundaries, and the non-goals. Include
   Mermaid diagrams where they help: a component diagram (browser,
   Open-Meteo, WeatherSignal, UI regions), a sequence diagram (browser ↔
   Open-Meteo request/reply), a data model diagram (WeatherSignal shape
   with current/hourly/daily nested sections), and a user flow diagram
   (search → select → fetch → map → display). Save it as plans/spec_v1.md.
2. Use the architecture skill to write an ADR for the decision: "Map
   public Open-Meteo weather data into a bounded WeatherSignal contract
   in a disposable browser proof of concept with no backend." Status
   Proposed. Include a Mermaid component diagram showing the decision's
   scope. Save it as plans/adr_v1.md.
3. Use the writing-plans skill to write an ordered implementation plan
   for the weather app only: location search, current + hourly + daily
   forecast fetch, WeatherSignal mapping (current, hourly, daily
   sections), evidence views, fallback, failure states, and tests.
   Include a Mermaid flowchart of the implementation steps. Save it as
   plans/plan_v1.md.
```

**What you should observe:**

- The skills produce structured documents — much more reviewable than the
  Phase 2 throwaway.
- But the spec has gaps: edge cases the brief didn't mention (null values,
  stale responses, credential survival across reload), the grill would have
  caught.
- The ADR is plausible but shallow — it documents the decision but not the
  alternatives that were rejected.
- The plan is ordered but thin — it doesn't account for failure paths the
  grill would have surfaced.

**Checkpoint 3:** v1 specs generated. Keep them for comparison.

---

## Phase 4 — Grill the brief

Now grill the brief. The grill relentlessly interviews you (or Copilot on
your behalf) about the brief: edge cases, failure states, review
ownership, data provenance. It also produces an ADR and a glossary as it
goes.

**Ask Copilot:**

```text
Use the grill-with-docs skill.

CONTEXT (read-only — do not build anything from this block):

Product: a disposable workshop proof of concept that fetches public weather
data (Open-Meteo) and maps it into a bounded WeatherSignal contract. The user
is a workshop participant practicing an agent-assisted architecture workflow.
The result is not approved architecture or a production decision.

This spec covers the weather app ONLY.

Three regions (only Regions 1 and 2 are implemented in this phase):

Region 1 - Context and controls:
- Public location search (Open-Meteo geocoding API).
- Fictional operational scenario selector (warehouse planning or delivery
  planning).
- One action: "Fetch weather".

Region 2 - Weather evidence:
- Current conditions: temperature, apparent temperature, humidity,
  precipitation, weather code, wind speed, wind direction, wind gusts,
  cloud cover, pressure, is day or night.
- Hourly forecast (next 24 hours): temperature, precipitation probability,
  precipitation, weather code, wind speed.
- Daily forecast (next 7 days): temperature max/min, precipitation sum,
  precipitation probability, weather code, wind speed max, sunrise, sunset.
- Collapsible raw Open-Meteo response viewer.
- Mapped WeatherSignal object with three nested sections: current, hourly,
  and daily — each with its own fields and units.
- Visible loading, success, fallback, empty, and error-with-retry states.
- Fallback data is fictional, deterministic, and clearly labeled. Never
  appears as a successful live response.

Region 3 - Placeholder:
- A reserved labeled region in the page shell. Out of scope for this phase.

Data flow (weather app slice):
1. User searches a public location via Open-Meteo geocoding.
2. User selects a location.
3. App fetches current conditions + hourly forecast + daily forecast from
   Open-Meteo in a single request.
4. App maps the response into the WeatherSignal contract (current, hourly,
   daily sections).
5. App displays the readable weather card, raw response, and mapped object
    as three distinct views.

Constraints:
- Plain HTML, CSS, JavaScript. No framework, no backend, no database, no
  authentication, no analytics, no deployment, no CDN libraries.
- Open-Meteo geocoding and forecast are the only public data sources.
- Every form control has an accessible name. Keyboard focus is visible.
  Changing status is announced through a live region.
- Page is responsive from 320 pixels upward without horizontal scrolling.

Non-goals:
- No production, no persistence, no real internal systems, no real customer
  or supplier data, no autonomous approval.

END CONTEXT

Grill the context above relentlessly: edge cases, failure states, what
survives reload, what gets invented, what gets reviewed, who reviews it,
what provenance means, what fallback means, what advisory means. Produce
an ADR and a glossary as you go. Save the sharpened brief as
plans/brief_v2.md, the ADR as plans/adr_v2.md, and the glossary as
plans/glossary_v2.md.
```

Answer the grill's questions honestly. If you don't know, say so — the grill
will mark it as an open question. If Copilot can answer on your behalf, let
it — but read the answer before accepting.

**What you should observe:**

- The grill surfaces questions the brief never addressed: "What happens
  when Open-Meteo returns 200 but `current.temperature_2m` is null?" "What
  if the hourly array is shorter than 24?" "What survives a page reload?"
  "Who reviews the mapped data and how do we know it's correct?"
- The ADR is deeper: it documents the alternatives the brief implicitly
  rejected (full backend, persistent storage, real internal data).
- The glossary pins down terms: `WeatherSignal`, `evidence`, `fallback`,
  `advisory`, `provenance`.

**Checkpoint 4:** grill complete. The brief is sharpened.

---

## Phase 5 — Specs with grill

Now generate the spec, ADR, and plan again — this time from the grilled
brief. Compare the two outputs. Same weather-app-only scope as Phase 3.

**Ask Copilot:**

```text
Use the write-spec, architecture, and writing-plans skills.

Read the grilled brief at plans/brief_v2.md and the glossary at
plans/glossary_v2.md. Everything you need is there — the product, the
scope, the constraints, the edge cases the grill surfaced, and the
pinned terms. Also read the ADR draft at plans/adr_v2.md.

Before you write anything, ask me questions about the grilled brief —
anything that's still unclear or ambiguous after the grill. For each
question, propose your own recommended answer or default so I can just
say "yes" or correct you. Wait for my answers before you start writing.

Then produce three documents and save them:
1. Use the write-spec skill to write a feature spec / PRD covering: goal,
   target users, success metrics, constraints, functional requirements,
   the WeatherSignal contract, the three interface regions (but only the
   first two are implemented in this phase; the third is a placeholder),
   the visible states, the safety boundaries, and the non-goals. The
   spec must address every open question the grill raised. Include
   Mermaid diagrams where they help: a component diagram (browser,
   Open-Meteo, WeatherSignal, UI regions), a sequence diagram (browser ↔
   Open-Meteo request/reply), a data model diagram (WeatherSignal shape
   with current/hourly/daily nested sections), and a user flow diagram
   (search → select → fetch → map → display). Save it as plans/spec_v2.md.
2. Use the architecture skill to write the final ADR for the decision:
   "Map public Open-Meteo weather data into a bounded WeatherSignal
   contract in a disposable browser proof of concept with no backend."
   Status Proposed. Document the alternatives considered during the
   grill and the consequences. Include a Mermaid component diagram
   showing the decision's scope. Save it as plans/adr_v2_final.md.
3. Use the writing-plans skill to write an ordered implementation plan
   for the weather app only: location search, current + hourly + daily
   forecast fetch, WeatherSignal mapping (current, hourly, daily
   sections), evidence views, fallback, failure states, and tests. The
   plan must account for every failure path the grill surfaced. Include
   a Mermaid flowchart of the implementation steps. Save it as
   plans/plan_v2.md.
```

**What you should observe:**

- The v2 spec is denser and more specific. Edge cases the grill caught are
  now explicit requirements, not implicit assumptions.
- The v2 ADR documents alternatives the v1 ADR didn't mention.
- The v2 plan has more steps — but each step is testable and each failure
  path has a handling strategy.

**Checkpoint 5:** v2 specs generated.

---

## Phase 6 — Adversarial review

Now review the v2 spec and plan with **three adversarial tools**. They
complement each other: one delegates a review to a subagent in your
current session, one runs the inquisition skill in a brand new session,
and rubber duck gives a general second opinion from a different AI
model. Use all three if you have time; use at least one.

### Option 1 — #runSubagent (review in a separate context)

**Subagents** let you delegate a task to an isolated agent with its own
context window — it runs without interrupting your main session and
returns the result when done.

First, make sure the inquisition skill is installed (see preflight or
unzip `assets/skills/inquisition.zip` and install it). Then enable the
`runSubagent` tool in your Copilot session (click the tools icon and
enable `runSubagent`), and type:

```text
#runSubagent Execute Torquemada to run an adversarial review of the repo.
```

The subagent runs independently and returns the report to your main
session. Read it and fix **Mortal** and **Grave** findings before you
continue. **Venial** and **Suspicion** items are judgment calls.

### Option 2 — Inquisition skill in a new session

Open a **brand new Copilot session** in your project folder (not the
session you used for Phases 3–5). The new session has no memory of your
previous work — it starts fresh and reviews the documents on their own
merits.

Make sure the inquisition skill is installed (see preflight or unzip
`assets/skills/inquisition.zip` and install it). Then type:

```text
Execute Torquemada to run an adversarial review of the repo.
```

Read the report and fix **Mortal** and **Grave** findings as above.

### Option 3 — Rubber duck (general second opinion)

The **rubber duck** is a built-in critic in the GitHub Copilot App that
reviews your plan using a **different AI model** from the one driving
your session. It catches blind spots the main model missed — design
flaws, missing edge cases, weak reasoning. It categorizes feedback as
**Blocking**, **Non-blocking**, or **Suggestions**.

> [!NOTE]
> The **GitHub Copilot App** is the chat application (separate from the
> editor extension). If you only have Copilot in VS Code, the `/rubber-duck`
> and `/spar` commands may not be available — in that case use Option A
> (Option 1 or 2) instead, or ask Copilot in your editor to "review
> this plan as a different model would, focusing on Blocking findings."

Open the Copilot App, start a session in your project folder, and type:

```text
/rubber-duck Review the v2 spec at plans/spec_v2.md and the v2 plan at
plans/plan_v2.md. Find gaps, weak reasoning, missing edge cases, and
anything that would break during implementation. Categorize each finding
as Blocking, Non-blocking, or Suggestion.
```

Read the critique. Fix **Blocking** items before you continue.
**Non-blocking** items should also be fixed. **Suggestions** are
judgment calls.

### After either review

**What you should observe:**

- The review catches things the grill missed: silent assumptions,
  missing acceptance criteria, risks with weak mitigations, plan steps
  that don't match the spec, terminology inconsistencies.
- A clean report (no Blocking / Mortal / Grave findings) means the v2
  documents are strong enough to be the contract.
- The fix-then-rerun loop is the same habit: the first draft is a claim,
  the review is the check, the fix is the repair.

**Checkpoint 6:** the review is clean. No Blocking / Mortal / Grave
findings remain in the v2 spec or plan.

---

## Phase 7 — Compare v1 vs v2

Read both versions side by side:

- `plans/spec_v1.md` vs `plans/spec_v2.md`
- `plans/adr_v1.md` vs `plans/adr_v2_final.md`
- `plans/plan_v1.md` vs `plans/plan_v2.md`

Ask yourself:

- Which spec would you rather hand to a developer who has never met you?
- Which plan would you rather follow when something goes wrong on Day 3?
- Which ADR would you rather defend in a review?

The teaching: **the skills replace the architect's typing, not the
thinking.** The grill is the thinking. Without it, the skills produce
plausible but shallow documents. With it, they produce reviewable contracts
that survive contact with Day 3.

Also compare both against the Phase 2 throwaway build:

- The throwaway build has no contract. You can't review it.
- The v1 specs are reviewable but shallow. The grill would have caught the
  gaps.
- The v2 specs are reviewable and deep. They're the contract.

**Note on scope:** these specs cover the weather app only. The LLM and
weather-grounded review arrive later as a demonstration of Copilot's
plan mode — not as something these specs define. The architect brief
describes the full app (so Phase 2 builds the wrong thing — teaching
moment), but the specs bound the weather app only.

**Checkpoint 7:** comparison complete.

---

## Common mistakes

- **Skipping the grill.** The whole day turns on the v1-vs-v2 comparison.
  If you skip Phase 4, Phase 5 produces the same shallow output as Phase 3 and
  the teaching disappears. Run the grill even if it feels slow.
- **Letting the skills invent scope.** `write-spec` and `writing-plans` will
  happily add the LLM, the review, and persistence if you don't bound them.
  Re-read the "weather app ONLY" line in the prompt before you send it.
- **Accepting the first plan without pushing back.** The skills ask
  clarifying questions — answer them, don't just say "yes" to everything. A
  wrong default on Day 2 becomes a bug on Day 3.
- **Forgetting to save the planning artifacts.** If Copilot writes the spec
  into chat instead of `plans/spec_v2.md`, Day 3 has nothing to read. Confirm
  the files exist on disk before you close the session.
- **Not running the inquisition.** It's the only check that catches
  doctrine violations the rubber-duck won't. Run it even if you're short on
  time — a Mortal heresy is cheaper to fix today than on Day 3.

---

## Accessibility check

You didn't build app code today, but the starter shell must stay accessible
so Days 3 and 4 inherit a clean baseline. Before you hand off:

1. Open `course/day-2/starter/app/index.html` in your browser.
2. Press Tab a few times. A visible focus outline must follow your keystroke.
3. Open the browser's accessibility inspector (DevTools → Elements →
   Accessibility, or Lighthouse → Accessibility). Confirm:
   - The page has one `<main>` landmark.
   - The three regions (`controls`, `evidence`, `review`) have labeled
     headings.
   - Every disabled button has an accessible name (visible text or
     `aria-label`).
4. If any of those fail, tell Copilot to fix the starter before you continue.
   The shell ships accessible — a failure means something changed it.

---

## Hand off to Day 3

Either use the result of Phase 7 (your grilled `spec_v2.md`, `adr_v2_final.md`,
and `plan_v2.md`) or open the `course/day-3/starter/` folder, which already
contains the known-good Day 2 contract. Day 3 starts from there.

---

## References

The full list lives at [course/references.md](../references.md). The most
relevant for today:

- [Excalidraw](https://excalidraw.com) — the web app for the Phase 1 sketch
- [GitHub Copilot docs](https://docs.github.com/en/copilot) — setup, chat,
  and the skills the preflight installs
- [skills.sh](https://skills.sh) — where to find and inspect the planning
  skills (`write-spec`, `architecture`, `writing-plans`, `grill-with-docs`,
  `inquisition`)
- [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/) — for the
  accessibility check on the starter shell