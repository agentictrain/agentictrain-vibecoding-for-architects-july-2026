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

Open `day-4/starter/app/index.html` in your browser. Search a
city, pick it, click **Fetch weather**, and confirm the current, hourly,
and daily cards all show real data. Then click **Load fictional fallback**
and confirm the fake data appears. If anything looks broken, check the
files are intact:

```bash
node --check "day-4/starter/app/app.js"
node --test "day-4/starter/tests/weather-signal.test.mjs"
```

> [!IMPORTANT]
> **This starter is the one-pass build from Day 3**, not the step-by-step
> one. If you carry your own Day 3 app forward instead, it may differ —
> most visibly, yours may load the fictional fallback automatically after
> a live failure rather than waiting for a button. Neither is wrong; they
> came from the same contract read two different ways. Just know which one
> you have, because a few checks below name the button.
>
> If you'd rather not deal with the difference, use `day-4/starter/`.

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

**Set up your working folder before Phase 2.** Build in one folder all day
and leave the shipped checkpoints untouched as references:

```bash
cp -R "day-4/starter" "day-4/my-app"
```

Open `day-4/my-app/` in your editor and start Copilot there, so "read
AGENTS.md, TECH.md and GroqAPI.md in this checkpoint" resolves to your
copy. Don't build inside a shipped `phase N/` folder — each already
contains the finished answer for its step.

The checkpoint path for Day 4:

| Folder | What's in it | Finishes |
|---|---|---|
| `day-4/starter/` | the weather app; no model controls yet | — |
| `day-4/phase 1/` | the same app, plus reference mocks of the review UI | Phase 1 |
| `day-4/phase 2/` | settings modal added; no model call yet | Phase 2 |
| `day-4/phase 3/` | model call + validated review | Phase 3 |
| `day-4/phase 5/` | adversarial review clean; the full app with the AI review | Phase 5 |
| `day-4/phase 7/` | the whole review built in one pass (optional) | Phase 7 |

Every checkpoint from `phase 3/` onward ships tests. Run them against your
own build as you go — the guide won't remind you again:

```bash
node --test "day-4/my-app/tests/weather-signal.test.mjs"
node --test "day-4/my-app/tests/review.test.mjs"
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
- **90–105 min — Phase 5: Adversarial review.** Run a second-opinion code
  review, a credential-boundary threat model, and the four failure tests
  against your own build.
- **105–117 min — Phase 6: Fix the review UI.** Collect every issue in a
  read-only session, turn them into three independent milestones, close
  them one at a time.
- **117–120 min — Hand off.** Use your final result or open
  `day-5/starter/`.
- **If you have time left — Optional Phase 7: Build the whole review in
  one pass.** Give Copilot the whole review in one prompt instead of
  plan-mode, and compare.

---

## Phase 1 — Look before you build

The most important idea today: **a model reply is not source evidence.**
The weather data is the evidence (from Open-Meteo, mapped into
WeatherSignal). The model's review is an inference on top of it. Keep
them visibly separate so a reviewer can tell which is which.

### Open the starter

Open `day-4/starter/app/index.html`. Search a city, pick it,
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

Make the review pleasant to read, not just correct. Ask the model for a
leading emoji on each risk, action and question, and for short scannable
phrasing rather than paragraphs. Put that wording requirement in the
system prompt you send to the model — not in the rendering code, and not
by relaxing the validation.

Structure it as milestones I can accept one at a time. Each milestone
must be independently demonstrable, with its own acceptance criteria and
its own check, and must not need the later milestones to exist. Say what
I should see in the browser to accept each one.

If anything I've asked for conflicts with AGENTS.md, TECH.md, GroqAPI.md,
or plans/plan_v2.md, stop and tell me which two things disagree rather
than picking one.
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
code. Keep the emoji and scannable-phrasing requirement in the system
prompt, and keep rendering every field as plain text. GroqAPI.md has the exact endpoint URL, auth header, request
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

> [!IMPORTANT]
> **Emojis yes, Markdown and HTML no.** An emoji is just text, so it
> passes validation and renders safely. A Markdown heading, a code fence
> or an HTML tag does not: the validator rejects them, and it rejects them
> on purpose. The review is rendered with text nodes, so model output can
> never execute — the moment you render it as HTML, a `<script>` tag in a
> model reply becomes a script-injection hole. If your review looks plain
> and you're tempted to "fix" it by allowing HTML through, you've traded a
> prettier page for a real vulnerability. Style the *container* with CSS;
> ask the *model* for emojis and shorter sentences.

Example valid reply:

```json
{
  "summary": "☀️ 31°C, dry, moderate wind — good conditions for warehouse operations, but heat stress is a real concern for outdoor loading.",
  "risks": [
    "🥵 Heat stress for outdoor workers at 31°C",
    "🔥 Low precipitation may mean dry conditions and raised fire risk"
  ],
  "actions": [
    "🌅 Schedule outdoor loading for early morning",
    "💧 Keep hydration stations stocked"
  ],
  "questions": [
    "❓ What is the forecast for the next 24 hours?",
    "❓ Is a heat-wave warning in effect?"
  ],
  "evidence": [
    "WeatherSignal.current.temperature",
    "WeatherSignal.current.precipitation",
    "WeatherSignal.current.windSpeed"
  ]
}
```

### Check the result

After Copilot finishes, open the page it built. Load
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
boundary, and the JSON validation. You run three passes against your own
build — a code review, a threat model, and four hands-on failure tests —
then fix the Blocking findings before you polish anything in Phase 6.

> [!IMPORTANT]
> **Run passes A and B in a brand-new session, on a different model.** Not
> the chat you built in. A reviewer that watched you build inherits your
> framing and tends to confirm the reasoning rather than check the result
> — and the model that wrote the credential handling shares every blind
> spot with itself. New session empties the context; the model picker
> changes the blind spots. It costs one click each.

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

For each finding, quote the requirement you're applying and give the
file and line range in the code, then categorize it Blocking,
Non-blocking, or Suggestion. If two rule files disagree, report that as
its own finding rather than picking one. If you can't find evidence for
something, say UNKNOWN — don't invent a file, a line, or a requirement.
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

Cite the file and line range for every mitigation you claim exists. If
you cannot find one in the code, say UNKNOWN rather than assuming it is
handled somewhere.
```

Read the threat model, then verify one claimed mitigation yourself — open
the file and line it cites and check the code really does what the model
says. A threat model is a claim too.

The gaps to care about:

- Can the credential reach the URL, the request body, the prompt, a
  log, or the review text?
- Can a stale model reply overwrite a newer review after the settings
  change?
- Can the review render model-supplied HTML instead of plain text?
- Does the weather evidence stay visible when the model call fails?

Fix any gap that lets the credential leak or the review lie about being
live. Other gaps are Non-blocking — note them and move on.

### Pass C — Break it on purpose

Passes A and B were analysis. This one is empirical: make the review fail
four different ways and check it fails honestly each time. **Do all four**
— they're a few minutes each and they test different things: the model
unreachable, the model lying about its output shape, a race between two
requests, and the credential escaping.

#### Block the model

Open the app you built. Open Developer Tools → Network.
Select "Offline". Load fallback, enter settings, click **Generate
review**.

You should see:

- An error message (not a crash).
- The weather evidence still visible above the error.
- **No credential** in the error text, the URL, or the console.

Turn the network back on and retry. The review should load.

#### Send bad JSON

Ask Copilot to intercept the model response and replace it with invalid
JSON (for example, a plain-text string instead of the five-field reply).
One way: ask Copilot to add a temporary `fetch` override in `app.js` that
returns `{ ok: true, json: async () => '{not valid JSON}' }` for the model
URL, then remove it after the test. Click **Generate review**. The app
must reject the reply and show an error — it must not display a
half-formed review. The weather evidence must stay visible.

#### Change settings mid-request

Click **Generate review**. While the request is still pending, change
the model name in the settings area. The old reply must be ignored — the
review area should clear or show "settings changed", not the old review.
If the old review appears, that's a bug: tell Copilot to fix the
"stale response" handling.

#### Check the credential can't leak

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

### After all three passes

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

**Checkpoint 5:** the adversarial review is clean, Blocking findings are
fixed, and you ran all four failure tests — model unreachable, invalid
JSON, mid-request settings change, credential leak. The app failed
honestly in each, the weather evidence stayed visible, and the credential
never left the `Authorization` header.

---

## Phase 6 — Fix the review UI, milestone by milestone

The review works and it fails honestly. Now make it *look* right.

Like Day 3, this phase has **no shipped answer**. Your agent chose the
heading wording, the order of the five fields, how the evidence list
renders, how much of the summary shows before it wraps. It may have added
controls nobody asked for. Everyone's review region looks different, so
there is nothing to match against.

You already know the method — it's the one from **Day 3, Phase 5**. Same
six steps, new subject: this time the issue list is about the review
region, not the weather cards.

### Step 1 — Read-only session, collect the issues

```text
We're going to fix the UI of the review region in app/. Before any code
changes, I want to collect the issues.

For this conversation you are in read-only mode:
- Do not edit, create, or delete anything under app/.
- Do not run commands that change files.
- The only file you may write is implementation/ui-issues.md.

Open the app, generate a review so you can see the real output, then
wait. I'll describe problems one at a time, some as screenshots. After
each one, add it to implementation/ui-issues.md as a numbered entry with:
what I said, which part of the UI it affects, and how you'd know it was
fixed.

Don't propose solutions yet and don't start planning. Just capture.
```

Walk the review region and talk. Look at the five fields, the advisory
label, the loading state, the error state, and what the region looks like
before you've generated anything.

### Step 2 — Screenshot the states

Attach images rather than describing layouts. It's faster, it's cheaper
than several rounds of guessing, and it removes the misunderstanding
instead of negotiating it away.

Capture the states you can't see at rest: review loading, review error,
settings-changed-mid-request, a review with six risks and six actions, and
narrow width. The error and loading states are the ones people forget, and
they're the ones a stakeholder sees when something goes wrong.

### Step 3 — Ask the agent what it doesn't understand

```text
That's all the issues. Re-read implementation/ui-issues.md end to end.

Now ask me your questions — anything ambiguous, anything where two of my
issues conflict, anything where you'd have to guess a value, a label, or a
layout. Number them and stop. Don't answer them yourself.
```

### Step 4 — Ask for three independent milestones

```text
Here are my answers: [paste them]

Update implementation/ui-issues.md with them, then write
implementation/ui-plan.md: a plan that fixes every issue in the list,
organised into exactly three milestones.

Each milestone must be independent — demonstrable on its own, with its own
acceptance criteria and its own check, and it must not require the later
milestones to exist. Say which issue numbers each milestone closes.

Two things must not change: the five-field contract, and the fact that the
weather evidence stays visible on every model failure. If any issue I gave
you would break either, say so instead of implementing it.

Still no code changes.
```

### Step 5 — Run one milestone, then stop

```text
Implement milestone 1 from implementation/ui-plan.md, and only milestone 1.
Don't start milestone 2. Don't change anything that isn't in the issue
list, and don't touch the model call or the validation. When you're done,
tell me which issue numbers you closed and how to check each one.
```

Check each closure yourself, then reject what's wrong — specifically:

```text
Milestone 1 isn't done. Specifically:
- issue 3: [what I see] — I expected [what should happen]
- issue 7: you changed [X], which I didn't ask for — revert that

Fix only these. Don't move on to milestone 2 and don't rewrite anything
that's already right.
```

Repeat until milestone 1 is genuinely closed, then start milestone 2.

### Step 6 — Done when the list is empty

Every issue closed, all three milestones accepted. Then:

- Open your final app at a wide size (1280×900) and a phone size
  (390×844). The page never scrolls sideways.
- The browser console (Developer Tools → Console) shows no red errors.
- The weather evidence stays visible after every model failure.
- The review is labeled "Model inference — workshop-only advisory, not
  approved architecture."
- The runtime settings clear on reload and never enter browser storage,
  the URL, or the review text.

Re-run the Phase 5 failure tests once more at the end. UI work touches
rendering, and rendering is where the weather evidence gets hidden and
where model text stops being escaped.

**Checkpoint 6:** you collected the review-region issues before fixing any
of them, closed three independent milestones, and confirmed the five-field
contract and the weather evidence survived the polish.

---

## Optional Phase 7 — Build the whole review in one pass

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

- Both builds probably work. Today's scope is small and it was already
  split along a natural seam — the settings modal in Phase 2, the review
  region and the model call in Phase 3. Each half is demonstrable on its
  own, so nothing was cut off mid-thought.
- The difference isn't completeness. It's **when you got to object.** Plan
  mode put a document in front of you while changing it was free. The
  one-pass build handed you finished code and asked you to find the
  problems afterwards.
- Compare them on the things you would have caught in a plan: does it
  reject invalid JSON instead of rendering a half-review? Does it ignore
  a stale reply? Does the weather evidence survive a model failure? Does
  the credential stay in the `Authorization` header? Then ask which build
  needed correcting *after* the code existed.

> [!NOTE]
> **This is not the same comparison as Day 3's Phase 7.** There, a single
> long plan was chopped into three by the guide, and the split cost you
> the tasks that came last — the tests and the final verification. Here
> the split came from the work itself: settings, then review. Splitting
> along a seam the work already has is free. Splitting a plan that doesn't
> have one is what costs you.
>
> That's the distinction worth taking away. Increments are cheap when the
> plan is shaped for them and expensive when it isn't — and you decide
> which you have at planning time, not at build time.

**Checkpoint 7 (optional):** you built the whole review in one pass,
compared it against your plan-mode build, and can say what reviewing the
plan first actually bought you.

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
`day-5/starter/` folder, which already has the correct app with
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