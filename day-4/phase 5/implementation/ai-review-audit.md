# AI review code audit

Review of the AI review code in `app/` against `AGENTS.md`, `TECH.md`,
`GroqAPI.md` (at `implementation/GroqAPI.md`), and the five-field contract
from the guide.

Scope: `app/review.js`, `app/app.js`, `app/weather-signal.js`,
`app/index.html`, `tests/review.test.mjs`.

Focus areas:

- JSON validation (reject missing/empty/over-six-item fields, never invent a
  replacement)
- stale-response handling (changing settings or scenario mid-request must
  ignore the old reply)
- credential boundary (never in URL, body, prompt, logs, or review text)
- weather-evidence visibility (stays visible on every model failure)

Each finding is categorized as Blocking, Non-blocking, or Suggestion.

## Verification

- `node --check app/review.js app/app.js app/weather-signal.js`: pass
- `node --test tests/review.test.mjs tests/weather-signal.test.mjs`: 15/15 pass
- Note: `node --test tests/` (directory form) fails with `ERR_TEST_FAILURE`
  because Node treats the directory as a single test. Run the individual
  `.mjs` files instead. Test-runner invocation issue, not a code defect.

## Blocking

None. The core contract is correctly implemented:

- Five-field validation rejects missing/extra/empty/over-six items and never
  invents replacements (`app/review.js:92-123`).
- Credentials go only in the `Authorization` header, never URL/body/prompt
  (`app/review.js:29,35`).
- Weather evidence stays visible on review failure (`app/app.js:382-392`
  renders the error card without touching `state.weather`).
- Stale-response handling via `reviewRequestId` guard
  (`app/app.js:354,372,383`).

## Non-blocking

### 1. Stale-response: unit-system change is not symmetric with scenario change

Changing the scenario calls `resetReviewState()` (`app/app.js:342`), which
bumps `reviewRequestId` and aborts the in-flight review request. Changing the
unit system while a review is loading does not call `resetReviewState()`
(`app/app.js:400-414`); it triggers a new forecast attempt that bumps
`activeAttemptId`, but a slow in-flight review reply could still land and
render against now-stale evidence.

Low likelihood (review requests are short), but it breaks the "changing
settings mid-request must ignore the old reply" rule for one path.

Fix: call `resetReviewState()` at the start of `handleUnitSystemChange` when a
re-fetch is triggered, or abort `state.reviewController` there.

### 2. API key re-populated into the DOM on every dialog open

`populateModelSettingsForm` (`app/app.js:222-226`) writes
`state.modelSettings.apiKey` into the password input's `value` on every dialog
open. The key lives in the input value in memory (acceptable per `TECH.md`'s
"page memory" rule) and the input is `type="password"`, so this is within the
credential boundary.

Noted because `GroqAPI.md` lists "screenshot" as a forbidden surface. The
masked field is fine, but re-populating on every open increases exposure
surface if a screenshot is taken while the dialog is open with the field
focused.

Suggested improvement: leave the field blank on open with a placeholder like
"saved" and only update on explicit edit. Non-blocking because the field is
masked and in-memory only.

### 3. countSentences fallback masks malformed summaries

`app/review.js:141-146` returns `1` when the split yields no parts. A summary
like `"..."` or a single emoji-only string would pass as 1 sentence. Groq
JSON mode plus the system prompt reduce the risk, and "1-3 sentences" is
inherently fuzzy. Non-blocking; the non-empty check still applies.

## Suggestions

### 1. validateRequestInputs does not validate settings.model

`GroqAPI.md` says the model is configurable and must not be validated against
a client-side list (which the code respects), but an empty/whitespace model
would still be forwarded to Groq and produce a provider-side 400.
`canGenerateReview()` (`app/app.js:815-825`) also does not check `model`.

Consider requiring a non-empty model string in `validateRequestInputs` for a
clearer client-side error. Pure suggestion; the provider will reject it.

### 2. HTTP status code exposed in error message

`app/review.js:51` exposes the HTTP status code in the error message
(`Model request failed with status 401`). `GroqAPI.md` says "do not echo
provider response bodies" but is silent on status codes, and
`tests/review.test.mjs:162` explicitly asserts the status appears. Status
codes are not credentials and are useful diagnostically. Suggestion only;
leave as-is unless the guide tightens this.

### 3. renderReviewResult uses textContent for all model strings (positive finding)

`app/app.js:895-898` uses `textContent` for all model-supplied strings, and the
error card at `app/app.js:844` interpolates `state.review.error` via
`textContent` too. Confirmed safe against HTML injection. No change needed;
recorded as a positive finding.

### 4. app/INDEX.md does not mention SYSTEM_PROMPT export

`app/INDEX.md` describes script load order but does not mention that
`review.js` exports `SYSTEM_PROMPT` for testability. Minor doc gap, not a code
issue.

## Bottom line

The AI review code correctly implements the Groq contract, five-field
validation, credential boundary, and weather-evidence visibility. The only
real gap is the asymmetric stale-response handling on unit-system change
(Non-blocking #1).