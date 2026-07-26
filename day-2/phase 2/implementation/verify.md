# Verification

## Static checks

- `node --check app/app.js`: passed.
- VS Code diagnostics for `app/`: no errors.
- Security search: no localStorage, sessionStorage, cookies, IndexedDB, or console logging; credential use appears only in the masked field and Authorization header.

## Browser checks

Opened `app/index.html` directly with a `file://` URL.

- Accessibility snapshot exposes three named regions, labeled controls, status live region, and advisory label.
- Open-Meteo geocoding returned five Geneva results.
- Live forecast loaded in one request and rendered 11 current metrics, 24 hourly cards, and seven daily cards.
- Forced forecast failure showed retry and explicit fictional fallback actions.
- Explicit fallback showed fallback state/source labels and a fictional marker; it did not show live success.
- Reload cleared endpoint, model, and credential fields.
- Missing model settings showed a retryable error and preserved weather evidence.
- Mocked chat-completions response rendered summary, risks, actions, questions, and evidence.
- Mock request body excluded the credential and endpoint; its user content contained only the fictional scenario and WeatherSignal.
- At 320 px and 1440 px, document scroll width equaled viewport width.
- Screenshots were inspected at 320 px and 1440 px with model settings cleared.

## Remaining runtime dependency

A real Groq review was not sent because no disposable credential was provided. Real success still depends on the approved endpoint allowing browser CORS and returning the documented OpenAI-compatible response shape.
