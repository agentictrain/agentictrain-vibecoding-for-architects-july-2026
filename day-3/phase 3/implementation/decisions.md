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

## 2026-07-22 weather-fetch mapping hardening

- decision: Enforce known-unit allowlists for each required weather field inside the mapper.
- reason: The spec requires rejecting unknown units atomically instead of accepting any non-empty unit string.
- alternatives considered: Keep permissive unit validation and rely on UI labels only.
- expected impact: Stronger WeatherSignal boundary with earlier rejection of incompatible payloads.
- whether human approval is still needed: No, this is within approved weather-fetch and WeatherSignal mapping scope.
