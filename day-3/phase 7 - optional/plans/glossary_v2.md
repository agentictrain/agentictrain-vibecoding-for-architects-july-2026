# Weather Workshop PoC Glossary v2

Use these terms exactly in the brief, UI, code, tests, and review. Avoid the listed misleading alternatives.

## Core terms

### Active attempt

The latest non-superseded Fetch weather operation. Only the active attempt may update Region 2.

Avoid: current request, when “current” could mean weather time.

### Advisory

A deterministic, locally derived, scenario-specific workshop message produced from a valid `WeatherSignal` using facilitator-approved rules. It is not evidence, a forecast, approval, or operational guidance.

Avoid: recommendation, decision, instruction, alert, approval.

### Bounded contract

A named object whose required fields, nesting, units, cardinalities, provenance, and failure behavior are explicit. A value either satisfies the complete contract or is not a `WeatherSignal`.

Avoid: cleaned JSON, best-effort result, weather blob.

### Display context

Information retained to orient the user but not asserted as the source of displayed values. In fallback, the selected real place is display context only.

Avoid: fallback location weather, weather for this place.

### Evidence

Values presented with enough provenance to distinguish a validated live Open-Meteo response from a fictional workshop fixture. Advisory text is not evidence.

Avoid: truth, fact, authoritative weather.

### Evidence mode

The required provenance discriminator on `WeatherSignal`: `live` or `fictional-fallback`.

Avoid: type, status, source, when the specific distinction is live versus fictional.

### Failed live response

An exact payload received from Open-Meteo that could not be mapped because parsing or contract validation failed. It may be inspected as raw failure evidence but is not a live `WeatherSignal`.

Avoid: partial success, usable response.

### Fallback

The visible failure state entered automatically after a non-abort forecast failure. It contains a fictional, deterministic, versioned `WeatherSignal`, the live failure context, and Retry. It is never a successful live response.

Avoid: cached weather, backup weather, sample success, offline weather.

### Fictional

Invented solely for the workshop and not descriptive of actual weather, warehouse conditions, delivery conditions, customers, suppliers, or internal operations.

Avoid: synthetic live data, representative actuals, realistic data when that could imply observed truth.

### Fixture

The local, versioned recipe and fixed value sequence used to construct fallback evidence. `weather-fallback-v1` shifts timestamps from a supplied local-time anchor but does not randomize values.

Avoid: mock API response, because the Raw response view must not claim the fixture came from Open-Meteo.

### Hard reset

The reload behavior that returns the app to empty defaults and restores no prior query, controls, evidence, advisory, status, or view state.

Avoid: refresh, when it could mean fetching new weather.

### Live

Evidence from the active, successful Open-Meteo forecast response that passed complete contract validation in this page lifetime.

Live does not mean guaranteed accurate, provider-certified, continuously updating, or persisted.

Avoid: real-time, authoritative, verified weather.

### Location query

The user's free text sent to geocoding. It is not a selected location and cannot be used directly for a forecast fetch.

Avoid: location, until a result is selected.

### Mapped object

The inspectable serialized `WeatherSignal` produced by validation and mapping. It is distinct from the raw response and readable weather view.

Avoid: raw data, API response.

### Operational scenario

One of two fictional contexts, `warehouse-planning` or `delivery-planning`, used only to select facilitator-approved advisory rules.

Avoid: warehouse, route, shipment, or plan without the fictional qualifier in user-facing explanatory copy.

### Open-Meteo

The only remote provider used for public geocoding and forecast data in this phase. Open-Meteo does not provide fallback values or workshop advisory text.

Avoid: our API, weather authority.

### Produced at

The client-generated instant when the mapped or fallback `WeatherSignal` was constructed. It is not an Open-Meteo observation, publication, or receipt timestamp.

Avoid: observed at, updated by provider.

### Provenance

The information needed to explain where displayed values came from, how they were transformed, when the representation was produced, which location/timezone contextualizes it, and whether it is live or fictional.

Provenance is not merely a provider name or URL.

### Raw response

The exact JSON forecast payload received for the active attempt, displayed as inert text. When no payload was received, there is no raw response. A fixture must never be presented as one.

Avoid: source of truth, unmodified truth.

### Readable weather

The human-oriented rendering of a valid `WeatherSignal`. It does not change the signal's evidence mode or provenance.

Avoid: live card when fallback is displayed.

### Retry

A new explicit Fetch weather attempt using the currently selected controls. It does not resume the failed request or reuse its evidence.

Avoid: continue, reconnect.

### Selected location

A specific Open-Meteo geocoding result containing a name, country, coordinates, and available administrative context. It is the coordinate source for forecast requests.

Avoid: typed location, first match.

### Source kind

The machine-readable origin discriminator: `open-meteo` or `workshop-fixture`. It complements, but does not replace, evidence mode.

Avoid: provider when referring to the local fixture.

### Success

The state in which the active Open-Meteo response passed complete validation and emitted a live `WeatherSignal`. Fallback is not a kind of success.

Avoid: completed, if the attempt completed with fallback or error.

### Superseded request

An older geocoding or forecast request made irrelevant by newer user intent. It is aborted or ignored and cannot change UI state, announce an error, or trigger fallback.

Avoid: failed request.

### Unit system

The bounded user choice `metric` or `imperial`, sent explicitly to Open-Meteo and recorded in `WeatherSignal`. Pressure remains hPa in both.

Avoid: locale, because unit choice is not inferred from language or browser location.

### Validation

The atomic check that the response has every required block, field, unit, finite value, aligned array, cardinality, and valid timestamp needed by `WeatherSignal`.

Avoid: sanitization, cleanup, best effort.

### WeatherSignal

The normalized weather-evidence object with `metadata`, `current`, `hourly`, and `daily`. It is complete, unit-explicit, timezone-explicit, and provenance-carrying. It never contains advisory text.

Avoid: forecast response, advisory input/output bundle.

## Time words

### Current conditions

The single current-conditions record returned by Open-Meteo or the corresponding fictional fallback record. In fallback UI, qualify it as fictional; do not imply observation.

### Next 24 hours

Exactly 24 aligned hourly entries beginning at or after the selected location's current local hour. In fallback, timestamps are generated from the fallback anchor.

### Next 7 days

Exactly seven aligned local-date entries. In fallback, dates are generated from the fallback anchor.

### Timezone

The selected location's IANA timezone and UTC offset returned by Open-Meteo and carried in metadata. It is not the browser timezone.

## Review terms

### Acceptance

The facilitator's confirmation that the PoC meets this workshop brief. It is not production approval, architecture approval, operational sign-off, or permission to reuse the advisory.

### Participant self-check

The participant's recorded manual verification of behavior, failure paths, accessibility, responsiveness, and reload behavior before facilitator review.

### Rule table

The facilitator-owned, versioned definition of advisory inputs, thresholds, precedence, output copy, unit handling, and fallback behavior. Advisory implementation is blocked until it exists.

Avoid: business rules, unless a real authorized business owner and process exist; they do not in this PoC.
