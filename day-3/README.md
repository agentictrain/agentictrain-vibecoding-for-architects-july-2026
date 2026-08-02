# Day 3 — Build the weather app

Today you build a small weather app. The app lets a person type a city name,
pick a city from the list, and see the current weather, the next 24 hours,
and the next 7 days — all from a free public weather service called
Open-Meteo. You will not write the code yourself. You will tell GitHub
Copilot what to build, check the result in the browser, and fix what's
wrong.

The whole thing takes two hours. You work in small steps called
**checkpoints**. If a step breaks, you open the shipped checkpoint folder
for that step, which already has the correct code, and keep going.

> [!NOTE]
> A shared [course glossary](../glossary.md) defines every technical term
> used across all four days. Open it in a tab and refer back when a term is
> unfamiliar.

## Prerequisites and preflight

Before the clock starts, make sure you have:

- A current web browser (Chrome, Edge, or Firefox).
- The repository open on your computer.
- GitHub Copilot working in your editor.

Open `day-3/starter/app/index.html` in your browser. You should see
three empty boxes with headings and disabled buttons — the shell you'll
build on today. It's the same shell Day 2 finished with, shipped here so
you can start clean. If the page doesn't open or looks broken, check that
you opened the file directly in a current browser.

> [!WARNING]
> If your network blocks Open-Meteo, you can still finish the exercise
> using the built-in "fictional fallback" weather data. But a successful
> fallback does not prove the live weather path works. Don't call fallback
> data a live result.

## What we are building

On a previous step you wrote a spec, an ADR, an implementation plan, and
a glossary. Those documents are the **contract** for today — you
implement them, you don't re-derive them. They live at:

```text
plans/spec_v2.md        the feature spec
plans/plan_v2.md        the ordered implementation plan
plans/adr_v2_final.md   the architecture decision
plans/glossary_v2.md    the pinned terms
```

If you skipped Day 2 or your plans are incomplete, open the known-good set
shipped with the course at `day-3/starter/plans/` and use those
instead. You don't need a facilitator.

> [!IMPORTANT]
> **Your plans are yours, and they will not match anyone else's.** You
> generated them with an AI on Day 2, so exact numbers, field names,
> section order, and wording differ from person to person and from the
> shipped example. Where this guide names a specific value, it is quoting
> the **shipped example** so you have something concrete to compare
> against — your plan is the authority for your build.
>
> If your plan and this guide disagree, that's not a mistake to paper
> over. Decide which is right, say so out loud, and — if it's your plan
> that's wrong — fix the plan before you fix the code. A contract you
> silently ignore is not a contract.

Here's the plain-language summary of what those plans describe. The full
app has three boxes on one page. Today you build the first two. The third
box is a placeholder today.

1. **Context and controls** — a box where the user types a city name, picks
   a city from the results, and clicks **Fetch weather**. There is also a
   scenario dropdown (warehouse planning or delivery planning) you won't
   use yet.

2. **Weather evidence** — a box that shows three layers of weather from
   Open-Meteo:
   - **Right now**: temperature, "feels like" temperature, humidity, rain,
     weather code (a number that means "sunny," "cloudy," "rain," etc.),
     wind speed, wind direction, wind gusts, cloud cover, pressure, and
     whether it's day or night.
   - **Next 24 hours**: temperature, chance of rain, rain, weather code,
     and wind speed — one entry per hour.
   - **Next 7 days**: high and low temperature, total rain, chance of rain,
     weather code, max wind speed, sunrise, and sunset — one entry per day.
   - A collapsible view of the raw Open-Meteo reply (the exact JSON the
     service sent back).
   - A clean copy of that data called **WeatherSignal** — your app's own
     shape, with three sections (`current`, `hourly`, `daily`), each with
     its own units.
   - The box always shows one of these states: loading, success, fallback,
     empty, or error-with-retry.
   - Fallback data is fake, always the same, and clearly labeled. It never
     pretends to be live data.

3. **Third box** — a placeholder box today. You'll build it later.

The steps the user follows today:

1. User types a city name.
2. User picks a city from the results.
3. App asks Open-Meteo for current + hourly + daily weather in one request.
4. App copies the Open-Meteo reply into the WeatherSignal shape (current,
   hourly, daily sections).
5. App shows three views of the same data: a readable weather card, the
   raw reply, and the clean WeatherSignal object.

**Rules:** plain HTML, CSS, and JavaScript. No frameworks (no React, no
Vue). No backend, no database, no login, no analytics, no deployment. The
only outside service is Open-Meteo. Every button and input has a label
you can see or a screen reader can speak. You can reach everything with
the keyboard. The page works from 320 pixels wide upward without
sideways scrolling.

**Out of scope today:** no production, no saving data, no real internal
systems, no real customer or supplier data.

## How checkpoints work

Today has seven **phases** (progress markers in this guide) and a set of
shipped **checkpoint folders** holding a known-good snapshot of the app at
each stage.

**Set up your working folder before Phase 2.** You build in one folder all
day and the shipped checkpoints stay untouched as references. Copy the
starter once:

```bash
cp -R "day-3/starter" "day-3/my-app"
```

Then open `day-3/my-app/` in your editor and start Copilot **there**, so
that "read AGENTS.md and TECH.md in this checkpoint" resolves to your copy.
Everything you build today goes in `my-app/`.

> [!WARNING]
> Don't point Copilot at a shipped `phase N/` folder and ask it to build.
> Those folders already contain the finished answer for their step, so
> Copilot would be "building" code that's already there. Open them to read
> and compare, never to work in.

If you get stuck, open the shipped folder for the phase you're on — named
below — and point Copilot at it. That folder already has the correct code
for that step. Keep your blocked work so you can compare. Never edit an
earlier checkpoint folder to make later work pass.

> [!IMPORTANT]
> **Folder numbers are not phase numbers.** A checkpoint folder holds the
> state at the *end* of a build step, and Phase 1 builds nothing — it's
> reading, not writing. So the folders run one behind the guide's phases
> until they catch up at Phase 4. The table below is the mapping that
> matters; use it rather than assuming `phase 3/` belongs to Phase 3.

> [!NOTE]
> Each checkpoint folder has an `implementation/` subfolder. When Copilot
> makes a decision without asking you, it records it in
> `implementation/decisions.md`. When something looks odd, read that file
> first — it explains why the code is the way it is. The shipped `final/`
> folder's `implementation/` is a complete worked example you can compare
> against your own.

The checkpoint path for Day 3:

| Folder | What's in it | Finishes |
|---|---|---|
| `day-3/starter/` | the starting shell; no weather yet | — |
| `day-3/phase 1/` | city search works; pick a city | **Phase 2** |
| `day-3/phase 2/` | live weather, WeatherSignal, both viewers | Phase 3 (first pass) |
| `day-3/phase 3/` | the same, plus strict unit validation | **Phase 3** |
| `day-3/phase 4/` | fictional fallback, error and retry states | **Phase 4** |
| `day-3/phase 6/` | review the code against the spec | Phase 6 |
| `day-3/phase 7 - optional/` | the whole plan built in one pass — the only checkpoint with tests | Phase 7 |
| `day-3/final/` | your final weather app | — |

`phase 2/` and `phase 3/` differ only in `weather-signal.js`: `phase 3/`
adds a table of allowed units and rejects anything unexpected. If you're
comparing against your own work at the end of Phase 3, use `phase 3/`.

## Outcome and two-hour route

- **0–15 min — Phase 1: Look before you build.** Open the starter, run two
  commands in the terminal, read the raw weather reply.
- **15–40 min — Phase 2: Build city search.** Tell Copilot to build the
  search box. Test it. *(Shipped reference: `phase 1/`.)*
- **40–55 min — Phase 3: Add the weather.** Tell Copilot to fetch and map
  weather. Check the WeatherSignal shape in the browser.
  *(Shipped reference: `phase 3/`.)*
- **55–80 min — Phase 4: Add the fallback.** Tell Copilot to add fake
  fallback and error states. Test them. *(Shipped reference: `phase 4/`.)*
- **80–100 min — Phase 5: Fix the UI.** Collect every UI issue in a
  read-only session, turn them into three independent milestones, and
  close them one at a time.
- **100–115 min — Phase 6: Review against spec.** Run rubber-duck and/or
  spar to find discrepancies between the code and the spec.
- **115–120 min — Hand off.** Use your final result or open
  `day-4/starter/`.

---

## Phase 1 — Look before you build

The most important idea today: **a reply from a public service is not your
app's contract.** Open-Meteo sends back a lot of fields. You only copy the
ones your app needs, and you copy them into your own shape (WeatherSignal).
If a field is missing, show an error. Never invent a value. Never silently
swap in fake data.

The flow you follow all day:

```text
type a city -> ask Open-Meteo -> read the reply -> check it -> copy to WeatherSignal -> show it
```

### Open the starter

Open `day-3/starter/app/index.html` in your browser. You should see
three empty boxes with headings, all buttons disabled, and no network
activity. This is the shell you'll build on. If it doesn't open or looks
broken, check the file is intact before you continue:

```bash
node --check "day-3/starter/app/app.js"
```

That reports a syntax error if the file is damaged. If it's clean and the
page still looks wrong, you opened it through something other than a
browser — open the file directly.

### Look at the raw weather reply

Open-Meteo gives you two free web addresses (endpoints):

- City search: `https://geocoding-api.open-meteo.com/v1/search`
- Weather: `https://api.open-meteo.com/v1/forecast`

Before you tell Copilot to write code, look at what these endpoints send
back. You have two ways to do this:

**Option A — run it in the terminal.** `curl` is a small program that asks
a web address and prints the reply. Run this:

```bash
curl --get 'https://geocoding-api.open-meteo.com/v1/search' \
  --data-urlencode 'name=Arlington' \
  --data 'count=5' \
  --data 'language=en' \
  --data 'format=json'
```

**Option B — ask Copilot.** Paste this into Copilot instead:

```text
Use curl (or a tool you have) to call this URL and show me the full reply:
https://geocoding-api.open-meteo.com/v1/search?name=Arlington&count=5&language=en&format=json
Paste the JSON reply back to me so I can read it.
```

Either way, you should see a JSON list of cities named "Arlington" with
their latitude and longitude. Pick Arlington, Virginia (latitude 38.88101,
longitude -77.10428).

Now ask for the weather at those coordinates. In the terminal:

```bash
curl --get 'https://api.open-meteo.com/v1/forecast' \
  --data 'latitude=38.88101' \
  --data 'longitude=-77.10428' \
  --data 'current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,surface_pressure,is_day' \
  --data 'hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m' \
  --data 'daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,sunrise,sunset' \
  --data 'forecast_days=7' \
  --data 'timezone=auto'
```

Or ask Copilot:

```text
Use curl (or a tool you have) to call this URL and show me the full reply:
https://api.open-meteo.com/v1/forecast?latitude=38.88101&longitude=-77.10428&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,surface_pressure,is_day&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,sunrise,sunset&forecast_days=7&timezone=auto
Paste the JSON reply back to me so I can read it.
```

You'll see a big JSON reply with three blocks: `current`, `hourly`, and
`daily`. Each block has a matching `*_units` block that tells you what the
numbers mean (for example, `temperature_2m: "°C"`). You need both the
values and the units. Also note the `timezone` field at the top — it
applies to the whole reply.

This is the raw evidence. Your app will copy only these fields into its
own clean shape.

**Checkpoint 1:** you've seen the raw Open-Meteo reply and you know which
fields you'll copy.

---

## Phase 2 — Build city search

The city search must do this:

- Wait a short moment after the person stops typing, then search (this
  is "debounce" — it stops the app from searching on every keystroke).
  Your plan names the exact delay; the shipped example uses 300 ms.
- Trim spaces off the typed text and require at least two characters.
- If the person types again before the reply comes back, ignore the old
  reply (it's for a different city now).
- Show results as buttons you can click or reach with the keyboard (Tab
  and Enter).
- Announce these states out loud to a screen reader: loading, "N results
  found", "no results", "selected: city name", and errors.
- If the search fails and the person types a new query, try again.

Before you paste the prompt, **attach a mock** to help Copilot
understand the general shape — a sketch, a screenshot, or an Excalidraw
export showing the search box, the results list, and the "Fetch weather"
button. Copilot should use it as inspiration, not copy it.

**Ask Copilot** (copy this whole block into Copilot):

```text
On a previous step I wrote a plan for a small weather app. Today I want
you to build the first part of it.

I've attached a mock to help you understand the general shape and feel
of the UI for this step. Don't copy it literally — use it as
inspiration for the layout, the labels, and the visual structure, but
build your own clean, accessible implementation.

First, read the rule files in this checkpoint: AGENTS.md and TECH.md.
These tell you what you may write and what safety rules apply.

Then read the plan I wrote. It's in these files:
- plans/spec_v2.md        (what the app should do)
- plans/plan_v2.md        (the step-by-step build plan)
- plans/adr_v2_final.md   (the big decisions and why)
- plans/glossary_v2.md    (words we agreed on)

Now build only the city search — the search box, the results list, and
selecting a city. Follow my plan for the details (debounce delay, minimum
query length, how results are announced); don't substitute your own
defaults where the plan states a value. Don't build anything past the
city search, even if the plan lists more — we'll do those later. Don't
fetch weather yet and don't build the WeatherSignal.

If anything in my plan is missing or contradicts itself, stop and tell me
which part rather than guessing.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, open the page it built in the browser. Type
"Arlington" and pick Arlington, Virginia. Then type a nonsense word like
"zzzz" and confirm you see "no results". Open the browser's Network panel
(Developer Tools → Network) and confirm only the geocoding address was
contacted — not the weather address.

**What you should see:**

- The search box waits for you to stop typing, then searches.
- Results appear as buttons. You can Tab to them and press Enter.
- A nonsense query shows "no results".
- The weather endpoint was **not** contacted.

If you're stuck, open `day-3/phase 1/` directly — that's the shipped
folder holding the finished city search, and its **Fetch weather** button
is still disabled, so it passes the Network check above. Keep your blocked
work so you can compare.

**Checkpoint 2:** city search works. A selected city is ready for the
weather step.

---

## Phase 3 — Add the weather

In this phase Copilot adds three capabilities:

- **build the forecast URL** for a selected city;
- **send the request** and return the raw reply;
- **map the raw reply** into the clean WeatherSignal shape.

> [!NOTE]
> **The contract is the WeatherSignal shape, not the function names.**
> Copilot will pick its own names and its own file split, and that's fine.
> For reference, the shipped version puts `buildForecastUrl()` and the
> fetch in `app/app.js`, and exports `mapWeatherSignal()` and
> `createFallbackSignal()` from `app/weather-signal.js`. Yours may differ.
> What must match is the shape below and the rules under it. Open the
> `final/` folder to see how the shipped version organizes them.

The WeatherSignal shape has three sections — `current`, `hourly`, and
`daily` — plus a few shared fields at the top. Here is the exact shape. The
zeros are placeholders — they show the type of each field, not real
weather:

```json
{
  "location": "Arlington, Virginia, United States",
  "latitude": 38.88101,
  "longitude": -77.10428,
  "timezone": "source timezone",
  "sourceUrl": "public forecast URL",
  "isFallback": false,
  "current": {
    "time": "source time",
    "temperature": 0,
    "apparentTemperature": 0,
    "humidity": 0,
    "precipitation": 0,
    "weatherCode": 0,
    "windSpeed": 0,
    "windDirection": 0,
    "windGusts": 0,
    "cloudCover": 0,
    "pressure": 0,
    "isDay": 0,
    "units": {
      "temperature": "source unit",
      "apparentTemperature": "source unit",
      "humidity": "source unit",
      "precipitation": "source unit",
      "weatherCode": "source unit",
      "windSpeed": "source unit",
      "windDirection": "source unit",
      "windGusts": "source unit",
      "cloudCover": "source unit",
      "pressure": "source unit",
      "isDay": "source unit"
    }
  },
  "hourly": {
    "time": ["24 source timestamps"],
    "temperature": [0],
    "precipitationProbability": [0],
    "precipitation": [0],
    "weatherCode": [0],
    "windSpeed": [0],
    "units": {
      "temperature": "source unit",
      "precipitationProbability": "source unit",
      "precipitation": "source unit",
      "weatherCode": "source unit",
      "windSpeed": "source unit"
    }
  },
  "daily": {
    "date": ["7 source dates"],
    "temperatureMax": [0],
    "temperatureMin": [0],
    "precipitationSum": [0],
    "precipitationProbabilityMax": [0],
    "weatherCode": [0],
    "windSpeedMax": [0],
    "sunrise": ["source time"],
    "sunset": ["source time"],
    "units": {
      "temperatureMax": "source unit",
      "temperatureMin": "source unit",
      "precipitationSum": "source unit",
      "precipitationProbabilityMax": "source unit",
      "weatherCode": "source unit",
      "windSpeedMax": "source unit",
      "sunrise": "source unit",
      "sunset": "source unit"
    }
  }
}
```

Rules for the copy:

- The hourly section keeps the next 24 entries, starting from the current
  hour in the city's timezone.
- The daily section keeps 7 entries.
- Keep the real numbers from Open-Meteo, including a real zero. If a field
  is missing or not a number, show an error — don't make one up.
- If an array is shorter than expected, that's an error — don't pad it.
- You send `timezone=auto`, but Open-Meteo answers with the real zone name
  (`America/New_York`). Store what it sent back, not the string `auto`.

Before you paste the prompt, **attach a mock** to help Copilot
understand the general shape — a sketch showing the current conditions
card, the 24-hour hourly list, the 7-day daily list, the raw response
viewer, and the mapped WeatherSignal viewer. Copilot should use it as
inspiration, not copy it.

**Ask Copilot** (copy this whole block):

```text
On a previous step I wrote a plan for a small weather app. I've already
built the city search. Now I want you to build the next step from my
plan — the weather fetch and the WeatherSignal mapping.

I've attached a mock to help you understand the general shape and feel
of the UI for this step. Don't copy it literally — use it as
inspiration for the layout, the labels, and the visual structure, but
build your own clean, accessible implementation.

First, read the rule files in this checkpoint: AGENTS.md and TECH.md.
These tell you what you may write and what safety rules apply.

Then read the plan I wrote. It's in these files:
- plans/spec_v2.md        (what the app should do)
- plans/plan_v2.md        (the step-by-step build plan)
- plans/adr_v2_final.md   (the big decisions and why)
- plans/glossary_v2.md    (words we agreed on)

Now build only this step from my plan. Keep everything that's already
working from the city search. Don't build anything past this step —
we'll do the next one later.

Follow my plan for the field names and the mapping rules. If anything in
it is missing or contradicts itself, stop and tell me which part rather
than guessing.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, check the WeatherSignal shape in the browser:

Open the page Copilot built. Search "Arlington", select Arlington
Virginia, click **Fetch weather**. You should see the current weather, the
next 24 hours, and the next 7 days. Open the mapped WeatherSignal view and
confirm it has the three nested sections (`current`, `hourly`, `daily`),
each with its own units block, and the shared fields (`location`,
`latitude`, `longitude`, `timezone`, `sourceUrl`, `isFallback`). The page
should label the result as live evidence and link to the exact Open-Meteo
address it used (no key, no login).

If you're stuck, open `day-3/phase 3/` directly. Keep your blocked work
for comparison.

**Checkpoint 3:** the weather works. Current, hourly, and daily data flow
from raw reply to clean WeatherSignal to readable cards.

---

## Phase 4 — Add the fake fallback

Keep three things separate in the app:

- The **readable card** is what the person sees.
- The **WeatherSignal object** is your app's clean internal copy.
- The **raw reply** is the exact JSON Open-Meteo sent back — the audit
  trail.

Don't mix them into one object. A change to labels or layout must not
change the WeatherSignal data. The current, hourly, and daily sections
stay separate in all three views.

In this phase Copilot adds:

- A **fallback signal** — a fake, always-the-same WeatherSignal for a
  fictional place. It has the same current/hourly/daily shape, with
  `isFallback` set to `true`. Your plan names the place; the shipped
  example uses "Workshop Harbor, Fictional Coast".
- Visibly distinct **live**, **fallback**, and **error** states, plus a
  way to **retry** the live request.
- Whatever rule your plan states for **when fallback appears** — on
  demand from a button, or automatically after a live failure. The two
  are very different provenance stances, so check what your plan actually
  says before you build.
- A rule: if the person picks a new city or loads fallback while a weather
  request is pending, the old reply is ignored.

> [!IMPORTANT]
> **The one rule that is not negotiable:** fallback must never be
> presentable as a live result. Whatever triggers it, the banner, the
> `isFallback` flag, and the source must make it unmistakable — no
> success styling, no real city name, no Open-Meteo URL. Everything else
> here is your plan's call; this part is the course's.

Before you paste the prompt, **attach a mock** to help Copilot
understand the general shape — a sketch showing the "Fictional
fallback" banner, the retry button, the error message, and the "Load
fictional fallback" button. Copilot should use it as inspiration, not
copy it.

**Ask Copilot** (copy this whole block):

```text
On a previous step I wrote a plan for a small weather app. I've already
built the city search and the weather fetch. Now I want you to build the
next step — the fake fallback and the error/retry states.

I've attached a mock to help you understand the general shape and feel
of the UI for this step. Don't copy it literally — use it as
inspiration for the layout, the labels, the fallback banner, the retry
button, and the visual structure, but build your own clean, accessible
implementation.

First, read the rule files in this checkpoint: AGENTS.md and TECH.md.
These tell you what you may write and what safety rules apply.

Then read the plan I wrote. It's in these files:
- plans/spec_v2.md        (what the app should do)
- plans/plan_v2.md        (the step-by-step build plan)
- plans/adr_v2_final.md   (the big decisions and why)
- plans/glossary_v2.md    (words we agreed on)

Now build only this step from my plan. Keep everything that's already
working from the city search and the weather fetch. Don't build anything
past this step.

Follow my plan for the fallback's fictional location, its labels, and
exactly when it appears. If my spec and my plan disagree about whether
fallback loads automatically after a live failure, stop and tell me —
don't pick one and carry on.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, open the page it built and trigger the fallback
the way your plan says — either by clicking the load control, or by
blocking the network (Developer Tools → Offline) and letting a live fetch
fail. You don't need a working network for either. Confirm:

- A banner marks the data as fictional (the shipped example says
  **FICTIONAL FALLBACK**).
- `isFallback` is `true` (you can see this in the mapped object view).
- The source says the data is a bundled fictional fixture, not a URL.
- The location is the fictional one your plan names.
- The current, hourly, and daily sections all show the fake values.
- No text anywhere claims a live request succeeded.

The fallback is deterministic, so it looks the same every time you load
it. Load it twice and confirm the numbers don't move.

If you're stuck, open `day-3/phase 4/` directly. Keep your blocked work
for comparison.

**Checkpoint 4:** fallback works. Live, fallback, and error states look
visibly different.

---

## Phase 5 — Fix the UI, milestone by milestone

Your app works. It probably doesn't look right.

This phase has **no shipped answer and nothing to compare against**, and
that's deliberate. Your agent made hundreds of small choices your plan
never specified — spacing, label wording, card order, how much of the
hourly list to show — and it may well have added inputs, regions, or
features nobody asked for. Everyone in the room is looking at a different
app with a different set of problems. There is no `finish/` folder for
this, because there is nothing to match.

So instead of a checklist, you get a **method**: collect the issues before
you fix any of them, turn them into a plan with independent milestones,
and take the milestones one at a time.

> [!NOTE]
> This is the milestone approach Phase 7 argues for, applied for real. You
> ask for the increments **before** any code is written, so each one has
> its own acceptance criteria and can be checked on its own. Compare how
> this feels against Phases 2–4, where the splits were imposed on a plan
> that never had them.

### Step 1 — Open a read-only session and collect the issues

Don't let the agent start fixing things while you're still finding them.
The first fix changes the layout, and half your remaining notes stop
matching what's on screen.

Start a new chat in your working folder and paste:

```text
We're going to fix the UI of the app in app/. Before any code changes, I
want to collect the issues.

For this conversation you are in read-only mode:
- Do not edit, create, or delete anything under app/.
- Do not run commands that change files.
- The only file you may write is implementation/ui-issues.md.

Open the app and look at it, then wait. I'm going to describe problems one
at a time, and some of them I'll show you as screenshots. After each one,
add it to implementation/ui-issues.md as a numbered entry with: what I
said, which part of the UI it affects, and how you'd know it was fixed.
Ask me a clarifying question only if you genuinely cannot place the issue.

Don't propose solutions yet and don't start planning. Just capture.
```

Now walk through your app and talk. One issue at a time, in plain words:
"the hourly list is too long", "these two cards collide on a phone", "this
label says Submit", "there's a search box here I never asked for".

### Step 2 — Show, don't describe

When an issue is visual, **take a screenshot and attach it**. Circle or
crop if you can.

This is not just convenience. Describing a layout problem in words usually
takes several rounds — you describe, the agent guesses wrong, you correct
it — and every round re-sends the conversation. One image pins the problem
in a single turn. It is faster, it is cheaper, and it removes the
misunderstanding rather than negotiating it away.

Screenshot the states too, not just the default view: narrow width, the
error state, the fallback state, a long city name.

### Step 3 — Ask the agent what it doesn't understand

When you've run out of issues, hand the questioning back:

```text
That's all the issues. Re-read implementation/ui-issues.md end to end.

Now ask me your questions — anything ambiguous, anything where two of my
issues conflict, anything where you'd have to guess a value, a label, or a
layout. Number them and stop. Don't answer them yourself.
```

Answer them properly. A guess you let through here becomes a fix you
reject in Step 5.

### Step 4 — Ask for three independent milestones

```text
Here are my answers: [paste them]

Update implementation/ui-issues.md with them, then write
implementation/ui-plan.md: a plan that fixes every issue in the list,
organised into exactly three milestones.

Each milestone must be independent — demonstrable on its own, with its own
acceptance criteria and its own check, and it must not require the later
milestones to exist. Say which issue numbers each milestone closes, and
make sure every issue is covered by exactly one of them.

Still no code changes.
```

Read the plan before you approve it. Every issue accounted for? Is
milestone 1 really checkable without milestone 2? If not, send it back.

### Step 5 — Run one milestone, then stop

```text
Implement milestone 1 from implementation/ui-plan.md, and only milestone 1.
Don't start milestone 2. Don't change anything that isn't in the issue
list. When you're done, tell me which issue numbers you closed and how to
check each one in the browser.
```

Open the app and check each issue it claims to have closed. When something
is off — and it will be — **reject it and be specific**:

```text
Milestone 1 isn't done. Specifically:
- issue 3: [what I see] — I expected [what should happen]
- issue 7: you changed [X], which I didn't ask for — revert that

Fix only these. Don't move on to milestone 2 and don't rewrite anything
that's already right.
```

Repeat until milestone 1 is genuinely done. **Then** start milestone 2.

Resist the urge to let a small miss slide "for now". The whole reason the
milestones are independent is so you can close them completely; a milestone
you half-accept turns into a bug you rediscover in milestone 3.

### Step 6 — Done when the list is empty

The phase is finished when every issue in `implementation/ui-issues.md` is
closed and all three milestones are accepted. Finish with a quick pass:

- Open your app at a wide size (1280×900) and a phone size (390×844). The
  page never scrolls sideways.
- The browser console shows no red errors.
- Every state you can still reach renders: loading, empty, error, retry,
  live success, fallback.
- Nothing you didn't ask for got changed along the way.

> [!NOTE]
> If your app only works when opened through a local server rather than
> straight from the file, run one from your working folder:
> ```bash
> npx --yes http-server "day-3/my-app/app" -p 8080
> ```
> Then open `http://localhost:8080`.

**Checkpoint 5:** you collected the issues before fixing any of them,
turned them into three independent milestones, and closed each one
completely before starting the next. Your app looks the way you wanted —
and it looks different from everyone else's.

---
## Phase 6 — Review the implementation against the spec

You built the weather app from a plan. But did you build what the plan
said? Now you review the **code against the spec** — the same thing you
do at work when you review an implementation against an ADR.

You have three ways to do it. Use at least one; use more if you have time.
They differ in what they remove from the reviewer — Option A and B change
the *tool*, Option C changes the *context and the model*.

All three run from your working folder (`day-3/my-app/`), so the paths in
the prompts — `app/`, `plans/spec_v2.md` — resolve correctly.

> [!NOTE]
> Options A and B need the **GitHub Copilot App**, the chat application
> that's separate from the editor extension. If you only have Copilot in
> VS Code, `/rubber-duck` and spar mode may not be available to you — use
> **Option C**, which needs nothing beyond the editor you already have.

### Option A — Rubber duck (built-in critic)

The **rubber duck** is a built-in critic in the GitHub Copilot App. It's
designed to review your work with a **different model** from the one
driving your session, so it catches blind spots the main model shares
with itself. It categorizes feedback as **Blocking**, **Non-blocking**,
or **Suggestions**.

Open the Copilot App, start a session in your working folder, and type:

```text
/rubber-duck Review the weather app code in app/ against my contract:
plans/spec_v2.md, plans/plan_v2.md, and the AGENTS.md and TECH.md rules
in this folder.

Find discrepancies: fields in the code that don't match the
WeatherSignal contract, states the spec requires but the code doesn't
handle, fallback behaviour that doesn't match, anything the plan said to
build that's missing, and anything the code does that no document asked
for.

For each finding, quote the requirement and give the file and line range
in the code. Categorize it Blocking, Non-blocking, or Suggestion. If the
spec and the plan contradict each other, report that as its own finding
instead of picking a side. If you can't find evidence for something, say
UNKNOWN — don't invent a file, a line, or a requirement.
```

Read the critique. Fix **Blocking** items before you continue.
**Non-blocking** items should also be fixed. **Suggestions** are
judgment calls.

### Option B — Spar (Copilot App)

**Spar** is a review mode in the GitHub Copilot App. It argues with your
implementation the way a human reviewer would — pushing back rather than
listing. Open the Copilot App, start a session in your working folder,
select spar mode, and ask:

```text
Spar with me about the weather app in app/. My contract is
plans/spec_v2.md, plans/plan_v2.md, and the AGENTS.md and TECH.md rules
in this folder.

Find anything the code does that no document asked for, and anything the
documents require that the code doesn't do. Push back on my reasoning,
don't just list findings.

Cite the document section and the code location for each point, and
label it Blocking, Non-blocking, or Suggestion. If my spec and my plan
disagree, say so rather than choosing. Say UNKNOWN rather than guessing.
```

Read the findings. Fix the ones you agree with before you continue — and
where you disagree, be able to say why.

### Option C — A plain prompt in a fresh session

No special app and no special command. This option works in whatever
editor you already have, and it removes the two things most likely to
make a review agreeable: **the conversation** and **the model**.

1. Open a **brand-new chat session** — not the one you built in. A new
   session has no memory of your build, so it can't be steered by the
   reasoning that produced the bug.
2. **Switch the model** in the model picker to a different one from the
   one that wrote the code. Different training, different blind spots.
3. Point it at your working folder and paste this:

```text
Review an implementation against its own written contract. You did not
write this code and you were not part of the conversation that produced
it. Treat both as unfamiliar.

Read, in this order:
1. plans/spec_v2.md          what the app is supposed to do
2. plans/plan_v2.md          the ordered build steps
3. AGENTS.md and TECH.md     the rules the build had to follow
4. app/                      the implementation

Then report every place the code and the contract disagree. For each
finding give:
- the requirement, quoted, and which document and section it came from
- the code location, file and line range
- what the code actually does instead
- severity: Blocking, Non-blocking, or Suggestion

Cover at least: the WeatherSignal field names and nesting; every visible
state the spec requires; what happens when a field is missing or not a
number; what happens when an array is shorter than expected; when
fallback may appear and how it is labelled; stale-response handling; and
the accessibility requirements.

Two rules. If the spec and the plan contradict each other, report that as
a finding in its own right rather than picking a side. If you cannot find
evidence for a claim, write UNKNOWN — do not invent a file, a line
number, or a requirement.
```

Because this reviewer has no context, it will occasionally flag something
that's fine. That's the cost of the fresh eyes, and it's cheap: you can
answer a wrong finding in one sentence. A finding you *can't* answer is
the one worth fixing.

### After any review

Re-run the review after fixing to confirm the Blocking findings are gone.

Whichever option you used, spot-check one finding yourself before you act
on it. Open the file and line it cites and confirm the code really says
what the review claims. A review is a claim too.

**What you should observe:**

- The review finds discrepancies the build phases missed: a field name
  that doesn't match the contract, a state the spec requires but the
  code doesn't handle, a fallback label that's slightly wrong.
- A clean review means the implementation matches the spec — you built
  what you said you'd build.
- The same habit from the planning review: the code is a claim, the
  review is the check, the fix is the repair.
- If you ran more than one option, they won't agree. Where they overlap,
  you've found something real; where only one flags it, you have a
  judgment call rather than a defect.

If you're stuck or want to compare, open `day-3/phase 6/` — the shipped
folder for this step.

**Checkpoint 6:** you've reviewed the implementation against the
contract, resolved every Blocking finding, and verified at least one
finding against the code yourself.

---

## Optional Phase 7 — Build the whole plan in one pass

Now run the plan the way it was written: top to bottom, every task, no
splits.

This is not a novelty. Phases 2–4 chopped your plan into three pieces,
and that split came from **this guide**, not from your plan. Open
`plans/plan_v2.md` and look at its shape: it's an ordered list of tasks,
each with its own verification step, ending in a final self-review pass.
Nothing in it says "stop after the search box." When you tell an agent to
"build only this step and nothing past it," you cut the plan off before
the parts that check the work.

You can see the damage in the shipped folders. The plan asks for a
contract test file, written in one task and extended in the next. Every
phase-split checkpoint — `phase 1/` through `phase 6/` — has **no tests
at all**. The one-shot build has them, because it was the only build
allowed to reach that task.

**Attach a mock** of the full app to help Copilot understand the
general shape — the three regions, the search box, the weather cards,
the fallback banner, and the retry button. Copilot should use it as
inspiration, not copy it. Then:

**Ask Copilot** (copy this whole block):

Start this in a **fresh working folder** — copy the starter again, so you
end up with a clean one-pass build you can compare against your
step-by-step one:

```bash
cp -R "day-3/starter" "day-3/my-app-onepass"
```

**Ask Copilot** (copy this whole block):

```text
On a previous step I wrote a plan for a small weather app. I want you to
execute that plan end to end, in order, without stopping partway.

I've attached a mock to help you understand the general shape and feel
of the full UI. Don't copy it literally — use it as inspiration for the
layout, the labels, the card positions, the fallback banner, the retry
button, and the visual structure, but build your own clean, accessible
implementation.

First, read the rule files in this folder: AGENTS.md and TECH.md. These
tell you what you may write and what safety rules apply.

Then read my plan:
- plans/spec_v2.md        (what the app should do)
- plans/plan_v2.md        (the ordered build plan)
- plans/adr_v2_final.md   (the big decisions and why)
- plans/glossary_v2.md    (words we agreed on)

Work through every task in plans/plan_v2.md from the first to the last,
in the order written. Do not stop early and do not skip a task because it
looks like polish — that includes any tests the plan asks for, any
accessibility or responsive work, and any final verification or
self-review checklist at the end. Run the plan's own verification step
for each task as you reach it.

Follow my plan for the details. Where it states a value, a name, or a
rule, use it rather than your own default. If the plan is missing
something you need, or the spec and the plan contradict each other, stop
and tell me which part — don't pick a side and carry on.

When you're finished, report: which tasks you completed, which
verification steps you ran and their results, anything the plan asked for
that you could not do, and any place the documents disagreed.
```

**What you should observe:**

- **This build is usually better than the step-by-step one.** More of the
  plan gets executed — the tests, the accessibility pass, the final
  self-review — because nothing cut it short.
- The agent's own checks work better here. A self-review over a finished
  app can catch a missing state or an untested branch; the same review
  over one-third of an app has almost nothing to check against.
- Compare the two builds side by side. Which has tests? Which handles
  every visible state the spec lists? Which one would you hand to someone
  else?

**The lesson is about the plan, not the prompt.** On Day 2 nobody asked
the planning skill for milestones, so it produced one continuous sequence
— correctly, because that's what was requested. A plan shaped like that
is meant to be executed like that. Splitting it afterwards is something
*you* imposed, and the cost lands on the parts that come last: tests,
accessibility, verification.

So if you want to build incrementally — and there are good reasons to,
like reviewing smaller diffs — that has to be a **planning** decision, not
a prompting one. Next time, ask for it up front:

```text
Break the plan into milestones. Each milestone must be independently
demonstrable and carry its own acceptance criteria and verification
steps, so it can be built and checked without the later milestones
existing.
```

Then each phase has something real to verify against, and stopping early
costs you nothing.

**Checkpoint 7 (optional):** you executed the plan end to end, compared
the result against your step-by-step build, and can say which parts of
the plan the split was costing you.

---

## Common mistakes

- **Forgetting debounce.** Without the wait your plan specifies, the app fires a geocoding
  request on every keystroke. The Network panel will show a flood of requests
  and Open-Meteo may rate-limit you.
- **Padding a short array.** If the hourly source has fewer than 24 entries,
  the mapper must reject it — not fill with zeros. A padded array is a lie
  that looks like live data.
- **Letting fallback pass for live data.** Whatever your plan says triggers
  the fallback, the moment it appears the page must say so — banner,
  `isFallback`, and a source that isn't a live URL. If a reviewer can't tell
  a live failure from a live success at a glance, provenance is lost. Check
  what your spec and your plan each say about *when* fallback appears; if
  they disagree, that's a finding, not a detail.
- **Mixing the three views.** The readable card, the mapped `WeatherSignal`,
  and the raw response are three separate things. If a label change mutates
  the mapped object, the contract is broken.
- **Stale request after switching cities.** If you pick a new city while the
  first weather request is pending, the old reply must be ignored. If the old
  city's weather appears, tell Copilot to fix the stale-request handling.
- **Forgetting the `hourly` parameter or `forecast_days=7`.** A request
  missing either produces a short or empty array and the mapper rejects it.
  Check the Network panel, not just the page.

---

## Accessibility check

The spec requires keyboard access, visible focus, labeled controls, and a
live region. Verify it before you hand off — don't leave it to Day 4.

1. Unplug your mouse (or don't touch it). Using only Tab, Shift+Tab, Enter,
   and the arrow keys: search a city, pick a result, activate **Fetch
   weather**, open the raw response view, reach the retry control, and reach
   whatever control your plan gives for loading the fictional fallback (if
   it has one). You should see a visible outline around whatever has focus at
   every step. If focus disappears, that's a bug — tell Copilot to fix it.
2. Turn on your screen reader (VoiceOver on macOS, NVDA on Windows, Orca on
   Linux) and navigate the page. Confirm the live region announces:
   - "loading" while the search runs
   - "N results found" or "no results"
   - "selected: city name"
   - the weather state (loading, success, fallback, error)
3. Run Lighthouse → Accessibility (DevTools → Lighthouse → Accessibility
   only → Generate report). Fix anything scored below 100 that the spec
   requires: missing labels, low contrast, missing landmark, no focusable
   element. Re-run until it's clean.

If you're short on time, at least do step 1 — it catches the most common
a11y regressions in under a minute.

---

## Reference states

These describe what each state has to **communicate**, not what it has to
look like. Your layout, wording, and control names are yours — Phase 5 made
sure of that. What isn't yours is the meaning: a live result must be
traceable, a fictional one must be unmistakable, and a failure must not read
as either. Walk your app through the states below and check the meaning
survives.

Values in quotes are from the shipped example. Yours will differ.

**Empty (starter, no action yet):**
- Three regions visible: `controls`, `evidence`, `review` (Region 3 is a
  placeholder).
- Buttons disabled. Search box empty. No network activity.

**Search loading:**
- A spinner or "searching…" message in the search results area.
- The live region announces "loading".
- Network panel shows one request to `geocoding-api.open-meteo.com`.

**Search results:**
- A short list of result buttons, each identifying the place unambiguously
  (the shipped example shows five, as "city, admin1, country").
- Tab and Enter work. The live region announces "N results found".

**No results:**
- A "no results" message. The live region announces it.
- No weather request is made.

**Weather loading:**
- The evidence region shows a loading state.
- The live region announces "loading".
- Network panel shows one request to `api.open-meteo.com`.

**Weather success (live):**
- Current conditions card (temperature, apparent temperature, humidity,
  precipitation, weather code, wind speed, wind direction, wind gusts,
  cloud cover, pressure, is day/night).
- Hourly list of 24 entries. Daily list of 7 entries.
- A source link to the exact Open-Meteo URL (no key, no login).
- The mapped `WeatherSignal` view shows `isFallback: false`.
- Nothing anywhere marks the data as fictional.

**Fictional fallback:**
- A banner that is impossible to miss, marking the data as fictional (the
  shipped example says **FICTIONAL FALLBACK**).
- The location is the fictional one your plan names (the shipped example
  uses "Workshop Harbor, Fictional Coast").
- Source says it's a bundled fictional fixture, not a live URL.
- The mapped `WeatherSignal` view shows `isFallback: true`.
- No text anywhere says "live", "Open-Meteo", "success", or a real city.

**Error with retry:**
- An error message (not a crash), naming what failed.
- A retry control, still enabled.
- Whatever your plan says should happen to fallback here — and if fallback
  did appear, the page says so rather than implying the live call worked.
- The live region announces the error.

---

## Hand off

Either keep your own build — `day-3/my-app/`, with live weather, fallback,
and retry all working — or open `day-4/starter/`, which already has a
correct weather app. Day 4 builds the third region on top of whichever you
choose; the weather app must keep working unchanged.

---

## References

The full list lives at [references.md](../references.md). The most
relevant for today:

- [Open-Meteo API docs](https://open-meteo.com/en/docs) — the forecast
  endpoint and every parameter you fetch
- [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api) —
  the city-search endpoint
- [WMO weather variable codes](https://open-meteo.com/en/docs) — the
  `weather_code` number table
- [WebAIM keyboard accessibility](https://webaim.org/techniques/keyboard/) —
  for the accessibility check
- [MDN: live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) —
  how the live region announces states to a screen reader