# Implementation decisions

## 2026-07-22

- Decision: Keep the app in one controller file plus one pure `weather-signal.js` boundary file.
  Reason: The PoC stays double-clickable and the mapping logic gets a narrow automated test surface.
  Alternatives considered: Put everything in one large `app.js`; split into multiple `app/js/*` files.
  Expected impact: Simpler browser boot path with isolated contract validation.
  Human approval still needed: No.

- Decision: Require explicit fictional fallback loading instead of automatic fallback after live failure.
  Reason: The user explicitly asked to never load fallback automatically after a live failure.
  Alternatives considered: Automatic fallback after forecast failure.
  Expected impact: Stronger distinction between failed live weather and fictional workshop data.
  Human approval still needed: No.

- Decision: Use an induced one-shot forecast failure in browser verification to prove the retry path.
  Reason: It verifies the error state and no-auto-fallback rule without changing app code.
  Alternatives considered: Skip failure verification; add a debug control.
  Expected impact: Better evidence that retry behavior works with current controls.
  Human approval still needed: No.

## 2026-07-23

- Decision: Re-fetch live weather when the unit system changes while a live success is on screen.
  Reason: The stored WeatherSignal keeps the units from the original fetch, so an in-place render after a unit toggle was a visible no-op and violated FR-3 (inspect bounded presentation variants). Re-fetching keeps the provider response as the single source of truth and updates readable, raw, and mapped views together.
  Alternatives considered: Convert units in the render layer; ignore the change when evidence is already loaded.
  Expected impact: A unit toggle with live evidence on screen costs one extra Open-Meteo request; fallback/error states re-render in place without a fetch.
  Human approval still needed: No.

- Decision: Hide the timezone `<span>` in each search result button from the accessible name and set an explicit `aria-label` on the button.
  Reason: Without it the button accessible name concatenated as "Arlington, Texas, United States America/Chicago", which is not the FR-2 result label ("name, available first-level administrative area, and country").
  Alternatives considered: Remove the timezone from the visible result entirely; separate the spans with punctuation and rely on the natural name.
  Expected impact: Screen readers now announce only "Name, Admin1, Country"; the timezone stays visible for sighted users.
  Human approval still needed: No.

- Decision: Add `mp/h` to the wind unit allowlists in `weather-signal.js` (current, hourly, daily max, gusts).
  Reason: Open-Meteo's forecast API returns `mp/h` (not `mph`) as the `wind_speed_unit=mph` response unit string. The mapper only accepted `mph`, so every imperial live response was rejected as "response.current_units.wind_speed_10m is invalid". This was a latent bug that the unit-system re-fetch fix exposed.
  Alternatives considered: Normalize `mp/h` to `mph` before validation; request `wind_speed_unit=kn` only.
  Expected impact: Imperial live responses now map successfully and display wind values with the provider's `mp/h` unit string.
  Human approval still needed: No.

- Decision: Show all four FR-10 fallback-copy items on every fallback view, including the voluntary "Load fictional fallback" path, and add a Retry button to the fallback state.
  Reason: The human chose the strict literal reading of FR-10: every fallback view states "Fictional fallback data", "The live fetch failed", "workshop example / not actual weather for the selected place", and "Retry live weather" — even when the fallback was loaded voluntarily without a live failure.
  Alternatives considered: Keep the voluntary path distinct (omit "live fetch failed" and Retry when no failure happened); remove the voluntary button entirely.
  Expected impact: The fallback banner is uniform across voluntary and after-failure paths; a Retry button appears under the mapped view whenever fallback is showing. The copy is slightly misleading on the voluntary path (says "live fetch failed" when none was attempted), per the human's explicit choice.
  Human approval still needed: Yes — recorded as human-approved interpretation.

- Decision: Preserve the rejected live payload and show it in the error state as a "Failed live response" raw view, or show "No response payload was received" when the failure was network/HTTP.
  Reason: FR-10 requires the raw view to distinguish a received-but-rejected payload from no payload at all. Previously the error state discarded the payload and showed neither message.
  Alternatives considered: Keep the error state as a single message; always show the error message text as the raw view.
  Expected impact: The error state now includes a collapsible "Raw response" details block. A new `failedRawResponse` field on the weather state carries the rejected payload through to the error renderer. This resolves the pre-existing "remaining risk" about rejected payloads.
  Human approval still needed: No.

- Decision: Make the three workspace panels equal height at desktop widths, with each panel's heading pinned outside an inner-scrolling `.panel__body`.
  Reason: The human asked for equal-height regions where the taller one inner-scrolls while its title stays visible. A flex-column panel with a fixed header and a `min-height:0; overflow-y:auto` body achieves this without JS scroll logic.
  Alternatives considered: CSS grid `align-items: start` (previous, unequal heights); sticky heading inside the scroll body (fragile with flex).
  Expected impact: At >=60rem all three panels share one height (capped at `calc(100vh - 9rem)`); their bodies scroll independently; headings stay visible. At <60rem panels stack with natural height and the page scrolls normally.
  Human approval still needed: No.

- Decision: Shrink the masthead.
  Reason: The human asked to make the top header smaller. The previous h1 (clamp up to 4.5rem) and large paddings dominated the viewport and pushed the workspace below the fold.
  Alternatives considered: Keep the large header; hide the notice card on narrow widths.
  Expected impact: The masthead height dropped from ~450px to ~270px at 1280px wide. h1, lede, status pill, notice card, and padding all reduced. No content removed.
  Human approval still needed: No.

- Decision: Redesign Region 2 as a weather-app-style interface with paginated/filtered/sorted hourly, compact expandable daily, a hero current card, and a tabbed raw/mapped viewer.
  Reason: The human asked to make Region 2 look more like a weather app, limit elements per card, and add pagination, filters, and sorting.
  Alternatives considered: Keep the all-at-once text-heavy cards; add a separate charting library (blocked by TECH.md no-dependencies rule).
  Expected impact: Current card shows an icon, big temp, and 4 priority chips, with the remaining 5 fields behind a details toggle. Hourly shows 8 cards per page with All/Day/Night filter, Time/Temp↓/Temp↑/Rain↓ sort, and a per-page temperature sparkline (inline SVG, no dependency). Daily cards are compact with per-card expandable details. The raw and mapped viewers are merged into a 3-tab switcher (Readable/Raw/Mapped) with proper tab semantics. New evidence state is in-memory only and resets on every fetch/fallback/reload (no localStorage, per TECH.md).
  Human approval still needed: No.

- Decision: Keep filter/sort/evidence preferences in memory only, not localStorage.
  Reason: TECH.md forbids localStorage without explicit human approval and FR-15 requires reload to be a hard reset.
  Alternatives considered: Ask for localStorage approval; save preferences per location.
  Expected impact: Filter, sort, page, expanded-day, and active-tab state all clear on reload. This matches the hard-reset rule and the disposable PoC scope.
  Human approval still needed: No.

- Decision: Initialize model settings with `https://api.groq.com/openai`, `openai/gpt-oss-20b`, and a blank temporary credential.
  Reason: The human explicitly selected the prefilled endpoint and model option; the credential must always start blank. Updated from ollama cloud to Groq after ollama cloud CORS blocked browser requests.
  Alternatives considered: Leave the endpoint blank; leave all three fields blank.
  Expected impact: The later model-call phase receives settings with the field names and defaults expected by `GroqAPI.md`, while reload always clears the credential.
  Human approval still needed: No — explicitly approved by the human.

- Decision: Clear all three saved in-memory model settings while keeping the modal open and returning focus to the endpoint field.
  Reason: The human explicitly selected this Clear behavior so replacement values can be entered immediately.
  Alternatives considered: Clear settings and close the modal.
  Expected impact: Clear is immediately visible and keyboard users remain in a predictable editing position.
  Human approval still needed: No — explicitly approved by the human.

- Decision: Use a native `<dialog>` with explicit dialog ARIA and application-managed focus wrapping and restoration.
  Reason: It provides top-layer modal behavior while the explicit handlers make Tab wrapping, Escape, backdrop dismissal, and opener focus restoration consistent in the workshop browser.
  Alternatives considered: Build a custom fixed-position modal; rely entirely on native dialog focus behavior.
  Expected impact: The modal has no dependency, stays compatible with the double-clickable app, and exposes a named modal dialog to assistive technology.
  Human approval still needed: No.