# Rubber Duck Review Findings

Date: 2026-07-22
Scope: app/ reviewed against spec and plan

## Blocking

1. Scenario step is not implemented per spec, and option keys do not match agreed values.
Evidence:
- Scenario is disabled in [app/index.html](app/index.html#L75).
- Option values are warehouse and delivery in [app/index.html](app/index.html#L77) and [app/index.html](app/index.html#L78).
- Spec requires explicit selectable warehouse-planning or delivery-planning in [plans/spec_v2.md](plans/spec_v2.md#L125).
Impact:
- Required control state and agreed data values are not aligned with the contract terms.

2. Unit-system selection is missing.
Evidence:
- Spec flow requires unit selection before fetch in [plans/spec_v2.md](plans/spec_v2.md#L311).
- Glossary references metric and imperial unit system in [plans/glossary_v2.md](plans/glossary_v2.md#L161).
- No unit-system control or state exists in [app/index.html](app/index.html#L26) and [app/app.js](app/app.js#L39).
Impact:
- Required user input and unit provenance path are absent.

3. Mapper does not validate unknown units, only non-empty units.
Evidence:
- Unit validation accepts non-empty strings in [app/weather-signal.js](app/weather-signal.js#L96).
- Spec requires rejecting unknown units in [plans/spec_v2.md](plans/spec_v2.md#L246).
Impact:
- Invalid provider unit strings can pass atomic validation, violating contract strictness.

4. Empty weather state still renders sample evidence cards.
Evidence:
- Spec says empty state should show no sample evidence in [plans/spec_v2.md](plans/spec_v2.md#L260).
- Empty block includes visible placeholders in [app/index.html](app/index.html#L97), [app/index.html](app/index.html#L100), and [app/index.html](app/index.html#L109).
Impact:
- Empty state semantics do not match required behavior.

5. Region 3 placeholder wording and shape do not match reserved placeholder requirement.
Evidence:
- Spec requires reserved-for-future-phase labeling and no controls or hidden behavior in [plans/spec_v2.md](plans/spec_v2.md#L289).
- Current Region 3 is review scaffold content in [app/index.html](app/index.html#L143) and [app/index.html](app/index.html#L149).
Impact:
- Reserved-region contract is not met.

## Non-blocking

6. Invalid geocoding timezone is not detected; only missing timezone triggers UTC fallback note.
Evidence:
- Fallback note check uses timezone truthiness in [app/app.js](app/app.js#L387).
- Spec requires missing or invalid timezone to use UTC and disclose it in [plans/spec_v2.md](plans/spec_v2.md#L123).
Impact:
- Invalid timezone strings could be carried without required disclosure.

7. Region 2 readable weather is missing the separate advisory area referenced by spec.
Evidence:
- Spec includes readable weather plus separate advisory area in [plans/spec_v2.md](plans/spec_v2.md#L252).
- Region 2 currently has readable card and JSON views only in [app/index.html](app/index.html#L117).
Impact:
- Presentation is close but not fully aligned with stated Region 2 composition.

8. Plan asks for mapper tests, but tests folder is absent.
Evidence:
- Plan Task 3 and Task 4 require tests in [plans/plan_v2.md](plans/plan_v2.md#L105) and [plans/plan_v2.md](plans/plan_v2.md#L122).
- No tests are present under tests in this workspace.
Impact:
- Contract and fallback behavior are not protected by automated checks promised in plan.

## Suggestion

9. Resolve plan and spec mismatch for fallback trigger explicitly in docs or code comments.
Evidence:
- Plan says no auto-fallback and explicit fallback load in [plans/plan_v2.md](plans/plan_v2.md#L144) and [plans/plan_v2.md](plans/plan_v2.md#L146).
- Spec and ADR define automatic fallback on non-abort failure in [plans/spec_v2.md](plans/spec_v2.md#L159) and [plans/adr_v2_final.md](plans/adr_v2_final.md#L48).
- Current code follows auto-fallback in [app/app.js](app/app.js#L392).
Impact:
- Behavior is understandable, but documentation conflict can cause rework and review confusion.

## Open Question

- Should implementation continue to follow spec and ADR automatic fallback as source of truth, and treat the conflicting plan lines as stale?
