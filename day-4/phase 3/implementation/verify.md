# Verification

## Automated checks

- `node --check app/app.js`
  Result: Passed.

- `node --check app/weather-signal.js`
  Result: Passed.

- `node --test tests/weather-signal.test.mjs`
  Result: Passed 7 of 7 tests after fixing the test fixture's hourly timestamp ordering.

## Browser checks

- Opened `app/index.html` directly from `file://` in the integrated browser.
  Result: Shell rendered correctly.

- Typed `Arlington` in the location search.
  Result: Five Open-Meteo geocoding results appeared from the file-opened page.

- Inspected the accessible name of each search result button.
  Result: Each button exposes only "Name, Admin1, Country" as its accessible name. The timezone span is present visually but marked `aria-hidden` so it no longer leaks into the button name.

- Selected `Arlington, Virginia, United States`.
  Result: Selected-location summary updated and Fetch weather became enabled.

- Clicked `Load fictional fallback`.
  Result: Fictional fallback banner, readable weather, provenance, hourly cards, daily cards, and no raw provider payload appeared.

- Clicked `Fetch weather` with the selected location.
  Result: Live weather loaded from Open-Meteo with readable, raw, and mapped evidence.

- With live weather on screen, switched Unit system from Metric to Imperial.
  Result: A new live fetch started automatically using imperial request params; the readable values, raw response, and mapped WeatherSignal all updated to imperial units (temperature in °F, wind in mp/h, precipitation in inch). Switching back to Metric restored the metric values.

- Verified the mapper accepts `mp/h` as a valid wind unit.
  Reason: Open-Meteo returns `mp/h` (not `mph`) for `wind_speed_unit=mph`; before the fix, every imperial live response was rejected with `response.current_units.wind_speed_10m is invalid`.

- Switched Unit system back to Metric with no selected location (after reload).
  Result: No fetch was triggered; only the select value updated.

- Induced one forecast request failure in the browser, then used `Retry live weather`.
  Result: Error state appeared without automatic fallback; retry recovered to the live success state.

- Verified the error-state raw view distinguishes the two FR-10 cases.
  Result: With a network-blocked fetch (no payload), the error state's "Raw response" details showed "No response payload was received." With a received-but-invalid payload (mapping rejection), it showed "Failed live response. The payload was received but rejected by mapping." followed by the rejected JSON.

- Verified the voluntary "Load fictional fallback" path now shows all four FR-10 items.
  Result: The fallback banner read "Fictional fallback data" + "The live fetch failed. The values are a workshop example and are not actual weather for the selected place. Use Retry live weather to start a new active attempt." A Retry button appeared under the mapped view.

- Checked the page at `320px` wide and then reloaded.
  Result: No horizontal overflow; raw and mapped viewers were collapsed by default before reload; reload returned the app to the empty hard-reset state. At narrow widths the three panels stack with natural height and the page scrolls (no inner panel scroll).

- Checked the three workspace panels at 1280x900.
  Result: All three panels share one height (754px). The evidence panel body scrolls internally (7253px content in a 612px body) while the "Weather evidence" heading stays visible at the top. The controls panel body also scrolls when search results expand. The review panel fits without scrolling.

- Checked the masthead size at 1280x900.
  Result: Masthead height is ~271px (down from ~450px). h1 is 38.4px, lede and status pill are reduced. The notice card is smaller. No content removed.

- Region 2 redesign checks at 1280x900 with live weather loaded:
  - Current conditions: hero card with ☀️ icon, 27.6 °C, 4 priority chips (weather, feels-like, wind, precipitation), and a "More current fields" details toggle for gusts/humidity/cloud-cover/pressure/day-night.
  - Hourly: 8 cards per page (24 total → 3 pages), each card shows hour + icon + temp + rain chance. "Next ›" moved to page 2; "‹ Prev" returned to page 1. All/Day/Night filter: Night showed 10 hours across 2 pages. Sort by Temp ↓ ordered the visible page descending (25.5, 24.3, 23.3...). A temperature sparkline rendered for each page.
  - Daily: 7 compact cards (weekday + icon + max/min + rain chance). Tapping the first card expanded it to show weather label, precipitation sum, max wind, sunrise, sunset; tapping again collapsed it.
  - Raw/Mapped viewer: 3-tab switcher (Readable/Raw/Mapped) with role=tab and aria-selected. Raw tab showed the Open-Meteo JSON payload; Mapped tab showed the WeatherSignal object.

- Region 2 fallback checks: loaded the fictional fallback and confirmed the hero, paginated hourly, daily strip, and tabbed viewer all render with fallback data. The fallback banner and Retry button are present.

- Region 2 error checks: with a network-blocked fetch, the error state rendered "Live weather failed" + "No response payload was received." + Retry, unchanged by the redesign.

## Remaining risks

- Search keyboard behavior uses native buttons in a results list rather than a fully custom arrow-key listbox implementation. ArrowDown on the input does not move focus into the results, and the results list lacks listbox/option ARIA roles. FR-13 calls for the combobox/listbox keyboard pattern.
- Unit-system changes re-fetch from the provider rather than converting in place. This keeps one source of truth but consumes another network request on each switch.
- The voluntary "Load fictional fallback" banner says "The live fetch failed" even when no live fetch was attempted, per the human-approved strict literal reading of FR-10.

## 2026-07-23 model settings modal checks

### Automated checks

- `node --check app/app.js`
  Result: Passed after the initial implementation and after both focused Escape-handling repairs.

- `node --test tests/weather-signal.test.mjs`
  Result: Passed 7 of 7 existing WeatherSignal tests.

- Editor diagnostics for `app/index.html`, `app/app.js`, and `app/styles.css`
  Result: No errors found.

### Browser checks

- Opened `app/index.html` directly from `file://` in the integrated browser.
  Result: The weather app and Region 1 Model settings launcher rendered with no console errors.

- Opened Model settings and inspected its accessibility tree.
  Result: It is announced as a dialog named "Model settings" and exposes `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="model-settings-heading"`. All three inputs have visible labels.

- Checked initial values and browser form restoration.
  Result: Endpoint is exactly `https://ollama.com`, model is exactly `glm-5.2`, and the credential is blank. The form suppresses browser restoration, and application state is reapplied when the modal opens.

- Checked keyboard behavior.
  Result: Focus enters the endpoint field. Tab from Save wraps to the endpoint; Shift+Tab from the endpoint wraps to Save. Escape closes and returns focus to the Model settings launcher.

- Checked Save, Cancel, backdrop, and Clear behavior.
  Result: Save commits settings to page memory, closes, and restores opener focus. Cancel discards unsaved edits, closes, and restores focus. A click outside the dialog closes and restores focus. Clear wipes all three saved values, keeps the modal open, and focuses the endpoint.

- Reloaded after saving a disposable placeholder credential.
  Result: Endpoint and model returned to their approved defaults and the credential was blank.

- Inspected browser storage, URL, requests, and console during the complete settings flow.
  Result: `localStorage`, `sessionStorage`, cookies, and IndexedDB remained empty; the URL contained no settings; all observed requests were local file loads; no `/v1/chat/completions` request occurred; no console error occurred. No credential was logged or captured in a screenshot.

- Loaded the fictional fallback after exercising the modal.
  Result: Existing weather fallback still rendered `Workshop Harbor, Fictional Coast` and its evidence interface.

- Checked the open modal at 390x844 and captured it with the credential blank.
  Result: The dialog and every control remained inside the viewport, all controls had positive dimensions, the page had no horizontal overflow, vertical dialog scrolling remained available, focus was visible, and no content overlapped or clipped.

### Remaining risks

- Live Open-Meteo search and forecast behavior was not re-exercised in this modal-only pass; the existing WeatherSignal tests passed and the fictional fallback browser flow remained intact.
- No model call was tested because model requests are intentionally out of scope for this phase.

## 2026-07-23 weather-grounded review checks

### Automated checks

- `node --check app/review.js` and `node --check app/app.js`
  Result: Passed.

- `node --test tests/review.test.mjs tests/weather-signal.test.mjs`
  Result: Passed 14 of 14 tests: 7 review transport/validation tests and 7 existing WeatherSignal regression tests.

- Editor diagnostics for `app/index.html`, `app/styles.css`, `app/review.js`, and `app/app.js`
  Result: No errors found.

### Browser checks

- Opened `app/index.html` directly from `file://`.
  Result: All three regions rendered. Generate review was disabled with a readiness message until weather, scenario, endpoint, model, and temporary credential were present.

- Loaded fictional fallback weather, selected each fictional scenario, and saved runtime-only model settings.
  Result: Generate review became enabled. The temporary credential stayed masked and in page memory.

- Intercepted the ollama request with a valid strict-JSON response.
  Result: The request used exactly `https://ollama.com/v1/chat/completions`, a Bearer authorization header, model `glm-5.2`, `stream: false`, JSON-object response mode, and a user message containing only `signal` and `scenario`. Summary, risks, actions, questions, and evidence rendered as plain text.

- Intercepted a second response with malformed review JSON.
  Result: Region 3 showed a clear validation error. The complete Region 2 fictional weather evidence remained visible and unchanged.

- Checked 1280x900 and 390x844 layouts.
  Result: No horizontal overflow. Region 3 fit its panel and stacked naturally at narrow width without overlap.

- Used keyboard Tab traversal at narrow width.
  Result: Generate review was reachable and displayed the existing solid 2px visible-focus outline.

### Remaining risks

- Browser transport was verified with an intercepted ollama response, not a live disposable credential. Facilitator CORS configuration and live model behavior still require an approved runtime credential.
- Summary sentence counting uses terminal punctuation boundaries and treats non-punctuated text as one sentence. The strict 1–3 bound is enforced, but natural-language sentence boundaries remain intentionally lightweight for this plain-JavaScript PoC.
- Repository-root `npm run verify` still fails on pre-existing broken Markdown links in `course/day-3/final/implementation/rubber-duck-findings.md`. The phase 3 credential-scanner finding caused by the original test fixture was resolved; the rerun reported no Day 4 phase 3 failures.

### Model field follow-up

- Removed the client-side `glm-5.2` equality gate and all model-field readiness validation at the human's direction.
- Updated the transport test to use `facilitator-model` and verify that the configured model value is forwarded unchanged.
- Reloaded the `file://` app, saved the model field as empty with weather, scenario, endpoint, and credential ready, then reopened settings.
  Result: The saved model remained empty, Generate review remained enabled, and Region 3 reported that the request was ready. Model validity is left to ollama cloud.

### Live endpoint diagnosis

- Sent a credential-free CORS preflight to `https://ollama.com/v1/chat/completions` with `Origin: null`, method `POST`, and requested headers `authorization,content-type`.
  Result: The endpoint returned HTTP 405 and no CORS allow headers. The browser blocks the request before POST, so live model verification is blocked pending a facilitator-supplied CORS-enabled base URL. See `debug-notes.md`.

## 2026-07-23 Groq Free tier migration

- Sent credential-free CORS preflights to `https://api.groq.com/openai/v1/chat/completions` from `Origin: null` and `http://localhost:8000`.
  Result: Both returned HTTP 204 with `Access-Control-Allow-Origin: *`, allowed `POST`, and allowed `authorization,content-type`.
- Checked current official Groq documentation for billing, limits, models, and structured outputs.
  Result: Groq documents a Free tier and free API keys; payment details are required only to upgrade to Developer tier. `openai/gpt-oss-20b` is a production model that supports structured output and JSON Object Mode, with published Free tier limits of 30 requests per minute and 1,000 requests per day on the check date.
- Ran `node --test "course/day-4/phase 3/tests/review.test.mjs"` after changing the endpoint.
  Result: 7/7 tests passed. The exact Groq URL, bearer transport, configured-model forwarding, strict contract validation, evidence-path checks, failure handling, and credential redaction remain covered.
- Ran both phase test files together and checked editor diagnostics for the checkpoint.
  Result: 14/14 tests passed and no diagnostics were reported.
- Reloaded the shared `file://` app and opened Model settings without entering a credential.
  Result: The UI names Groq, the endpoint is `https://api.groq.com/openai`, the replaceable default model is `openai/gpt-oss-20b`, the credential is blank, and no console errors were captured.
- Set the shared browser viewport to 390x844 with Model settings open.
  Result: The dialog and all inputs and actions fit inside the viewport with no horizontal overflow.
- Ran repository-root `npm run verify`.
  Result: It still fails only on the pre-existing broken links in `course/day-3/final/implementation/rubber-duck-findings.md`; no Day 4 phase 3 failure was reported.

## 2026-07-23 Groq response-envelope regression

- Validated the supplied Groq response with `message.content`, sibling `message.reasoning`, usage metadata, and `x_groq` metadata against the application transport and strict validator.
  Result: The content passes with the three current-condition evidence paths. Provider reasoning and metadata are ignored as intended.
- Added a regression test for the observed envelope and changed invalid evidence diagnostics to report the one-based item position without reflecting model-controlled path text.
  Result: The focused review suite passes 8/8 tests.
- Reloaded the shared `file://` app and intercepted the Groq request with the observed response shape, including sibling reasoning metadata and evidence paths for current temperature, wind speed, and cloud cover.
  Result: Region 3 rendered the review summary, no `Review unavailable` state appeared, and the fictional weather evidence remained visible.