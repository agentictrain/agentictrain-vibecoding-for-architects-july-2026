# Day 4 — Add the AI review

Today you add the third box to the weather app: an **AI review**. The user
picks a fictional scenario (warehouse planning or delivery planning), the
app sends the weather data and the scenario to an AI model, and the model
replies with five things: a summary, the risks, what to do, what's still
unknown, and which weather fields back each claim. You will not write the
code yourself — you tell GitHub Copilot what to build, check the result in
the browser, and fix what's wrong.

The weather app you built must keep working. Nothing you do today
should break it.

The whole thing takes two hours. You work in small steps called
**checkpoints**. If a step breaks, you open the next checkpoint folder,
which already has the correct code for that step, and keep going.

> [!NOTE]
> A shared [course glossary](../glossary.md) defines every technical term
> used across all four days. Open it in a tab and refer back when a term is
> unfamiliar.

## Prerequisites and preflight

Before the clock starts, make sure you have:

- The weather app working in your browser (live weather, fallback,
  and retry all work).
- GitHub Copilot working in your editor.
- The three pieces of model access, which you can get yourself from the
  [Groq Console](https://console.groq.com) (free tier, no payment required
  for the free quota): an **endpoint** (a web address for Groq, which
  speaks the OpenAI-compatible chat-completions shape), a **model name**
  (e.g. `openai/gpt-oss-20b`), and a **temporary demo credential** (a Groq
  API key that lets the app call the model). These are workshop-only,
  entered at runtime, and never saved.

Open `course/day-4/starter/app/index.html` in your browser. Search a
city, pick it, click **Fetch weather**, and confirm the current, hourly,
and daily cards all show real data. Then click **Load fictional fallback**
and confirm the fake data appears. If anything is broken, run
`npm run verify` from the repository root and fix what it reports before
you continue.

> [!WARNING]
> Use only the temporary credential supplied for the workshop. Never
> paste a personal or production credential. Do not put any credential in
> a prompt, source file, screenshot, chat, terminal history, issue, or
> Git commit.

> [!NOTE]
> **If the model is unavailable.** Models on Groq Free tier get
> deprecated or rate-limited over time. If `openai/gpt-oss-20b` (or
> whatever the facilitator supplied) returns 404 or "model not found",
> pick any other OpenAI-compatible model on Groq Free tier and update the
> **model name** field in the settings modal. The app doesn't pin a
> specific model — it sends whatever you enter. The five-field contract
> is the same regardless of which model produces it.

## What we are building

On a previous step you wrote a plan for the weather app and then built
it. Today you build **Region 3** — the weather-grounded review. There is
no pre-written plan for this part; it was left out on purpose so today
you'd use Copilot's **plan mode**: ask Copilot to make a plan first, read
it, push back, then build. That's the teaching — you see what Copilot
does on its own when you let it plan.

The full app has three boxes on one page. Today you build the third box.

1. **Context and controls** — already built. Today you add a
   **model settings modal**: a "Model settings" button opens a dialog
   with three fields for the model endpoint, model name, and temporary
   credential, plus Save, Cancel, and **Clear model settings** buttons.
   The credential is **never saved** — it lives in memory only, clears
   on reload, and never enters browser storage, the URL, the prompt,
   logs, screenshots, or files. You also enable the **Generate review**
   button (it was disabled before).

2. **Weather evidence** — already built. Nothing changes today.

3. **Weather-grounded review** — today's work. The app sends the
   WeatherSignal and the chosen scenario to the model and asks for a
   strict JSON reply with exactly five fields:
   - `summary` — what the weather means for this scenario (1–3 sentences).
   - `risks` — 1–6 weather-related operational risks.
   - `actions` — 1–6 recommended actions for these conditions.
   - `questions` — 1–6 things we don't know yet.
   - `evidence` — 1–6 items, each naming a `WeatherSignal` field that
     backs a claim above.
   The review is plain text — no HTML, no diagrams, no code from the
   model. A label marks it as "Model inference — workshop-only advisory,
   not approved architecture." If the model call fails, the weather
   evidence stays visible.

The most important idea today: **a model reply is not source evidence.**
The weather data is the evidence. The model's review is an inference on
top of it. Keep them visibly separate so a reviewer can tell which is
which.

## How checkpoints work

Day 4 has **phases** (progress markers in this guide) and **checkpoint
folders** Copilot builds into. You paste a prompt; Copilot creates the
folder and the files.

If you get stuck on a checkpoint, open the **next** checkpoint folder the
course ships and point Copilot at it. That folder already has the correct
code for that step. Keep your blocked work so you can compare. Never edit
an earlier checkpoint folder to make later work pass.

> [!NOTE]
> Each checkpoint folder has an `implementation/` subfolder. When Copilot
> makes a decision without asking you (for example, the ollama→Groq
> migration recorded in `phase 3/implementation/decisions.md`), it records
> it there. When something looks odd, read `implementation/decisions.md`
> and `implementation/debug-notes.md` first — they explain why the code is
> the way it is.

The checkpoint path for Day 4:

```text
course/day-4/starter/   the weather app; no model controls yet
course/day-4/phase 2/   settings area added; no model call yet
course/day-4/phase 3/   model call + validated review
course/day-4/phase 5/   adversarial review clean; your final app with the AI review
course/day-4/phase 7/   build the whole review in one shot (optional)
```

## Outcome and two-hour route

- **0–15 min — Phase 1: Look before you build.** Open the starter, sketch
  the review UI you want.
- **15–35 min — Phase 2: Add the settings area.** Tell Copilot to build
  `phase 2/`. Test the credential clears on reload.
- **35–70 min — Phase 3: Add the review.** Start Copilot's plan mode,
  read the plan, then build `phase 3/`. Generate a review, check the five fields.
- **70–90 min — Phase 4: Read the review critically.** Discuss which
  claims trace to evidence and which are guesses.
- **90–100 min — Phase 5: Adversarial review.** Run a second-opinion code
  review and a credential-boundary threat model against the `phase 3/` code.
- **100–115 min — Phase 6: Break everything.** Block the model, send bad
  JSON, change settings mid-request. Confirm the weather stays visible.
- **115–120 min — Hand off.** Use your final result or open
  `course/day-5/starter/`.
- **If you have time left — Optional Phase 7: Build the whole review in
  one shot.** Give Copilot the whole review in one prompt instead of
  plan-mode, and compare.

---

## Phase 1 — Look before you build

The most important idea today: **a model reply is not source evidence.**
The weather data is the evidence (from Open-Meteo, mapped into
WeatherSignal). The model's review is an inference on top of it. Keep
them visibly separate so a reviewer can tell which is which.

### Open the starter

Open `course/day-4/starter/app/index.html`. Search a city, pick it,
click **Fetch weather**, and confirm the current, hourly, and daily cards
all show real data. Then click **Load fictional fallback** and confirm the
fake data appears. No model setting or model request exists yet — that's
today's work.

### Sketch the review UI you want

Before you tell Copilot what to build, sketch what you want the review to
look like on the page. This is a **UI mockup**, not a technical diagram —
just boxes and labels showing what the person sees. Open
[Excalidraw](https://excalidraw.com) and draw the third region of the
page: where the review goes, what the five fields look like on screen,
where the "Generate review" button sits, and where the "Model inference —
workshop-only advisory" label goes.

```
┌──────────────────────────────────────────────────────────┐
│  3. Weather-grounded review                               │
│                                                          │
│  [Generate review]  (button, disabled until settings set) │
│                                                          │
│  Model inference — workshop-only advisory, not approved  │
│  architecture.                                            │
│                                                          │
│  Summary:  [1–3 sentences about what the weather means]  │
│                                                          │
│  Risks:                                                  │
│    • [risk 1]                                            │
│    • [risk 2]                                            │
│                                                          │
│  Actions:                                                │
│    • [action 1]                                          │
│    • [action 2]                                          │
│                                                          │
│  Questions:                                              │
│    • [what we don't know yet]                            │
│                                                          │
│  Evidence:                                               │
│    • WeatherSignal.current.temperature                   │
│    • WeatherSignal.current.precipitation                 │
└──────────────────────────────────────────────────────────┘
```

You're telling Copilot "build this" — a picture of the UI you want — not
a data-flow graph or a sequence diagram. Non-technical people sketch
screens; they don't draw architecture diagrams. Save the `.excalidraw`
source and export a PNG. Keep them somewhere you can find them.

**Checkpoint 1:** you've seen the starter and sketched the review UI.

---

## Phase 2 — Add the settings area

In this phase Copilot adds a **settings area** to Region 1: a
**"Model settings"** button that opens a **modal dialog** with three
labeled fields (Groq endpoint, model name, temporary credential), a
**Save** button, a **Cancel** button, and a **Clear model settings**
button. No model call yet — the modal just collects and clears the
values.

Using a modal keeps the credential fields out of the main page flow and
makes the storage boundary visible: the values live in memory only, the
modal closes on save, and a separate "Clear" action wipes them. The
modal must be keyboard-accessible (focus trap, Esc to close, focus
returns to the button that opened it) and announced to screen readers.

The credential is **never saved**. It lives in memory only and clears on
reload. It must never enter `localStorage`, `sessionStorage`, cookies,
IndexedDB, the URL, the prompt, request body, logs, screenshots, or
files.

### Test the storage boundary yourself

After Copilot finishes:

1. Click **Model settings**. The modal opens. Type test text in all
   three fields.
2. Click **Clear model settings**. All three fields should go empty.
3. Type the values again and click **Save**. The modal closes.
4. Reopen the modal. The values should still be there (in memory).
5. Reload the page (Ctrl/Cmd+R). Reopen the modal. All three fields
   must be empty again.
6. Open Developer Tools → Application → Local Storage and Session
   Storage. Both must be empty.
7. Look at the URL. It must not contain the endpoint, model, or
   credential.

If any value survives reload, stop. Tell Copilot to fix the storage
boundary before you continue.

**Ask Copilot** (copy this whole block into Copilot):

```text
I've already built a weather app. Today I want to add a model settings
area to Region 1 of the app. Build it as a modal dialog: a "Model
settings" button opens a modal with three labeled fields (Groq endpoint,
model name, temporary demo credential), a Save button, a Cancel button,
and a "Clear model settings" button. No model call yet.

First, read the rule files in this checkpoint: AGENTS.md, TECH.md, and
GroqAPI.md. GroqAPI.md is the offline reference for the Groq
chat-completions endpoint — read it so the field names and shapes match
what the model call will need in the next phase, even though you are not
making any request yet.

Now build only the settings modal. Requirements:
- The modal opens on button click, closes on Save, Cancel, Esc, and
  backdrop click.
- Keyboard: focus moves to the first field on open, Tab cycles inside the
  modal (focus trap), Esc closes, focus returns to the button that
  opened it.
- The modal is announced to screen readers (role="dialog",
  aria-modal="true", aria-labelledby).
- The credential is never saved — it lives in memory only, clears on
  reload, and never enters localStorage, sessionStorage, cookies,
  IndexedDB, the URL, the prompt, request body, logs, screenshots, or
  files.
- Don't make any model request yet. Keep everything that's already
  working from the weather app.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

If you're stuck, open the `phase 2/` folder the course ships — it already has
the correct code. Keep your blocked work so you can compare.

**Checkpoint 2:** the settings area works. The credential clears on
reload and never enters browser storage.

---

## Phase 3 — Add the review

In this phase Copilot adds the **Generate review** button and the model
call. The app sends the WeatherSignal and the chosen scenario to the
model and asks for a strict JSON reply with exactly five fields.

### Use Copilot's plan mode

On a previous step you wrote a plan yourself (with the `writing-plans`
skill) and handed it to Copilot to build. Today there is **no
pre-written plan** for the review — it was left out on purpose. So today
you use Copilot's **plan mode** and let Copilot make the plan first. You
read it, push back on anything wrong, and only then let it build. Same
habit as the grill — the agent's first draft is a claim, not a fact.

**How to start plan mode in GitHub Copilot:**

1. Open Copilot Chat in your editor.
2. Type `/plan` (or click the mode selector and choose **Plan**) before
   your message. Copilot switches to plan mode — it will produce a plan
   and wait for your approval instead of writing code right away.
3. Paste your prompt and send.
4. Read the plan. If something is missing or wrong, tell Copilot what to
   fix and send again — it stays in plan mode.
5. When you're happy, type `/build` (or click **Build**) and Copilot
   writes the code.

If `/plan` isn't available in your version of Copilot, ask Copilot to
"make a plan first and show it to me before writing any code" — that
works too.

### Step 1 — Ask Copilot for a plan

Start plan mode (see above), then paste this:

> [!NOTE]
> Before you paste, open `GroqAPI.md` in this checkpoint yourself and skim
> it. It's the offline reference for the Groq Free tier chat-completions
> endpoint — the exact URL shape, auth header, request body, response
> shape, and JSON mode. You don't need to memorize it, but knowing what's
> in it lets you tell whether Copilot's plan actually follows it.

```text
I'm about to build the AI review for the weather app. Read the rule
files in this checkpoint (AGENTS.md, TECH.md, and GroqAPI.md), then
read the plan at plans/plan_v2.md for context (it covers the weather app
only, not the review).

GroqAPI.md is the offline reference for the Groq Free tier
chat-completions endpoint — use it for the exact URL shape, auth header,
request body, response shape, and JSON mode. Do not invent a different
endpoint or auth scheme.

Make a short plan for the next step: build the "Generate review" button
and the model call. The app sends the WeatherSignal and the chosen
scenario to Groq (OpenAI-compatible chat completions) and asks for
strict JSON with five fields: summary, risks, actions, questions,
evidence. Validate every field. Keep the weather evidence visible on
every failure.
```

### Step 2 — Read the plan critically

Read what Copilot produced. Ask yourself:

- Does it say what happens when the model call fails? (The weather
  evidence must stay visible.)
- Does it say what happens when the model returns invalid JSON or a
  missing field? (The app must reject it, not show a half-formed review.)
- Does it say what happens when the user changes the settings or the
  scenario while a request is pending? (The old reply must be ignored.)
- Does it keep the credential out of the URL, the prompt, the request
  body, logs, and the review text?
- Does it render the review as plain text (no HTML, no diagrams)?

If anything is missing or wrong, tell Copilot exactly what to fix and ask
for the plan again. Push back before the code is written, not after.

### Step 3 — Build it

When you're happy with the plan, tell Copilot to build it (type `/build`
or click **Build**, or just say "go ahead and build it"):

```text
Go ahead and build the review from your plan. Re-read AGENTS.md,
TECH.md, and GroqAPI.md in this checkpoint before you start writing
code. GroqAPI.md has the exact endpoint URL, auth header, request
body, response shape, and JSON-mode field — follow it. Keep everything
that's already working (the weather app and the settings area). When
you're done, open the page you built in a browser, load fallback, enter
the runtime settings, click Generate review, and tell me what works and
what doesn't.
```

### The five fields

The model must return one JSON object with exactly these five fields.
If any field is missing, empty, or has more than six items, reject the
reply — don't invent a replacement.

| Field | Type | What it is |
|---|---|---|
| `summary` | string (1–3 sentences) | What the weather means for this scenario. |
| `risks` | array of 1–6 strings | Weather-related operational risks. |
| `actions` | array of 1–6 strings | Recommended actions for these conditions. |
| `questions` | array of 1–6 strings | Things we don't know yet. |
| `evidence` | array of 1–6 strings | Each item names a `WeatherSignal` field that backs a claim above. |

Example valid reply:

```json
{
  "summary": "Current temperature of 31°C with no precipitation and moderate wind suggests favorable conditions for warehouse operations, but heat stress is a concern for outdoor loading.",
  "risks": [
    "Heat stress for outdoor workers at 31°C",
    "Low precipitation may indicate dry conditions increasing fire risk"
  ],
  "actions": [
    "Schedule outdoor loading for early morning hours",
    "Ensure hydration stations are stocked"
  ],
  "questions": [
    "What is the forecast for the next 24 hours?",
    "Is there a heat wave warning in effect?"
  ],
  "evidence": [
    "WeatherSignal.current.temperature",
    "WeatherSignal.current.precipitation",
    "WeatherSignal.current.windSpeed"
  ]
}
```

### Check the result

After Copilot finishes, open `course/day-4/phase 3/app/index.html`. Load
fallback, enter the three runtime settings (your Groq endpoint, model name,
and API key), pick a scenario, and click **Generate review**. You should see
all five fields
appear as plain text. The weather evidence should stay visible above the
review. The review should be labeled "Model inference — workshop-only
advisory, not approved architecture."

If you're stuck, open the `phase 3/` folder the course ships. Keep your
blocked work for comparison.

**Checkpoint 3:** the review works. All five fields appear, the weather
stays visible, and the label marks the review as advisory.

---

## Phase 4 — Read the review critically

A model reply is not source evidence. Some sentences in the review trace
directly to weather fields; others are reasonable guesses; others are
unsupported. Your job is to tell which is which.

Read the review one sentence at a time. For each sentence or item, assign
one label:

- **Source evidence** — the sentence restates a WeatherSignal value.
- **Model inference** — a reasonable reading of the weather data.
- **Assumption** — plausible but not stated by the weather data.
- **Open question** — something we genuinely don't know.
- **Unsupported claim** — the model invented a system, policy, owner,
  threshold, or approval the weather data doesn't support.

Ask yourself:

- Does each `evidence` item actually exist in the mapped WeatherSignal?
  (For example, `WeatherSignal.current.temperature` should exist;
  `Regional policy requires shutdown` should not.)
- Which risk is a reasonable inference but not directly supported by the
  weather data?
- Which action is sensible but not grounded in the evidence?
- Which `evidence` reference is too vague to verify?
- Does the review distinguish what the weather says from what the model
  is guessing?

Discuss with a partner or the group. The point isn't to catch Copilot
being wrong — it's to build the habit of reading AI output as a claim that
needs a source, not as a fact.

**Checkpoint 4:** you've read the review critically and labeled each
claim.

---

## Phase 5 — Adversarial review

Phase 4 was your read. Now you get a **second opinion from a different
tool** — the same habit as Day 3's rubber-duck, but aimed at the new
risks Day 4 introduces: the in-browser credential, the model-call
boundary, and the JSON validation. You run two passes against the `phase 3/`
code, categorize the findings, and fix the Blocking ones before you
break things on purpose in Phase 6.

### Pass A — Code review

Run a general second-opinion code review against the review code. This
catches bugs, validation gaps, and stale-response handling the build
phases missed.

Open the Copilot App (or your agent), start a session in your project
folder, and type:

```text
Review the AI review code in app/ against the rule files in this
checkpoint (AGENTS.md, TECH.md, and GroqAPI.md) and the five-field
contract from the guide. GroqAPI.md is the source of truth for the
endpoint URL, auth header, request body, response shape, and JSON mode.
Focus on: JSON validation (reject missing/empty/over-six-item fields,
never invent a replacement), stale-response handling (changing settings
or scenario mid-request must ignore the old reply), credential boundary
(never in URL, body, prompt, logs, or review text), and
weather-evidence visibility (stays visible on every model failure).
Categorize each finding as Blocking, Non-blocking, or Suggestion.
```

Read the critique. Fix **Blocking** items before you continue.
**Non-blocking** items should also be fixed. **Suggestions** are
judgment calls.

### Pass B — Credential-boundary threat model

The biggest new risk today is the credential. Run a focused threat-model
pass against the credential boundary specifically — this is the lens a
security reviewer would apply before this code shipped anywhere.

> [!NOTE]
> A **threat model** is a short list of: the **assets** (what an attacker
> wants — here, the temporary credential), the **trust boundaries** (where
> data crosses from a safe zone to a risky one — here, browser memory →
> network → model endpoint), the **attacker capabilities** (what an
> attacker can do — here, observe network traffic, inject script via the
> review text, race a stale response), and the **abuse paths** (how they
> combine to reach an asset). For each abuse path you name one mitigation
> the code already has, and any gap. You don't need a security background
> — the prompt below asks Copilot to do the enumeration; your job is to
> read it critically and check the four gaps listed.

Open the Copilot App (or your agent), start a session in your project
folder, and type:

```text
Threat-model the credential boundary in the AI review code in app/.
Read GroqAPI.md first — it defines the only valid place for the
credential (the Authorization header) and every place it must never
appear. Enumerate the trust boundaries (browser memory, the model
endpoint, the network), the assets (the temporary credential, the
WeatherSignal, the review text), and the attacker capabilities (network
observer, script injection in the review, a stale-response race). For
each abuse path, name the mitigation the code already has and any gap.
Output a short Markdown threat model. Do not propose new features — only
boundary gaps.
```

Read the threat model. The gaps to care about:

- Can the credential reach the URL, the request body, the prompt, a
  log, or the review text?
- Can a stale model reply overwrite a newer review after the settings
  change?
- Can the review render model-supplied HTML instead of plain text?
- Does the weather evidence stay visible when the model call fails?

Fix any gap that lets the credential leak or the review lie about being
live. Other gaps are Non-blocking — note them and move on.

### After both passes

Re-run Pass A after fixing to confirm the Blocking findings are gone.

**What you should observe:**

- The second-opinion review finds discrepancies the build phases
  missed: a validation gap, a stale-response race, a credential leak
  path, a place where the weather evidence could disappear.
- A clean review means the implementation matches the contract and the
  credential boundary holds — you built what you said you'd build, and
  the secret stays secret.
- The same habit from Day 3's rubber-duck: the code is a claim, the
  review is the check, the fix is the repair — but today the lens is
  security and the credential boundary, not just spec conformance.

**Checkpoint 5:** the adversarial review is clean. Blocking findings are
fixed. The credential boundary holds.

---

## Phase 6 — Break everything

Now you try to break the review on purpose and check it fails honestly.
Pick **one** of the approaches below (or do more than one if you have
time).

### Approach A — Block the model

Open `course/day-4/phase 3/app/index.html`. Open Developer Tools → Network.
Select "Offline". Load fallback, enter settings, click **Generate
review**.

You should see:

- An error message (not a crash).
- The weather evidence still visible above the error.
- **No credential** in the error text, the URL, or the console.

Turn the network back on and retry. The review should load.

### Approach B — Send bad JSON

Ask Copilot to intercept the model response and replace it with invalid
JSON (for example, a plain-text string instead of the five-field reply).
One way: ask Copilot to add a temporary `fetch` override in `app.js` that
returns `{ ok: true, json: async () => '{not valid JSON}' }` for the model
URL, then remove it after the test. Click **Generate review**. The app
must reject the reply and show an error — it must not display a
half-formed review. The weather evidence must stay visible.

### Approach C — Change settings mid-request

Click **Generate review**. While the request is still pending, change
the model name in the settings area. The old reply must be ignored — the
review area should clear or show "settings changed", not the old review.
If the old review appears, that's a bug: tell Copilot to fix the
"stale response" handling.

### Approach D — Check the credential can't leak

Load fallback, enter the runtime settings, generate a review. Then:

- Reload the page. All three settings fields must be empty.
- Open Developer Tools → Application → Local Storage and Session Storage.
  Both must be empty.
- Look at the URL. It must not contain the credential.
- Open Developer Tools → Network, find the model request, and check the
  **Request** tab. The credential must appear only in the
  `Authorization` header — not in the URL, not in the request body, not
  in the prompt.
- Read the generated review. The credential must not appear anywhere in
  the review text.

If the credential shows up anywhere it shouldn't, stop. Tell Copilot to
fix the leak before you continue.

### Approach E — Change something you don't like

The review works, but something is off — the summary is too long, the
risks list has 20 items, the evidence references use the wrong field
names, the review appears above the weather evidence, the label says
"Approved architecture". Pick one thing and ask Copilot to change it:

```text
Open the app you just built. One thing I want to change: [describe what
you see and what you'd rather see instead]. Read the local AGENTS.md and
TECH.md before editing. Make only that change. Don't rewrite anything
else. Open the page in a browser and confirm the one thing I asked for is
now the way I want. Show me what changed.
```

Keep the change small. One thing at a time.

### Check the result

Whichever approach you picked, finish with these final checks:

- Open your final app at a wide size (1280×900) and a phone size
  (390×844). The page never scrolls sideways.
- The browser console (Developer Tools → Console) shows no red errors.
- The weather evidence stays visible after every model failure.
- The review is labeled "Model inference — workshop-only advisory, not
  approved architecture."
- The runtime settings clear on reload and never enter browser storage,
  the URL, or the review text.

### If something is wrong

- **Generate stays disabled:** load valid weather evidence first and
  enter all three runtime settings.
- **The request URL is wrong:** the endpoint should end in
  `/chat/completions`. Don't add the credential as a query parameter.
- **The browser blocks the request:** confirm your Groq endpoint allows
  browser CORS access (Groq Free tier does). Keep the weather evidence
  visible.
- **The response is not JSON:** the model may be returning prose. Check
  the prompt asks for `response_format: json_object`. Don't parse
  arbitrary prose as JSON.
- **A field is missing:** reject the review and tell Copilot to revise
  the prompt. Don't invent a replacement field.
- **An older review appears after changing settings:** tell Copilot to
  fix the stale-response handling — the old reply must be ignored.
- **A setting survives reload:** stop. Tell Copilot to remove whatever is
  persisting it (localStorage, sessionStorage, cookies, IndexedDB). The
  settings must clear on reload.
- **The credential appears in the URL, body, prompt, or review:** stop.
  Tell Copilot to fix the leak before you continue.

**Checkpoint 6:** you broke the review on purpose and it failed honestly.
The weather app and the review both work.

---

## Optional Phase 7 — Build the whole review in one shot

If you have time left and want to see what it's like to give Copilot the
whole review in one prompt instead of plan-mode, try this. It's the same
review — just one prompt instead of plan-then-build.

**Attach a mock** of the full review UI to help Copilot understand the
general shape — the review region, the Generate button, the five fields,
and the "Model inference — workshop-only advisory" label. Copilot should
use it as inspiration, not copy it. Then:

**Ask Copilot** (copy this whole block):

```text
I've already built a weather app. Today I want to add the AI review in one
go — a model settings modal (Groq endpoint, model name, temporary
credential, Save, Cancel, Clear buttons), the Generate review button,
the model call to Groq (OpenAI-compatible chat completions), and the
five-field JSON reply (summary, risks, actions, questions, evidence).

I've attached a mock to help you understand the general shape and feel
of the review UI. Don't copy it literally — use it as inspiration for
the layout, the labels, the Generate button, the five fields, and the
"Model inference — workshop-only advisory" label, but build your own
clean, accessible implementation.

First, read the rule files in this checkpoint: AGENTS.md, TECH.md, and
GroqAPI.md. GroqAPI.md is the offline reference for the Groq
chat-completions endpoint — it has the exact URL shape, auth header,
request body, response shape, JSON mode, and failure handling. Follow
it; do not invent a different endpoint or auth scheme.

Then read the weather app plan at plans/plan_v2.md for context (it
covers the weather app only, not the review).

Build the complete review: the settings modal (keyboard-accessible,
focus trap, Esc to close, focus returns to the opener), the Generate
review button, the model call, strict JSON validation of the five
fields, and the advisory label. The credential is never saved — it
lives in memory only, clears on reload, and never enters localStorage,
sessionStorage, cookies, IndexedDB, the URL, the prompt, request body,
logs, screenshots, or files. Keep the weather evidence visible on every
model failure. Never load fallback automatically after a live weather
failure.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

**What you should observe:**

- Copilot builds the whole review — but it probably makes more mistakes
  than when you used plan mode. That's the teaching: a big prompt is
  harder to get right than plan-then-build.
- Compare this build to your plan-mode build. Which one has fewer bugs?
  Which one validates the JSON more strictly? Which one keeps the
  credential boundary cleaner? Which one was faster?
- The plan-mode approach (Phase 3) is the same habit as the grill and
  the adversarial review: break big things into small things, check each
  one, fix before moving on.

**Checkpoint 7 (optional):** you built the whole review in one shot and
compared it to the plan-mode build.

---

## Common mistakes

- **Persisting the credential.** The number-one risk today. If any of the
  three settings survives reload, the storage boundary is broken. Check
  Local Storage, Session Storage, the URL, and the review text — the
  credential must appear only in the `Authorization` header.
- **Rendering model output as HTML.** The review is plain text. If Copilot
  uses `innerHTML` to render a field, a `<script>` tag in the model's reply
  runs as code. Use text nodes only.
- **Erasing the weather on a model failure.** The weather evidence must stay
  visible when the model call fails. If the review error replaces the
  weather region, the evidence chain is broken.
- **Accepting the first plan without reading it.** Plan mode exists so you
  can push back before code is written. If the plan doesn't say what happens
  on invalid JSON, a missing field, or a mid-request settings change, send
  it back.
- **Inventing a replacement for a missing field.** If the model returns four
  fields instead of five, reject the whole review. Don't fill in "unknown"
  for the missing one — that's a lie presented as a model reply.
- **Adding the credential as a query parameter.** The endpoint must end in
  `/chat/completions` and the credential goes only in the `Authorization`
  header. Never in the URL.

---

## Accessibility check

Today's new UI is the settings modal and the review region. Verify both
before you hand off.

1. **Modal focus trap.** Click **Model settings**, then press Tab
   repeatedly. Focus must cycle inside the modal — it must not escape to
   the page behind. Press Esc. The modal closes and focus returns to the
   **Model settings** button. If focus escapes or doesn't return, tell
   Copilot to fix the focus trap.
2. **Modal announcement.** With a screen reader on, open the modal. It must
   announce "Model settings" (or the dialog's label) and move focus to the
   first field. Confirm `role="dialog"`, `aria-modal="true"`, and
   `aria-labelledby` are present in the DOM.
3. **Review region live updates.** Generate a review with a screen reader
   on. The review region must announce "Generating review" and then the
   completed review (or the error). If it stays silent, the live region
   isn't wired to the review state.
4. **Keyboard-only review.** Using only the keyboard: load fallback, open
   settings, fill the three fields, save, pick a scenario, generate the
   review. Every control must be reachable and show a visible focus outline.
5. Run Lighthouse → Accessibility on the final page. Fix anything below 100
   that the spec requires.

---

## Reference states

The Day 3 states still apply. These are the new states today adds.

**Settings modal (open):**
- A dialog covers the page with a backdrop.
- Three labeled fields: endpoint, model name, temporary credential.
- Three buttons: Save, Cancel, **Clear model settings**.
- Focus is inside the dialog (Tab cycles within it). Esc closes it and
  focus returns to the **Model settings** button.

**Settings saved (modal closed):**
- The **Generate review** button is enabled (if weather + scenario are set).
- No settings value appears in the URL, Local Storage, or Session Storage.

**Review loading:**
- The review region shows "Generating review" (or similar).
- The weather evidence stays visible above it.
- The live region announces the loading state.

**Review success:**
- Five fields appear as plain text: summary, risks, actions, questions,
  evidence.
- A label reads "Model inference — workshop-only advisory, not approved
  architecture."
- The weather evidence is still visible above the review.
- No model-supplied HTML renders as code (no `<img>`, no `<script>`).

**Review error:**
- An error message in the review region (not a crash).
- The weather evidence stays visible.
- No credential appears in the error text, the URL, or the console.
- A retry path is available (re-click Generate after fixing the cause).

**Settings changed mid-request:**
- The old review is ignored. The review region clears or shows "settings
  changed".
- The weather evidence stays visible.

---

## Hand off to Day 5

Either keep your final result (your `phase 3/` or `phase 5/` folder with the
review working and the weather still visible) or open the
`course/day-5/starter/` folder, which already has the correct app with
the AI review.
Day 5 is the architect skills lab — find, inspect, install, run, and judge
reusable skills on real architect tasks. The weather app and the review
must keep working unchanged.

---

## References

The full list lives at [course/references.md](../references.md). The most
relevant for today:

- [Groq Console](https://console.groq.com) — get your free API key
- [Groq API docs](https://console.groq.com/docs) — the chat-completions
  endpoint, JSON mode, and rate limits
- [Groq available models](https://console.groq.com/docs/models) — the
  current model list (if one returns 404, pick another)
- [OpenAI chat completions reference](https://platform.openai.com/docs/api-reference/chat) —
  the request shape Groq implements
- [OWASP threat modeling overview](https://owasp.org/www-community/Threat_Modeling) —
  for the Phase 5 credential-boundary threat model
- [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/) — for the
  modal focus-trap accessibility check