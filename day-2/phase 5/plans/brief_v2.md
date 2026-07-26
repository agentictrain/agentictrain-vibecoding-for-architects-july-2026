# Weather Workshop PoC: Sharpened Brief v2

## Status and purpose

This is a disposable, client-only workshop proof of concept. It demonstrates a narrow agent-assisted architecture workflow: search for a public location, fetch public weather evidence from Open-Meteo, validate and map that evidence into a bounded `WeatherSignal`, and render it for inspection.

It is not approved architecture, an operational tool, or a production decision. It must not contain real internal, customer, supplier, warehouse, or delivery data.

## Actors and review

- The **workshop participant** operates the PoC, implements it, and self-checks behavior, accessibility, responsiveness, and acceptance criteria.
- The **workshop facilitator** reviews scope, provenance, fallback labeling, `WeatherSignal` mapping, and the fictional advisory rules. The facilitator is the only authority allowed to supply or approve advisory thresholds.
- No operational user, approver, automated agent, customer, or supplier participates in this phase.

The PoC is complete only after both reviews pass. Passing the workshop review does not approve the design for production or operational use.

## Scope

### Region 1: context and controls

Region 1 contains:

- A debounced Open-Meteo geocoding typeahead.
- A required selected location. Typed text is not a selection.
- A required fictional scenario: `warehouse-planning` or `delivery-planning`.
- A unit-system control: `metric` or `imperial`.
- One command button: **Fetch weather**.

Location search begins after at least two trimmed characters and a short debounce. A new search cancels the previous geocoding request. Results expose enough context to disambiguate duplicate names: place name, first-level administrative area when available, and country. The user must choose a result before Fetch weather is enabled.

Changing the query after selection invalidates that selection. Changing location, scenario, or units after a successful fetch marks the controls as changed but does not relabel old evidence; the next Fetch weather clears prior evidence immediately.

### Region 2: weather evidence

Region 2 has three distinct views:

1. **Readable weather**: current conditions, the next 24 hourly points, the next 7 daily points, and the separately labeled fictional advisory.
2. **Raw response**: a collapsed-by-default, pretty-printed view of the exact forecast payload received for the active attempt. It is rendered as text, never injected as HTML.
3. **Mapped object**: a pretty-printed view of the validated `WeatherSignal` emitted from that payload or generated from the fallback fixture.

Tabs, a segmented control, or an equivalent accessible view switcher may be used. The three representations must not be merged into one ambiguous block.

### Region 3: placeholder

The page shell reserves a visible region labeled **Reserved for a future workshop phase**. It has no controls, data flow, implied recommendation, or hidden implementation.

## Data sources and requests

The only remote sources are:

- Open-Meteo Geocoding API for public location search.
- Open-Meteo Forecast API for weather evidence.

After selection, one forecast request obtains current, hourly, and daily data. It requests the selected coordinates, `timezone=auto`, seven forecast days, and explicit units matching the selected unit system.

Requested current variables:

- temperature
- apparent temperature
- relative humidity
- precipitation
- weather code
- wind speed
- wind direction
- wind gusts
- cloud cover
- surface pressure
- is day

Requested hourly variables:

- temperature
- precipitation probability
- precipitation
- weather code
- wind speed

Requested daily variables:

- temperature maximum and minimum
- precipitation sum
- precipitation probability maximum
- weather code
- wind speed maximum
- sunrise
- sunset

The hourly mapper selects the first 24 forecast timestamps at or after the selected location's current local hour. The daily mapper selects the first seven returned local dates. Array positions are joined only by matching index after length validation.

## WeatherSignal contract

`WeatherSignal` is the sole normalized weather-evidence contract. It is a plain JavaScript object with exactly four top-level sections: `metadata`, `current`, `hourly`, and `daily`.

```text
WeatherSignal
  metadata
    schemaVersion: "1.0"
    evidenceMode: "live" | "fictional-fallback"
    producedAt: ISO 8601 instant
    unitSystem: "metric" | "imperial"
    location
      geocodingId: number | null
      name: string
      admin1: string | null
      country: string
      latitude: finite number
      longitude: finite number
    timezone
      name: IANA timezone string
      utcOffsetSeconds: integer
    source
      kind: "open-meteo" | "workshop-fixture"
      fixtureId: null | "weather-fallback-v1"
      failedLiveAttempt: boolean
  current
    time, temperature, apparentTemperature, relativeHumidity,
    precipitation, weatherCode, windSpeed, windDirection, windGusts,
    cloudCover, surfacePressure, isDay, units
  hourly
    time[24], temperature[24], precipitationProbability[24],
    precipitation[24], weatherCode[24], windSpeed[24], units
  daily
    date[7], temperatureMax[7], temperatureMin[7],
    precipitationSum[7], precipitationProbabilityMax[7], weatherCode[7],
    windSpeedMax[7], sunrise[7], sunset[7], units
```

Each section owns a `units` object with one entry for every field. Time units state the timestamp convention rather than a physical unit. Codes use `WMO weather interpretation code`; `isDay` uses `boolean`.

Unit policy:

| Quantity | Metric | Imperial |
| --- | --- | --- |
| Temperature | `°C` | `°F` |
| Precipitation | `mm` | `inch` |
| Wind speed and gusts | `km/h` | `mph` |
| Pressure | `hPa` | `hPa` |
| Direction | `°` | `°` |
| Probability, humidity, cloud cover | `%` | `%` |

All forecast-facing timestamps use the selected location's Open-Meteo timezone. `producedAt` is an absolute ISO 8601 instant. The contract does not infer browser-local time.

## Validation and mapping

Mapping is atomic. Before emitting a live `WeatherSignal`, validate:

- HTTP success and JSON parsing.
- Presence of every requested block, field, and unit.
- Required strings are non-empty and required numbers are finite.
- Coordinates are within valid latitude and longitude ranges.
- `isDay` maps only from Open-Meteo `0` or `1`.
- Current data has a valid timestamp.
- Every hourly source array has equal length and yields 24 aligned entries.
- Every daily source array has equal length and yields 7 aligned entries.
- Timestamps/dates parse, are ordered, and match the declared timezone policy.

Missing fields, `null`, `NaN`, infinity, malformed timestamps, unknown required units, or misaligned arrays reject the entire live response. The mapper never emits a partial live signal, silently drops rows, fills required live values from the fixture, or treats malformed data as success.

## Provenance

**Provenance** answers where displayed values came from, how they were transformed, when the representation was produced, which place and timezone contextualize it, and whether it is live or fictional.

For live evidence, provenance includes `evidenceMode=live`, `source.kind=open-meteo`, the selected geocoding result, unit system, timezone, and client-side production time. The raw payload and mapped object remain visibly paired with the same active attempt.

For fallback evidence, provenance includes `evidenceMode=fictional-fallback`, `source.kind=workshop-fixture`, `fixtureId=weather-fallback-v1`, and `failedLiveAttempt=true`. The selected real place is retained only as display context. The interface must say that the values do not describe actual weather for that place.

The app does not claim that client timestamps are provider observation, publication, or receipt timestamps. It does not claim Open-Meteo authored the advisory or fallback values.

## States and transitions

Weather evidence has these states:

- **Empty**: no fetch has completed in this page lifetime. Region 2 prompts for valid controls without showing sample evidence.
- **Loading**: a forecast request is active. Prior evidence is cleared immediately. Fetch is protected against duplicate submission.
- **Success**: a complete, validated live response and its mapped live `WeatherSignal` are visible.
- **Fallback**: a live attempt failed and the deterministic fictional fixture is visible. A prominent error summary and Retry action remain visible with it.
- **Error with retry**: no evidence can be shown because fallback construction or rendering also failed. This is an application-defect path, not a live-data success.

An aborted request superseded by a newer request is silent: it produces no error and no fallback. The latest request owns the screen; a late response from an older request must not overwrite it.

Failure categories include geocoding network/HTTP/parse failure, no geocoding results, forecast network/HTTP/parse failure, invalid live shape, and application/fallback failure. Status copy is useful but does not expose stack traces or promise rejections.

## Fictional fallback

Fallback is automatic after any non-abort live forecast failure, including contract-validation failure. It is never entered while a valid live request is still pending and never rendered with success styling or success language.

`weather-fallback-v1` has fixed weather values and a fixed sequence. Its timestamps are generated by a deterministic rule anchored to the selected location's current local hour/date at fallback creation, keeping “next 24 hours” and “next 7 days” coherent. Given the same anchor, unit system, and fixture version, it produces the same object.

When the selected real place is shown with fallback, the page must display all of the following without requiring a panel to be opened:

- **Fictional fallback data**.
- The live fetch failed.
- These values are a workshop example and are not actual weather for the selected place.
- Retry live weather.

If a response payload was received but rejected, Raw response may show that exact rejected payload under a **Failed live response** label. If no payload was received, Raw response says so. It never manufactures an Open-Meteo response. Mapped object shows the fictional `WeatherSignal` and its provenance.

## Fictional advisory

The selected scenario generates advisory text, but the advisory is not weather evidence and is not part of `WeatherSignal`. It is a deterministic local derivation from a validated `WeatherSignal` plus the selected scenario.

The advisory must be labeled **Fictional workshop advisory — not operational guidance** and identify its rule-set version. It must not approve, schedule, stop, dispatch, reroute, escalate, or autonomously act. It may summarize considerations only.

The facilitator must provide and approve the complete rule table, including thresholds, precedence, copy, and behavior for both unit systems and fallback evidence. Until that rule table exists, advisory implementation and final acceptance are blocked. The participant and coding agent must not invent operational thresholds.

## Reload and persistence

Reload is a hard reset. Nothing survives it:

- no query or selected location
- no scenario or unit choice
- no raw response or mapped signal
- no advisory
- no status, retry context, or open view

The app uses no `localStorage`, `sessionStorage`, IndexedDB, cookies, service worker, application cache, URL-state restoration, backend persistence, or analytics. Normal browser/network caching is not presented as application persistence; each Fetch weather action initiates a live request.

## Accessibility and responsive behavior

- Every form control and view switcher has a programmatic accessible name.
- Search suggestions use an accessible combobox/listbox pattern with keyboard selection and dismissal.
- Native controls are preferred; custom widgets implement expected keyboard behavior.
- Focus is clearly visible and is not removed by CSS.
- A polite live region announces search progress/results and weather state changes; urgent failures use an appropriate alert without duplicate announcements.
- Loading state is conveyed in text, not only animation.
- Live, fallback, and advisory distinctions do not rely on color alone.
- Collapsible raw/mapped views expose expanded state and retain readable focus order.
- At widths from 320 pixels upward, content reflows without page-level horizontal scrolling. Long place names, URLs, timestamps, and JSON wrap or scroll only inside their bounded code viewer.
- Motion is nonessential and respects reduced-motion preferences.

## Explicit non-goals

- Production readiness, deployment, CDN dependencies, backend, database, authentication, analytics, or persistence.
- Real operational recommendations, approvals, integrations, customer/supplier data, or internal-system data.
- Offline live weather, background refresh, polling, push alerts, saved places, history, maps, or location permission.
- Silent recovery that disguises a failed live request.
- Expanding Region 3 beyond its label.

## Acceptance criteria

1. A keyboard user can search, distinguish duplicate places, select one, choose a scenario and units, and fetch weather without a pointer.
2. Fetch weather makes one forecast request for current, hourly, and daily variables.
3. A valid response produces exactly 1 current record, 24 aligned hourly records, and 7 aligned daily records in `WeatherSignal`.
4. Raw, mapped, and readable views are distinct and describe the same active attempt.
5. Metric and imperial fetches display and map the requested units; pressure remains hPa.
6. A malformed required field rejects the entire live signal and enters visibly labeled fallback.
7. A network or HTTP failure shows fictional fallback, the failure context, and Retry; it never shows a live-success state.
8. A superseded request cannot overwrite newer results and does not trigger fallback.
9. A refetch clears old evidence while loading.
10. Reload returns to empty defaults with no restored state.
11. The advisory is separate from `WeatherSignal`, visibly fictional/non-operational, deterministic, versioned, and based only on facilitator-approved rules.
12. At 320 CSS pixels, no page-level horizontal scrollbar appears.
13. Status changes are announced, controls are named, and focus remains visible.
14. Region 3 remains a labeled placeholder with no behavior.

## Review evidence

The participant records a short manual check matrix covering keyboard-only use, 320-pixel layout, live success, no results, network failure, malformed payload, retry, request race, unit switching, fallback labels, and reload reset. The facilitator reviews that matrix together with the three rendered evidence views, the contract shape, fixture provenance, and advisory rule table.
