# Rubber-Duck Review: Weather Workshop PoC v2

**Targets:** `plans/spec_v2.md`, `plans/plan_v2.md`  
**Date:** 2026-07-22  
**Doctrine consulted:** `plans/brief_v2.md`, `plans/glossary_v2.md`, `plans/adr_v2.md`, `plans/adr_v2_final.md`

## Findings

| # | Category | Finding | Evidence | Required correction |
| --- | --- | --- | --- | --- |
| 1 | Blocking | Forecast supersession has no reachable UI transition. The fetch command is disabled while loading, but the plan requires a browser test in which attempt 2 supersedes attempt 1. | `plans/spec_v2.md:129`, `plans/plan_v2.md:450`, `plans/plan_v2.md:600` | Define which user action supersedes a loading forecast. A narrow option is: changing selected location, scenario, or units aborts the active attempt, clears it to empty, and permits a new fetch. Test that exact transition. |
| 2 | Blocking | The controller cannot be imported into the proposed Node test as written. `src/app.js` performs top-level DOM access, then Task 5 requires `tests/state.test.js` to import `createWeatherController` from that browser entry module. Node will throw because `document` is undefined. | `plans/plan_v2.md:210-218`, `plans/plan_v2.md:450` | Put the pure controller in its own module, or export a DOM-free bootstrap and invoke it only behind a browser guard. Run its tests directly under `node --test`. |
| 3 | Blocking | Attempt context is not retained with settled evidence. The controller captures scenario, location, and units, but outcome shapes omit scenario. The brief permits controls to change while old evidence remains, so rendering from current controls can silently change the advisory attached to an older attempt. | `plans/brief_v2.md:37`, `plans/plan_v2.md:426-429`, `plans/plan_v2.md:457` | Store immutable attempt context, including scenario, on success/fallback outcomes. Render evidence and advisory only from that context; expose changed controls as pending context until the next fetch. Add a scenario-change-after-success test. |
| 4 | Blocking | Time representation is under-specified at the exact DST boundary the plan claims to test. The contract has only local `time[]` strings plus one metadata offset, while Task 4 allows repeated local hours and requires an unambiguous instant or offset-bearing timestamp. One offset cannot describe a series crossing an offset transition, and “ordered” is undefined for repeated wall-clock labels. | `plans/spec_v2.md:200-203`, `plans/spec_v2.md:270-272`, `plans/plan_v2.md:403-405` | Define the exact timestamp serialization and ordering invariant for every current/hourly/sunrise/sunset field. Prefer offset-bearing ISO 8601 values ordered by instant, with IANA zone retained in metadata. Specify which offset `utcOffsetSeconds` represents and add spring-forward/fall-back live and fallback fixtures. |
| 5 | Blocking | Invalid geocoding shapes are treated as valid selections or can crash. `body.results` is assumed to be an array, and result names, countries, coordinates, IDs, and timezone values are not validated before they become `SelectedLocation`. | `plans/spec_v2.md:119-123`, `plans/plan_v2.md:276-297` | Add a geocoding response validator. Reject non-array results and malformed entries; require non-empty name/country, finite in-range coordinates, integer-or-null ID, string-or-null admin/timezone, and test mixed valid/invalid result sets with an explicit policy. |
| 6 | Blocking | The specified application-defect state is not implementable for renderer failure. The controller catches fallback construction failure, but rendering occurs after state settlement and has no error boundary; a thrown renderer cannot transition itself to the required error-with-retry UI. | `plans/spec_v2.md:295`, `plans/plan_v2.md:450-457`, `plans/plan_v2.md:602` | Define a top-level render boundary and a minimal non-recursive emergency renderer, or remove renderer failure from the recoverable state contract. Test the selected design without relying on an unspecified browser test hook. |
| 7 | Blocking | Hard reset relies on in-memory initial state but does not explicitly reset browser-restored form values or disclosure state. Browsers may preserve input/radio values across reload, while the initial renderer only updates the fetch button and status. | `plans/spec_v2.md:329-331`, `plans/plan_v2.md:188-218`, `plans/plan_v2.md:604` | On bootstrap, reset/synchronize every control and disclosure from `createInitialState`; disable form restoration where appropriate. Add a reload test after populating controls and opening views. |
| 8 | Non-blocking | The fallback version is not reproducible from the documents. Fixed weather values, rounding precision, timestamp formatting, and conversion rounding are left to the implementer, so two conforming implementations can emit different `weather-fallback-v1` objects. | `plans/spec_v2.md:299`, `plans/plan_v2.md:396` | Put the canonical metric fixture recipe and rounding policy in a versioned artifact or fixture file reviewed by the facilitator, then test exact output snapshots. |
| 9 | Non-blocking | Provider-to-contract unit mapping is not fully specified. The contract requires a unit for every field and normalized labels such as `boolean` and `WMO weather interpretation code`, but neither document enumerates all unit object keys, accepted raw strings, or time-unit strings. | `plans/spec_v2.md:267-273`, `plans/plan_v2.md:351-362` | Add explicit current/hourly/daily unit schemas and a raw-to-contract unit table, including time, date, sunrise/sunset, codes, degrees, percentages, and `isDay`. |
| 10 | Non-blocking | Forecast provenance does not prove that the payload corresponds to the selected coordinates. The mapper validates coordinates but does not define whether those are selected coordinates or provider response grid coordinates, nor any matching tolerance. A valid payload for another place can be labeled with the selected location. | `plans/spec_v2.md:259-263`, `plans/spec_v2.md:275-277`, `plans/plan_v2.md:353-362` | Define and test the relationship between requested coordinates and response grid coordinates. Record provider coordinates in provenance or validate them with an explicit provider-appropriate rule. |
| 11 | Non-blocking | Changed-control behavior from the source brief is absent from the state model and UI tasks. The brief requires controls to be marked changed while old evidence remains; without it, old evidence sits beside visibly different controls with no pending-context indication. | `plans/brief_v2.md:37`, `plans/plan_v2.md:123-133`, `plans/plan_v2.md:305` | Add a `controlsChanged` or equivalent derived state and browser tests for changing location, scenario, and units after success/fallback. |
| 12 | Non-blocking | UTC-substitution copy has three variants, despite provenance copy otherwise being treated as exact. This will make exact browser assertions and facilitator review ambiguous. | `plans/spec_v2.md:123`, `plans/spec_v2.md:262`, `plans/spec_v2.md:307` | Choose one exact user-facing sentence and keep the longer machine-readable substitution reason separately if desired. |
| 13 | Non-blocking | Search and weather announcements have no ownership/priority model. The initial renderer writes only weather status into one live region, while Task 2 later adds search status and Task 8 requires exact, non-duplicated announcements. Concurrent search and retained weather states can overwrite each other. | `plans/plan_v2.md:188-206`, `plans/plan_v2.md:305`, `plans/plan_v2.md:633` | Define separate search and weather status channels, or specify deterministic priority and clearing rules. Test concurrent search while prior evidence is visible. |
| 14 | Suggestion | The plan has no risk register despite carrying acknowledged high-risk areas such as automatic fallback confusion, DST handling, and advisory authority. | `plans/plan_v2.md:1-713`, `plans/adr_v2.md:95-104` | Add a short risk table with impact, likelihood, mitigation, owner, and verification evidence. |
| 15 | Suggestion | The plan's validation commands are not actually focused. `npm test -- tests/state.test.js` appends a file to a script that already expands `tests/*.test.js`, potentially running the target twice and always running unrelated tests. | `plans/plan_v2.md:99-102`, `plans/plan_v2.md:146` | Add a `test:unit` script or invoke `node --test tests/state.test.js` for focused red/green steps. |
| 16 | Suggestion | Two ADRs compete for authority: `adr_v2.md` is accepted and named by the spec, while the more final-sounding `adr_v2_final.md` is proposed. | `plans/spec_v2.md:6`, `plans/adr_v2.md:3`, `plans/adr_v2_final.md:3` | Rename/archive the superseded ADR or add an explicit supersession note so implementers cannot choose by filename. |

## Detailed Blocking Analysis

### Forecast request ownership

The specification requires Fetch weather to be disabled during loading, while the plan requires a second attempt to supersede the first through a browser test. Both cannot be true without another transition that cancels loading. Specify that transition before implementing the controller; otherwise the unit test exercises an API the UI cannot reach and the browser test cannot be written honestly.

### Pure controller boundary

Task 1 makes `src/app.js` a browser entry point with immediate `document.querySelector` access. Task 5 then turns the same file into a Node-imported pure controller module. Separate these responsibilities before the first controller test so the red test fails for behavior, not because the test environment crashes during module evaluation.

### Immutable attempt context

The source brief explicitly allows controls to diverge from displayed evidence until the next fetch. Therefore the rendered attempt must own its scenario as well as its signal/raw payload. Location and units are recoverable from `WeatherSignal`; scenario intentionally is not, so omitting it makes old advisory identity unrecoverable.

### Time and DST contract

An IANA timezone plus one integer offset does not identify the offset of every timestamp across a DST transition. Repeated fall-back wall times also cannot satisfy a strict ordering check without an instant. The contract needs a serialization and comparison rule before fixture generation and mapper tests can have one correct answer.

### Geocoding boundary

The plan treats successful JSON parsing as sufficient geocoding validation. A syntactically valid response such as `{ "results": {} }` throws a generic `TypeError`; an entry with `null` coordinates can be selected and passed to the forecast URL. Geocoding needs its own small atomic boundary before options are rendered.

### Renderer failure state

The state contract promises a retry UI when rendering fails, but the only proposed catch surrounds fetch/mapping/fallback construction. Rendering an error state with the same failed renderer also risks recursion. Either design a minimal independent emergency path or narrow FR-10 to construction failures.

### Browser hard reset

Creating fresh JavaScript state does not force existing DOM controls back to defaults. The bootstrap renderer must own query text, radio checked state, listbox state, active view, and disclosure state so browser form restoration cannot contradict the application state.

## Questions

1. What user action should supersede an in-flight forecast if duplicate Fetch submissions remain disabled?
2. Must an advisory remain tied to the scenario used for its fetch, or should changing scenario intentionally recompute advice without fetching weather?
3. Should offset-bearing timestamps become the canonical contract representation, or should the contract carry separate instant and local-label fields?
4. Are malformed geocoding entries rejected individually or does one malformed entry reject the entire result set?
5. Is renderer failure genuinely recoverable, or should it be treated as an uncaught application defect outside the state machine?

## Verdict

Implementation should not start from the plan as written. Tasks 1-2 can be prototyped, but the state ownership, time contract, reset semantics, and failure boundary must be revised before the corresponding tests are authored; otherwise the test suite will encode mutually incompatible behavior.

## Recommended Order

1. Resolve forecast supersession and immutable attempt context; update the state/outcome interfaces and browser scenarios.
2. Define timestamp serialization, DST ordering, metadata offset semantics, and exact unit schemas.
3. Split the pure controller from browser bootstrap and define the render-failure boundary.
4. Add geocoding validation and explicit DOM reset synchronization.
5. Canonicalize the fallback recipe and copy, then update acceptance tests and the review matrix.
