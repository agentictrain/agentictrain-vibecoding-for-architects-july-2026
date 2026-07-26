# Implementation decisions

## Explicit fallback activation

- Decision: Offer deterministic fictional fallback only after a live forecast failure and explicit participant action.
- Reason: This keeps fallback visibly separate from successful live evidence.
- Alternatives considered: Automatic fallback after a network error.
- Expected impact: Participants always know when evidence is fictional.
- Human approval still needed: No; this directly implements the brief.

## Runtime endpoint validation

- Decision: Require HTTPS, reject endpoint credentials/query strings/fragments, accept an API base or full chat-completions path, and forward the model name unchanged without a client-side allowlist.
- Reason: This reduces accidental credential exposure and stays inside the approved provider scope. Updated from a pinned `glm-5.2` model to a configurable model after switching from ollama cloud to Groq.
- Alternatives considered: Accept any URL and model string without validation.
- Expected impact: Misconfigured or out-of-scope settings fail locally with a clear retryable error.
- Human approval still needed: No; this enforces the technical constraints.

## WeatherSignal field shape

- Decision: Represent each current field as `{ value, unit }` and each forecast field as `{ values, unit }` within current, hourly, and daily sections.
- Reason: Values and units remain explicit and evidence paths are stable for model review.
- Alternatives considered: Separate unit maps or human-readable strings.
- Expected impact: The mapped object is inspectable and bounded while retaining source units.
- Human approval still needed: No; the shape satisfies the requested contract.
