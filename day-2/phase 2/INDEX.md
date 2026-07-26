# Day 2 start: define and draw

This complete starter checkpoint provides the empty, verified application
shell for the Integration Architecture Copilot. It starts the Day 2 exercise
that defines requirements and sketches the interface before feature behavior.

## Already complete

- One responsive page with labeled context and controls, weather evidence,
  and weather-grounded review regions.
- Accessible labels, keyboard focus styles, and an announced starter status.
- Visible placeholders for future public API and model-assisted outputs.
- A static script with no API call, model call, or credential persistence.

## Start here

Read [AGENTS.md](AGENTS.md) and [TECH.md](TECH.md), then inspect
[the application files](app/INDEX.md). Open `app/index.html` in a browser and
compare the three regions with the Day 2 layout exercise.

## Intentionally unfinished

- No API or model request is implemented.
- The controls are placeholders and the action buttons remain disabled.
- Day 2 produces planning artifacts only (spec, ADR, plan, glossary); no
  checkpoint folders are built on Day 2.

## Verify before continuing

From the repository root, run:

```bash
node --check course/day-2/starter/app/app.js
npm run verify
```

All commands must pass before using this folder as a recovery point.

## Recovery

If later Day 2 work is blocked, keep that work for comparison, return to this
folder, rerun the checks, and continue from the matching guide exercise. Do
not overwrite the blocked folder or an earlier known-good checkpoint.