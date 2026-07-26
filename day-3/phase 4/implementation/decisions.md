# Implementation decisions

## 2026-07-22 city-search slice

- decision: Build only Region 1 city search and keep weather/review controls disabled.
- reason: User requested only the first city-search step and explicitly asked not to build weather fetching or WeatherSignal yet.
- alternatives considered: Enabling a partial fetch button after selection; implementing scenario flow now.
- expected impact: Clear scope boundary for this checkpoint and no accidental progression into later phases.
- whether human approval is still needed: No, this follows the explicit task request.

- decision: Keep Scenario control visibly present but disabled during city-search-only scope.
- reason: Preserves the planned layout while preventing work that belongs to later phases.
- alternatives considered: Remove scenario control entirely for this step.
- expected impact: Users can see future flow staging while current implementation remains constrained.
- whether human approval is still needed: No, this remains within requested scope.

## 2026-07-22 weather-fetch and mapping step

- decision: Add a dedicated mapper file at app/weather-signal.js and load it before app/app.js.
- reason: Keeps atomic WeatherSignal validation and mapping separate from UI/rendering code.
- alternatives considered: Keep mapping logic inline in app/app.js.
- expected impact: Easier review and safer boundary between payload validation and UI state.
- whether human approval is still needed: No, this follows the approved plan structure.

- decision: Accept missing current_units.is_day from Open-Meteo and map its unit to a fixed local label 0|1.
- reason: Live responses may omit is_day units, and strict rejection caused valid live payloads to fail.
- alternatives considered: Reject payloads without is_day unit; remove isDay from mapped contract.
- expected impact: Preserves contract completeness while still validating all required values atomically.
- whether human approval is still needed: No, this keeps behavior aligned with the existing contract intent.

## 2026-07-22 fallback and retry step

- decision: Build fallback as an automatic transition after non-abort live failures, then keep retry as an explicit user action.
- reason: Matches glossary and ADR language for fallback behavior while preserving user control for subsequent attempts.
- alternatives considered: Keep fallback as manual-only mode; keep hard error without fallback.
- expected impact: Live-failure flows remain demo-friendly and visibly bounded as fictional evidence.
- whether human approval is still needed: No, this follows the approved fallback semantics.

- decision: Keep fallback values deterministic in a local weather-fallback-v1 fixture with fixed fictional location and arrays.
- reason: Ensures repeatable behavior and easy review of fictional provenance.
- alternatives considered: Generate random fallback values at runtime.
- expected impact: Consistent workshop behavior and deterministic mapped outputs across retries.
- whether human approval is still needed: No, this aligns with plan and glossary terms.
