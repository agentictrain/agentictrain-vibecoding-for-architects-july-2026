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
  Result: Endpoint is exactly `https://api.groq.com/openai`, model is exactly `openai/gpt-oss-20b`, and the credential is blank. The form suppresses browser restoration, and application state is reapplied when the modal opens.

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