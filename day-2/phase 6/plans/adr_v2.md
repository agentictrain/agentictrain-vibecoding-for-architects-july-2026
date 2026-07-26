# ADR v2: Client-only weather evidence boundary

- **Status:** Accepted for the workshop PoC; advisory rule table pending
- **Date:** 2026-07-21
- **Scope:** Weather app only, Regions 1 and 2 plus Region 3 placeholder
- **Decision owners:** Workshop participant and workshop facilitator

## Context

The exercise needs to demonstrate fetching public weather data and mapping it into a bounded contract without implying production approval or operational authority. The largest risks are semantic rather than infrastructural:

- fictional fallback may be mistaken for successful live weather;
- a selected real place may be mistaken for the source of fictional values;
- raw provider data, normalized evidence, and locally derived advisory text may be conflated;
- stale evidence may remain visible under changed controls or after reload;
- partial or malformed API data may leak through as a valid contract;
- scenario language may imply real warehouse or delivery authority.

## Decision

### 1. Keep the PoC stateless and client-only

The browser calls only Open-Meteo geocoding and forecast APIs. No application state survives reload, and no storage, backend, authentication, analytics, service worker, or deployment concern is introduced.

**Why:** Persistence would require stale-data semantics, retention rules, and provenance for restored evidence. Those concerns do not teach the intended mapping boundary in this phase.

### 2. Require explicit location selection

Geocoding is a cancellable, debounced typeahead. The user must select a disambiguated result; the app never silently chooses the first match from free text.

**Why:** Place names are not unique, and coordinates are the actual forecast input. Selection makes the location boundary reviewable.

### 3. Fetch all weather evidence in one request

One forecast request supplies current, hourly, and daily fields with `timezone=auto`, seven forecast days, and explicit metric or imperial request units.

**Why:** One payload gives the three mapped sections a shared request context and avoids mixed-age responses. User-selectable units remain bounded to two named systems.

### 4. Use an atomic, provenance-carrying WeatherSignal

`WeatherSignal` contains top-level `metadata` plus `current`, `hourly`, and `daily`. Metadata records schema version, evidence mode, production time, unit system, selected location, timezone, and source kind.

Every required field, unit, timestamp, and aligned array is validated before emission. Invalid required data rejects the whole live response. No partial signal is emitted and no fixture value repairs a live payload.

**Why:** A normalized object without provenance becomes ambiguous outside its original card. Atomic validation makes “valid WeatherSignal” a meaningful boundary rather than a best-effort shape.

### 5. Treat fallback as an explicit failure state

Any non-abort live forecast failure automatically enters fallback. Fallback uses a versioned local fixture with fixed values and sequences; timestamps shift deterministically to the selected location's current local hour/date.

The selected real place may remain visible only as display context. The UI must state that the values are fictional and are not actual weather for that place. Fallback retains the live failure explanation and Retry action, and never uses success language or styling.

**Why:** Automatic fallback supports workshop demonstration during network failure. Strong provenance and labeling are required because attaching fictional values to a real selected place otherwise creates a false claim.

### 6. Separate raw, mapped, readable, and advisory representations

Region 2 exposes three distinct evidence views: readable weather, raw forecast response, and mapped `WeatherSignal`. The fictional advisory may appear with the readable view but remains outside `WeatherSignal`.

If no raw response exists during fallback, the Raw response view says so. If a payload was received and rejected, it may be shown only as a failed live response. No raw provider response is fabricated.

**Why:** These representations answer different questions: what the provider returned, what the app accepted, what a person can scan, and what local rules derived.

### 7. Make advisory deterministic, fictional, and facilitator-owned

The scenario selector produces a versioned advisory from `WeatherSignal`, but it has no operational authority and performs no action. It is labeled as fictional workshop material and not operational guidance.

The facilitator owns and approves all rule thresholds, precedence, and copy. Advisory implementation is blocked until that rule table is supplied. The participant or coding agent must not invent those thresholds.

**Why:** “Warehouse planning” and “delivery planning” imply domain judgment that public weather data alone cannot authorize. Human ownership prevents illustrative logic from acquiring accidental legitimacy.

### 8. Clear evidence on refetch and make latest request win

Starting a forecast request clears prior evidence. Superseded requests are aborted and ignored; they cause neither fallback nor error. Only the latest request may update Region 2.

**Why:** Retaining old weather under newly changed controls creates a provenance mismatch and race conditions can restore it after newer results.

### 9. Split review responsibility

The participant verifies behavior, accessibility, responsiveness, races, and failure paths. The facilitator accepts scope, provenance, fallback semantics, contract mapping, and advisory rules.

**Why:** Mechanical correctness and semantic legitimacy require different evidence and ownership.

## Consequences

### Positive

- Live and fictional evidence are machine- and human-distinguishable.
- A `WeatherSignal` is either complete and valid or absent.
- Reload and refetch behavior are simple and testable.
- Raw provider evidence remains inspectable without becoming the domain contract.
- Operational language cannot silently turn into operational authority.
- Metric and imperial demonstrations use explicit provider units.

### Costs and limitations

- Automatic fallback still carries confusion risk because it appears after a real-place selection; prominent labeling is mandatory.
- Strict validation can reject otherwise usable partial provider data.
- Statelessness prevents saved places, restored work, and offline history.
- Local-time handling depends on Open-Meteo timezone metadata and careful filtering.
- Advisory work cannot finish until the facilitator supplies a reviewed rule table.
- Pressure remains hPa in both unit systems, so “imperial” is intentionally not a universal conversion promise.

## Alternatives rejected

- **Persist controls or evidence:** rejected because the phase does not define staleness, retention, or restored-data provenance.
- **Use an explicit fallback action:** rejected in favor of automatic fallback for workshop continuity.
- **Use a fixed fictional place:** rejected; the selected real place remains as context, with stronger disclaimers.
- **Treat fallback as successful data:** rejected because it makes source and failure state dishonest.
- **Allow partial WeatherSignal values:** rejected because downstream consumers could not rely on the bounded contract.
- **Keep prior evidence during loading:** rejected because changed controls could be visually paired with stale evidence.
- **Let the participant or agent invent advisory thresholds:** rejected because no operational/domain authority supports them.
- **Keep exactly three top-level signal sections:** rejected because provenance would become detached UI state.
- **Use API-default units/timezone:** rejected because output would not be explicit or consistently reviewable.
- **Choose the first geocoding match:** rejected because place-name ambiguity would be hidden.

## Review and revisit triggers

This ADR is valid only for the disposable workshop PoC. Revisit it before any of the following:

- persistence, caching, offline behavior, deployment, or background refresh;
- a data source other than Open-Meteo;
- real operational, customer, supplier, warehouse, or delivery data;
- advice used to influence an actual decision;
- a consumer outside this page depending on `WeatherSignal`;
- schema evolution beyond `1.0`;
- production, security, privacy, legal, or reliability claims.

The facilitator must amend or supersede this ADR when approving the advisory rule table if that table changes the evidence boundary or introduces action-oriented language.
