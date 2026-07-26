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
