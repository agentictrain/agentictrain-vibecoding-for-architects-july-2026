# Workspace index

- `AGENTS.md` and `TECH.md` define the proof-of-concept operating and safety
  rules.
- `GroqAPI.md` is the offline reference for the Groq chat-completions
  endpoint (URL, auth header, request/response shape, JSON mode, failure
  handling). Read it before writing any model-call code.
- `app/` contains the double-clickable browser app: shell, styles, controller,
  and WeatherSignal mapper.
- `plans/` holds the approved spec, ADR, glossary, and step plan for the PoC.
- `tests/weather-signal.test.mjs` verifies the pure WeatherSignal mapping and
  deterministic fallback without a browser.
- `implementation/` stores factual records about decisions, changed files, and
  verification for this checkpoint.
