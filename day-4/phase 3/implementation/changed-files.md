# Changed files

- `app/index.html`: Replaced the starter shell with the full weather workshop layout, search results region, evidence mount point, and reserved Region 3 messaging. Wrapped each region's scrollable content in a `.panel__body` div so the region heading stays visible while the body scrolls.
- `app/styles.css`: Rebuilt the visual system, responsive panel layout, evidence cards, JSON viewers, and fallback/live state styling. Shrunk the masthead (smaller h1, lede, status pill, notice card, padding). Made the three workspace panels equal height at desktop widths with a capped max-height and inner-scrolling `.panel__body`; narrow widths keep natural stacked flow.
- `app/app.js`: Added app state, geocoding search, location selection, forecast orchestration, retry handling, rendering, and explicit fallback loading. Gave each search result button an explicit `aria-label` and hid its timezone span from the accessible name. Re-fetch live weather when the unit system changes while a live success is on screen. Fallback banner now shows all four FR-10 items (including "The live fetch failed" and "Retry live weather") on every fallback view, with a Retry button on the fallback state. Error state now preserves the rejected payload and renders a "Failed live response" or "No response payload was received" raw view. Region 2 redesigned: current conditions is a hero card (icon + big temp + 4 priority chips + details toggle), hourly is paginated 8/page with All/Day/Night filter, Time/Temp↓/Temp↑/Rain↓ sort, a temperature sparkline, and minimal icon cards, daily is a compact strip with per-card expandable details, and the raw/mapped viewers are merged into a tabbed switcher (Readable/Raw/Mapped). Added evidence state (hourlyPage, hourlyFilter, hourlySort, dayExpanded, activeTab) reset on every fetch/fallback/reload.
- `app/weather-signal.js`: Added the pure WeatherSignal validator/mapper and deterministic fictional fallback factory. Added `mp/h` to the wind unit allowlists (current, hourly, daily max, gusts) so Open-Meteo's imperial responses map correctly.
- `tests/weather-signal.test.mjs`: Added narrow automated tests for live mapping validation and fallback determinism.
- `app/INDEX.md`: Updated the app index to document the implemented browser files.
- `INDEX.md`: Updated the workspace index to include the app, tests, and implementation records.
- `implementation/INDEX.md`: Updated the implementation folder description for this checkpoint.
- `implementation/decisions.md`: Recorded the unit-system re-fetch decision and the search-result accessible-name fix.
- `implementation/verify.md`: Re-ran browser checks and corrected the record to match actual behavior, including the unit-system re-fetch and the fixed search-result accessible name.

## 2026-07-23 model settings modal

- `app/index.html`: Added the Region 1 Model settings launcher and an accessible modal with labeled endpoint, model name, and masked temporary credential fields plus Save, Cancel, and Clear controls.
- `app/app.js`: Added page-memory-only model settings state, modal event handling, focus entry and restoration, Tab wrapping, Escape and backdrop dismissal, Save, Cancel, and Clear behavior. No model request or persistence was added.
- `app/styles.css`: Added responsive modal, backdrop, launcher, and action layout styles using the existing visual tokens and focus treatment.
- `implementation/changed-files.md`: Recorded the model settings files and scope.
- `implementation/decisions.md`: Recorded approved defaults, Clear behavior, and the native-dialog implementation choice.
- `implementation/verify.md`: Recorded syntax, regression, accessibility, privacy, network, and responsive browser checks.

## 2026-07-23 weather-grounded review

- `app/review.js`: Added the exact ollama cloud chat-completions request, JSON mode, five-field parser, strict field/cardinality validation, and WeatherSignal evidence-path validation.
- `app/app.js`: Added review state, readiness rules, generation, cancellation and stale-response protection, accessible rendering, and input-change invalidation without mutating weather evidence on model failure.
- `app/index.html`: Loaded `review.js` in classic-script order and replaced the future-phase placeholder with the advisory warning, Generate review action, and review live region.
- `app/styles.css`: Added review action, result-list, evidence-path, loading, and error presentation using the existing responsive visual system.
- `tests/review.test.mjs`: Added transport, parsing, validation, evidence-path, HTTP, network, and credential-redaction tests.
- `app/INDEX.md`: Documented `review.js`, its purpose, and load order.
- `implementation/decisions.md`: Recorded the approved helper split and stale-review lifecycle.
- `implementation/verify.md`: Recorded automated and intercepted browser checks for this review slice.

## 2026-07-23 free-tier provider migration

- `TECH.md`: Replaced the unusable Ollama Cloud constraint with Groq Free tier and made the model configurable without a client-side allowlist.
- `implementation/GroqAPI.md`: Replaced the Ollama reference with the browser-compatible Groq contract and documented current Free tier limits.
- `app/app.js`, `app/index.html`, and `app/review.js`: Changed defaults and provider-facing text to Groq while preserving the request and strict validation behavior.
- `tests/review.test.mjs`: Updated the exact endpoint assertion to Groq.
- `INDEX.md`, `app/INDEX.md`, and `implementation/decisions.md`: Updated navigation and recorded the provider choice and browser-key risk.