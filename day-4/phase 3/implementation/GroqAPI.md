# Groq API reference (workshop)

Offline reference for the agent. This is the only LLM endpoint the PoC may
call. It uses Groq's OpenAI-compatible chat-completions shape.

## Endpoint and free tier

- **Default base URL:** `https://api.groq.com/openai`
- **Chat completions path:** `/v1/chat/completions`
- **Full URL:** `${baseUrl}/v1/chat/completions`
- **Default model:** `openai/gpt-oss-20b`

Groq provides a Free tier and free API keys. A payment method is required to
upgrade to the paid Developer tier, not to use the Free tier. Published Free
tier limits vary by model; on 2026-07-23, `openai/gpt-oss-20b` was listed at 30
requests per minute and 1,000 requests per day. Check the Groq console for the
current limits before a workshop.

The model field is configurable. Forward it unchanged and do not validate it
against a client-side list.

## Authentication

Send the temporary workshop credential only as
`Authorization: Bearer <key>`. Keep it in page memory and never put it in a
URL, request body, prompt, log, screenshot, review, browser storage, cookie, or
IndexedDB. Revoke workshop credentials after use.

Direct browser credentials are acceptable only for this disposable exercise;
they are not a production security pattern.

## Request

Send `POST /v1/chat/completions` with `Content-Type: application/json`:

```json
{
  "model": "openai/gpt-oss-20b",
  "messages": [
    { "role": "system", "content": "system prompt text" },
    { "role": "user", "content": "user prompt text" }
  ],
  "stream": false,
  "response_format": { "type": "json_object" },
  "temperature": 0.2
}
```

The system message pins the five-field JSON contract. The user message contains
only the mapped `WeatherSignal` and selected fictional scenario. Never send the
raw Open-Meteo response, credential, or internal app state.

Groq JSON Object Mode guarantees valid JSON syntax but not schema adherence, so
the app must still perform its strict local validation.

## Response contract

Parse the JSON string at `choices[0].message.content` and require exactly:

```json
{
  "summary": "1-3 sentences about what the weather means for the scenario",
  "risks": ["1-6 weather-related operational risks"],
  "actions": ["1-6 recommended actions"],
  "questions": ["1-6 things not yet known"],
  "evidence": ["1-6 valid WeatherSignal field paths"]
}
```

- All five keys are required and no extra keys are allowed.
- The summary must be a non-empty string of 1-3 sentences.
- Each array must contain 1-6 non-empty strings.
- Every evidence path must resolve against the mapped signal.
- Reject the whole reply on parse or validation failure. Never invent fields or
  display a partial review.

### Observed Groq envelope

Groq may return a `reasoning` string beside `message.content`, plus top-level
usage, `x_groq`, service-tier, and fingerprint metadata. These fields are not
part of the review contract. The app reads and validates only the JSON string in
`choices[0].message.content` and ignores the additional provider metadata.

When an evidence path does not resolve, the error identifies its one-based item
position without echoing the model-controlled path text. This preserves useful
diagnostics without reflecting untrusted output.

## Failure and CORS behavior

For network, HTTP, parse, or validation failures, show a generic review error
and retain the visible weather evidence. Do not echo credentials or provider
response bodies, auto-load fallback weather, or render model-supplied HTML.

On 2026-07-23, credential-free preflights returned HTTP 204 with
`Access-Control-Allow-Origin: *` and allowed `POST`, `Authorization`, and
`Content-Type` for both `Origin: null` and localhost. Live behavior still
depends on Groq and a valid runtime credential.

The app may call only `${baseUrl}/v1/chat/completions` for this workflow. Do not
add a proxy, backend, CORS shim, streaming request, persistence, or another
external integration.