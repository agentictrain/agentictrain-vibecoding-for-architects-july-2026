# How the four days connect

Each day's output is the next day's input. If you skip a day, open the
shipped `starter/` folder for the day you're starting — it already contains
the previous day's known-good result.

```text
Day 2 — Define, draw, and plan
  |
  |  produces: spec_v2.md, adr_v2_final.md, plan_v2.md, glossary_v2.md
  |  ships at: course/day-3/starter/plans/
  v
Day 3 — Build the weather app
  |
  |  reads:   the Day 2 plans
  |  produces: a working weather app (city search + WeatherSignal + fallback)
  |  ships at: course/day-4/starter/app/
  v
Day 4 — Add the AI review
  |
  |  reads:   the working weather app (unchanged)
  |  produces: the model settings modal + the five-field review
  |  ships at: course/day-5/starter/app/
  v
Day 5 — Architect skills lab
  |
  |  reads:   the WeatherSignal shape (from Day 3) as input to one exercise
  |  produces: six skill-driven artifacts (ADR, review, API spec, codebase
  |           report, dashboard, decision doc)
  |  no hand-off: this is the last day
```

## The one chain that runs through all four days

```text
specify ─► draw ─► fetch ─► map ─► generate ─► validate ─► red-team ─► judge
  (Day 2)         (Day 3)            (Day 4)                (Day 5)
```

If one link can't be inspected, the result isn't ready for handoff.

## What each day does NOT do

- **Day 2** writes no application code. The starter shell stays unchanged.
- **Day 3** makes no model request. The LLM is out of scope.
- **Day 4** does not change the weather app. The weather evidence must stay
  visible on every model failure.
- **Day 5** does not change the app at all. It uses reusable skills on
  standalone architect tasks.

## Where to start if you skipped a day

| You're starting on | Open this folder | It already contains |
|---|---|---|
| Day 2 | `course/day-2/starter/` | the static three-region shell |
| Day 3 | `course/day-3/starter/` | the shell + the Day 2 plans |
| Day 4 | `course/day-4/starter/` | the working weather app |
| Day 5 | `course/day-5/starter/` | the working app with the AI review |

Each day's guide also links to the shared [glossary](glossary.md) for terms
that appear across multiple days.