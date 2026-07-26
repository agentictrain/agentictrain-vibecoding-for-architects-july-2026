# Day 3 — Build the weather app

Today you build a small weather app. The app lets a person type a city name,
pick a city from the list, and see the current weather, the next 24 hours,
and the next 7 days — all from a free public weather service called
Open-Meteo. You will not write the code yourself. You will tell GitHub
Copilot what to build, check the result in the browser, and fix what's
wrong.

The whole thing takes two hours. You work in small steps called
**checkpoints**. If a step breaks, you open the next checkpoint folder,
which already has the correct code for that step, and keep going.

> [!NOTE]
> A shared [course glossary](../glossary.md) defines every technical term
> used across all four days. Open it in a tab and refer back when a term is
> unfamiliar.

## Prerequisites and preflight

Before the clock starts, make sure you have:

- A current web browser (Chrome, Edge, or Firefox).
- The repository open on your computer.
- GitHub Copilot working in your editor.

Open `course/day-2/starter/app/index.html` in your browser. You should see
three empty boxes with headings and disabled buttons — the shell you'll
build on today. If the page doesn't open or looks broken, check that you
opened the file directly in a current browser; if it still looks wrong,
open the shipped `course/day-3/starter/app/index.html` instead and compare.

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
shipped with the course at `course/day-3/starter/plans/` and use those
instead. You don't need a facilitator.

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

Today has five **phases** (progress markers in this guide) and four
**checkpoint folders** Copilot builds into. You paste a prompt; Copilot
creates the folder and the files.

If you get stuck on a checkpoint, open the **next** checkpoint folder the
course ships and point Copilot at it. That folder already has the correct
code for that step. Keep your blocked work so you can compare. Never edit
an earlier checkpoint folder to make later work pass.

> [!NOTE]
> Each checkpoint folder has an `implementation/` subfolder. When Copilot
> makes a decision without asking you, it records it in
> `implementation/decisions.md`. When something looks odd, read that file
> first — it explains why the code is the way it is. The shipped `final/`
> folder's `implementation/` is a complete worked example you can compare
> against your own.

The checkpoint path for Day 3:

```text
course/day-3/starter/   the starting shell; no weather yet
course/day-3/phase 2/   city search works; pick a city
course/day-3/phase 3/   live weather + clean WeatherSignal
course/day-3/phase 4/   raw view, fake fallback, errors, retry
course/day-3/phase 6/   review the code against the spec
course/day-3/phase 7 - optional/   build the whole app in one shot
course/day-3/final/     your final weather app
```

## Outcome and two-hour route

- **0–15 min — Phase 1: Look before you build.** Open the starter, run two
  commands in the terminal, read the raw weather reply.
- **15–40 min — Phase 2: Build city search.** Tell Copilot to build the
  search box in `phase 2/`. Test it.
- **40–55 min — Phase 3: Add the weather.** Tell Copilot to fetch and map
  weather in `phase 3/`. Run the contract test.
- **55–80 min — Phase 4: Add the fallback.** Tell Copilot to add fake
  fallback and error states in `phase 4/`. Test them.
- **80–100 min — Phase 5: Break and change.** Break the app on purpose, or
  change something that works but you don't like.
- **100–115 min — Phase 6: Review against spec.** Run rubber-duck and/or
  spar to find discrepancies between the code and the spec.
- **115–120 min — Hand off.** Use your final result or open
  `course/day-4/starter/`.

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

Open `course/day-3/starter/app/index.html` in your browser. You should see
three empty boxes with headings, all buttons disabled, and no network
activity. This is the shell you'll build on. If it doesn't open or looks
broken, run `npm run verify` from the repository root — it will report any
missing or malformed file. Fix what it reports before you continue.

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
  --data 'current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,pressure_msl,is_day' \
  --data 'hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m' \
  --data 'daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,sunrise,sunset' \
  --data 'forecast_days=7' \
  --data 'timezone=auto'
```

Or ask Copilot:

```text
Use curl (or a tool you have) to call this URL and show me the full reply:
https://api.open-meteo.com/v1/forecast?latitude=38.88101&longitude=-77.10428&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,pressure_msl,is_day&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,sunrise,sunset&forecast_days=7&timezone=auto
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

- Wait 350 milliseconds after the person stops typing, then search (this
  is "debounce" — it stops the app from searching on every keystroke).
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

Now build only the first step from my plan — the city search. Don't build
anything past that step, even if the plan lists more — we'll do those
later. Don't fetch weather yet and don't build the WeatherSignal.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, open `course/day-3/phase 2/app/index.html` in the
browser. Type "Arlington" and pick Arlington, Virginia. Then type a nonsense word like
"zzzz" and confirm you see "no results". Open the browser's Network panel
(Developer Tools → Network) and confirm only the geocoding address was
contacted — not the weather address.

**What you should see:**

- The search box waits for you to stop typing, then searches.
- Results appear as buttons. You can Tab to them and press Enter.
- A nonsense query shows "no results".
- The weather endpoint was **not** contacted.

If you're stuck, open `phase 2/` directly — it already has the correct code.
Keep your blocked work so you can compare.

**Checkpoint 2:** city search works. A selected city is ready for the
weather step.

---

## Phase 3 — Add the weather

In this phase Copilot adds three functions to `app/weather-signal.js`:

- `buildForecastUrl(location)` — builds the Open-Meteo weather address for
  a selected city.
- `fetchWeather(location)` — sends the request and returns the raw reply.
- `mapWeatherSignal(location, response, sourceUrl)` — copies the raw reply
  into the clean WeatherSignal shape.

> [!NOTE]
> The shipped starter calls the file `app/weather-signal.js` (not
> `weather.js`). If Copilot splits the functions across `app.js` and
> `weather-signal.js`, that's fine — the contract is the function names and
> the WeatherSignal shape, not the filename. Open the `final/` folder to
> see how the shipped version organizes them.

The WeatherSignal shape has three sections — `current`, `hourly`, and
`daily` — plus a few shared fields at the top. Here is the exact shape. The
zeros are placeholders — they show the type of each field, not real
weather:

```json
{
  "location": "Arlington, Virginia, United States",
  "latitude": 38.88101,
  "longitude": -77.10428,
  "timezone": "auto",
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

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, check the WeatherSignal shape in the browser:

Open `course/day-3/phase 3/app/index.html`. Search "Arlington", select Arlington
Virginia, click **Fetch weather**. You should see the current weather, the
next 24 hours, and the next 7 days. Open the mapped WeatherSignal view and
confirm it has the three nested sections (`current`, `hourly`, `daily`),
each with its own units block, and the shared fields (`location`,
`latitude`, `longitude`, `timezone`, `sourceUrl`, `isFallback`). The page
should label the result as live evidence and link to the exact Open-Meteo
address it used (no key, no login).

If you're stuck, open `phase 3/` directly. Keep your blocked work for
comparison.

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

- A **FALLBACK_SIGNAL** — a fake, always-the-same WeatherSignal for a
  fictional place called "Workshop Harbor, Fictional Coast". It has the
  same current/hourly/daily shape, with `isFallback` set to `true`.
- A **raw response viewer** you can open and close.
- Visibly distinct **live**, **fallback**, and **error** states.
- A rule: **never load fallback automatically after a live failure.** The
  person must click "Load fictional fallback" themselves.
- A rule: if the person picks a new city or loads fallback while a weather
  request is pending, the old reply is ignored.

Before you paste the prompt, **attach a mock** to help Copilot
understand the general shape — a sketch showing the "Fictional
fallback" banner, the retry button, the error message, and the "Load
fictional fallback" button. Copilot should use it as inspiration, not
copy it.

**Ask Copilot** (copy this whole block):

```text
On a previous step I wrote a plan for a small weather app. I've already
built the city search and the weather fetch. Now I want you to build the
last step from my plan — the fake fallback and the error/retry states.

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

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

After Copilot finishes, open `course/day-3/phase 4/app/index.html`. Click
**Load fictional fallback** (you don't need network for this). Confirm:

- The banner says **FICTIONAL FALLBACK**.
- `isFallback` is `true` (you can see this in the mapped object view).
- The source says the data is a bundled fictional fixture.
- The location is "Workshop Harbor, Fictional Coast".
- The current, hourly, and daily sections all show the fake values.
- No text anywhere claims a live request succeeded.

The fallback is always the same so everyone in the workshop sees the same
thing. It never replaces a failed live call on its own.

If you're stuck, open `phase 4/` directly. Keep your blocked work for
comparison.

**Checkpoint 4:** fallback works. Live, fallback, and error states look
visibly different.

---

## Phase 5 — Break everything and change what you don't like

Now you try to break the app on purpose **and** you fix anything that works
but isn't what you wanted. Pick **one** of the approaches below (or do more
than one if you have time). Each one stresses a different part of the app.

### Approach A — Block the network

Open `course/day-3/phase 4/app/index.html`. Open Developer Tools → Network.
Select "Offline" (Chrome) or "Work Offline" (Firefox). Search a city,
select it, and click **Fetch weather**.

You should see:

- An error message (not a crash).
- A **Retry live request** button still available.
- **No automatic fallback.** The fake data does not load by itself.

Turn the network back on and click **Retry live request**. The live weather
should load.

### Approach B — Switch cities mid-request

Type a city, pick it, and click **Fetch weather**. While the request is
still pending (watch the loading state), type a different city and pick it.
The first reply must be ignored — the app must show weather for the second
city, not the first. If the old city ever appears, that's a bug: tell
Copilot to fix the "stale request" handling.

### Approach C — Try weird inputs

Type each of these and see what happens:

- A city name with leading spaces ("  Arlington").
- A city name with a special character ("São Paulo").
- A nonsense word ("zzzz") — you should see "no results".
- A single letter ("A") — the search must wait for two characters.
- An empty search box — nothing should happen.

The app should handle each one without crashing or showing wrong data.

### Approach D — Use only the keyboard

Unplug your mouse (or don't touch it). Using only Tab, Shift+Tab, Enter,
and the arrow keys: search a city, pick a result, click **Fetch weather**,
open the raw response view, click **Load fictional fallback**, and click
**Retry live request**. You should see a visible outline around whatever
has focus at every step. If focus disappears, that's an accessibility bug.

### Approach E — Check the fake data can't lie

Click **Load fictional fallback**. Read every label and banner on the page.
No text anywhere should say "live", "Open-Meteo", "success", or show a
real city name. The banner must say **FICTIONAL FALLBACK**. The source must
say it's a bundled fictional fixture. If any text makes the fake data look
live, stop and fix it before you continue.

### Approach F — Change something you don't like

The app works, but something is off — a label is confusing, a number
shows too many decimals, the hourly list is too long, the cards look
cramped on a phone, the wrong city shows up first, a button is disabled
for no reason. This is the most common real-world case.

Pick one thing you don't like and ask Copilot to change it. Be specific
and plain:

```text
Open the app you just built. One thing I want to change: [describe what
you see and what you'd rather see instead]. Read the plan and the local
AGENTS.md and TECH.md before editing. Make only that change. Don't
rewrite anything else. Open the page in a browser and confirm the one
thing I asked for is now the way I want. Show me what changed.
```

Examples of small, valid changes:

- "The temperature shows 31.23456 — I want one decimal place, like 31.2."
- "The hourly list shows all 24 hours at once — I want to scroll, or see
  only the next 6."
- "On a phone, the current card and the hourly card overlap — fix the
  layout so they stack."
- "The 'Fetch weather' button says 'Submit' — change it to 'Fetch
  weather'."
- "After I pick a city, the search box keeps the old text — clear it."

Keep the change small. One thing at a time. After Copilot finishes, open
the page and confirm the one thing you asked for is now the way you want,
and nothing else broke. If something else broke, tell Copilot exactly
what and ask it to revert that part.

### Check the result

Whichever approach you picked, finish with these final checks:

- **Every state you can reach** works: loading, empty, error, retry, live
  success, fictional fallback.
- Open your final app at a wide size (1280×900) and a phone size
  (390×844). The page never scrolls sideways.
- The browser console (Developer Tools → Console) shows no red errors.
- Current, hourly, and daily cards all render.
- The source link points at the exact Open-Meteo address.

### If something is wrong

- **No search results:** check the city name is spelled right. Try a
  broader name like "Arlington" instead of a district.
- **Search or weather fails:** keep the Network panel open, read the
  error, and use the retry button. Don't reload the page yet.
- **Old city appears after picking a new one:** tell Copilot to fix the
  "stale request" handling — the old reply must be ignored.
- **Hourly has no data or is short:** the request must include the
  `hourly` parameter and `forecast_days=7`. The slice starts at the
  current hour in the city's timezone.
- **Daily has fewer than 7 days:** confirm `forecast_days=7`. The mapper
  must reject a short `daily` array, not pad it with zeros.
- **Mapping fails:** compare the `current`, `hourly`, `daily` blocks and
  their `*_units` with the shape above. Don't add defaults.
- **Page opens but live fetch is blocked:** some browsers block live
  fetch from a `file://` page. If that happens, skip the live fetch and
  use **Load fictional fallback** to finish the exercise. If you want to
  try live fetch, run a local static server from the checkpoint folder:
  ```bash
  npx --yes http-server "course/day-3/phase 4/app" -p 8080
  ```
  Then open `http://localhost:8080` in your browser.
- **Fallback looks live:** stop. Fix the label, the source text, and the
  `isFallback` value before you continue.

**Checkpoint 5:** you broke the app on purpose and it failed honestly.
The weather app is complete.

---

## Phase 6 — Review the implementation against the spec

You built the weather app from a plan. But did you build what the plan
said? Now you review the **code against the spec** — the same thing you
do at work when you review an implementation against an ADR.

You have two tools for this. Use both if you have time; use at least one.

### Option A — Rubber duck (general second opinion)

The **rubber duck** is a built-in critic in the GitHub Copilot App that
reviews your code using a **different AI model** from the one driving
your session. It catches blind spots the main model missed — bugs,
logic errors, missing edge cases. It categorizes feedback as
**Blocking**, **Non-blocking**, or **Suggestions**.

Open the Copilot App, start a session in your project folder, and type:

```text
/rubber-duck Review the weather app code in app/ against the spec at
plans/spec_v2.md and the plan at plans/plan_v2.md. Find discrepancies:
fields in the code that don't match the WeatherSignal contract, states
the spec requires but the code doesn't handle, fallback behavior that
doesn't match the spec, anything the plan said to build that's missing.
Categorize each finding as Blocking, Non-blocking, or Suggestion.
```

Read the critique. Fix **Blocking** items before you continue.
**Non-blocking** items should also be fixed. **Suggestions** are
judgment calls.

### Option B — Spar (Copilot App)

**Spar** is a review mode in the GitHub Copilot App. It spars with your
implementation — challenging the code the way a human reviewer would.
Open the Copilot App, start a session in your project folder, and ask
it to review the implementation against the spec:

```text
Spar with me. Review the weather app code in app/ against the spec at
plans/spec_v2.md. Find anything the code does that the spec doesn't
describe, and anything the spec requires that the code doesn't do. Be
specific — cite the spec section and the code location for each finding.
```

Read the findings. Fix the ones you agree with before you continue.

### After either review

Re-run the review after fixing to confirm the Blocking findings are gone.

**What you should observe:**

- The review finds discrepancies the build phases missed: a field name
  that doesn't match the contract, a state the spec requires but the
  code doesn't handle, a fallback label that's slightly wrong.
- A clean review means the implementation matches the spec — you built
  what you said you'd build.
- The same habit from the planning review: the code is a claim, the
  review is the check, the fix is the repair.

**Checkpoint 6:** the review is clean. The implementation matches the
spec. The weather app is complete and verified.

---

## Optional Phase 7 — Build the whole app in one shot

If you have time left and want to see what it's like to give Copilot the
whole plan at once instead of step by step, try this. It's the same plan
— just one prompt instead of three.

**Attach a mock** of the full app to help Copilot understand the
general shape — the three regions, the search box, the weather cards,
the fallback banner, and the retry button. Copilot should use it as
inspiration, not copy it. Then:

**Ask Copilot** (copy this whole block):

```text
On a previous step I wrote a plan for a small weather app. I want you
to build the whole thing in one go — city search, weather fetch,
WeatherSignal mapping, fictional fallback, and error/retry states.

I've attached a mock to help you understand the general shape and feel
of the full UI. Don't copy it literally — use it as inspiration for the
layout, the labels, the card positions, the fallback banner, the retry
button, and the visual structure, but build your own clean, accessible
implementation.

First, read the rule files in this checkpoint: AGENTS.md and TECH.md.
These tell you what you may write and what safety rules apply.

Then read the plan I wrote. It's in these files:
- plans/spec_v2.md        (what the app should do)
- plans/plan_v2.md        (the step-by-step build plan)
- plans/adr_v2_final.md   (the big decisions and why)
- plans/glossary_v2.md    (words we agreed on)

Build the complete weather app: location search via Open-Meteo geocoding,
current + hourly + daily forecast fetch, WeatherSignal mapping (current,
hourly, daily sections), evidence views (readable card, raw response,
mapped object), fictional fallback with visible labels, and error/retry
states. Never load fallback automatically after a live failure.

When you're done, open the page you built in a browser and tell me what
works and what doesn't.
```

**What you should observe:**

- Copilot builds the whole app — but it probably makes more mistakes
  than when you built it step by step. That's the teaching: a big prompt
  is harder to get right than three small ones.
- Compare this build to your step-by-step build. Which one has fewer
  bugs? Which one matches the spec better? Which one was faster?
- The step-by-step approach (Phases 2–4) is the same habit as the grill
  and the adversarial review: break big things into small things, check
  each one, fix before moving on.

**Checkpoint 7 (optional):** you built the whole app in one shot and
compared it to the step-by-step build.

---

## Common mistakes

- **Forgetting debounce.** Without the 350 ms wait, the app fires a geocoding
  request on every keystroke. The Network panel will show a flood of requests
  and Open-Meteo may rate-limit you.
- **Padding a short array.** If the hourly source has fewer than 24 entries,
  the mapper must reject it — not fill with zeros. A padded array is a lie
  that looks like live data.
- **Auto-loading fallback after a live failure.** The spec is explicit: the
  person must click "Load fictional fallback" themselves. If the app swaps in
  fallback silently, a reviewer can't tell a live failure from a live
  success — provenance is lost.
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
   and the arrow keys: search a city, pick a result, click **Fetch weather**,
   open the raw response view, click **Load fictional fallback**, and click
   **Retry live request**. You should see a visible outline around whatever
   has focus at every step. If focus disappears, that's a bug — tell Copilot
   to fix it.
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

Compare your app to these plain-text descriptions before you hand off. If
a state looks different, that's the thing to fix.

**Empty (starter, no action yet):**
- Three regions visible: `controls`, `evidence`, `review` (Region 3 is a
  placeholder).
- Buttons disabled. Search box empty. No network activity.

**Search loading:**
- A spinner or "searching…" message in the search results area.
- The live region announces "loading".
- Network panel shows one request to `geocoding-api.open-meteo.com`.

**Search results:**
- Up to five result buttons, each showing "city, admin1, country".
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
- No "FICTIONAL FALLBACK" banner anywhere.

**Fictional fallback:**
- A visible **FICTIONAL FALLBACK** banner.
- Location reads "Workshop Harbor, Fictional Coast".
- Source says "bundled fictional fixture" (or similar), not a live URL.
- The mapped `WeatherSignal` view shows `isFallback: true`.
- No text anywhere says "live", "Open-Meteo", "success", or a real city.

**Error with retry:**
- An error message (not a crash).
- A **Retry live request** button, still enabled.
- No automatic fallback.
- The live region announces the error.

---

## Hand off

Either keep your final result (your `phase 4/` or `final/` folder with live
weather, fallback, and retry all working) or open the
`course/day-4/starter/` folder, which already has the correct weather
app. The weather app must keep working unchanged.

---

## References

The full list lives at [course/references.md](../references.md). The most
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