# TECH.md

Technical rules for the Integration Architecture Copilot proof of concept.

## Stack

Use plain browser technology only:

- HTML
- CSS
- JavaScript

The app must open directly from:

```text
app/index.html
```

Do not add React, Vue, Angular, TypeScript, Tailwind, npm, package managers,
bundlers, build tools, backend services, databases, authentication, analytics,
deployment scripts, CDN libraries, or generated dependency folders.

## Approved LLM Scope

This PoC is allowed to call one AI model endpoint directly from the
browser because the learning goal includes a simple LLM workflow. The
approved provider is **Groq Free tier** using its OpenAI-compatible
chat-completions endpoint. The model is configurable and is not restricted
to a client-side allowlist.

Approved LLM behavior:

- user configures the Groq API base URL, a model name,
  and a disposable demo API key in the browser
- user selects a public location and fetches weather evidence (Open-Meteo)
- user selects one fictional scenario
- app sends only the mapped WeatherSignal and the fictional scenario to the LLM
- LLM returns a weather-grounded review

The review should contain:

- summary: what the weather means for the chosen scenario
- risks: weather-related operational risks for this scenario
- actions: recommended actions given these conditions
- questions: what we don't know yet
- evidence: which WeatherSignal fields back each claim

Anything else needs human approval before implementation. Do not add unrelated
external APIs.

## Demo Key Rules

The browser app may ask the user for:

- API base URL
- API key
- model name

Rules:

- do not commit real keys
- do not hard-code real keys in HTML, CSS, or JavaScript
- do not create `.env` files for this static app
- use disposable demo keys only
- show a clear empty/error state when no key is provided
- keep keys in memory by default; ask before using `localStorage`

This is a disposable PoC, not a safe production pattern.

## App Shape

Start with:

```text
app/
  index.html
  styles.css
  app.js
```

Use each file for a clear job:

- `index.html`: stable page shell, semantic structure, script/style links
- `styles.css`: layout, responsive behavior, visual design, component styles
- `app.js`: state, rendering, LLM call, event handling, and app startup

Keep the app self-contained. It should be easy to zip and send as a static PoC.

## Data And State

- Use simple in-memory arrays and objects for PoC data.
- Keep the data shape explicit and small.
- Use fictional scenario, weather evidence, and review examples only.
- Do not use real personal, customer, supplier, financial, security, or internal
  company data.
- Do not use `localStorage`, `sessionStorage`, cookies, databases, or remote
  APIs beyond the approved LLM endpoint and Open-Meteo unless the human
  approves it.

## Plain JS Component Discipline

Use component thinking without adding a framework.

- Treat each visible UI area as a small component.
- Prefer named render functions or small classes over scattered DOM edits.
- Keep state, rendering, event binding, data creation, and LLM access separate.
- Keep constants at the top of the file or near the feature that owns them.
- Avoid magic strings and repeated selector names spread across the file.
- Avoid one large function that handles everything.
- Avoid broad rewrites when a small component-level change is enough.

Good plain JS shapes:

```js
function renderWeatherCard(signal) {}
function renderReview(review) {}
function bindSearchForm() {}
async function fetchWeather(location) {}
async function requestReview(signal, scenario, llmSettings) {}
```

or, when state grows:

```js
class PocApp {
  constructor(rootElement) {}
  render() {}
  bindEvents() {}
}
```

## JavaScript File Size And Token Discipline

Start with one `app/app.js` file for simplicity. Do not split files early just
to create structure.

Agents need to read code before editing it. Huge files waste tokens and increase
mistake risk.

If `app/app.js` becomes hard to scan or mixes several separate UI areas, do not
keep adding to it silently.

The agent should explain in plain English:

- why the file is becoming harder to manage
- which smaller files it recommends creating
- what each file will contain
- that the app will still open from `app/index.html`
- that no npm, imports, build step, or framework will be added

Then ask for simple approval:

```text
Can I split the JavaScript into smaller plain-JS files while keeping the app
double-clickable?
```

Allowed split pattern:

```text
app/
  index.html
  styles.css
  app.js
  js/
    INDEX.md
    state.js
    llm.js
    render.js
    events.js
    components/
      WeatherCard.js
      Review.js
```

When splitting JavaScript:

- do not add imports, ES modules, npm, bundlers, or build steps
- load files with normal HTML script tags (no ES modules, no `type="module"`)
- keep script order explicit in `index.html`
- expose only one small app namespace, such as `window.App`
- create and maintain `app/js/INDEX.md`
- document each file's purpose, dependencies, and read order in `app/js/INDEX.md`
- before editing split JavaScript, read `app/js/INDEX.md` first, then only the
  relevant files

## HTML Rules

- Use semantic elements where practical.
- Keep `index.html` as the stable shell, not a place to duplicate dynamic data.
- Every interactive control must have an accessible name.
- Inputs need labels.
- Images need `alt` text; decorative images use `alt=""`.
- Keep script order explicit.

## CSS Rules

- Use class selectors for component styles.
- Group CSS by app shell, shared elements, component sections, and responsive
  rules.
- Keep colors, spacing, and typography consistent.
- Keep layout responsive for desktop and narrow/mobile widths.
- Avoid unused styles and oversized visual systems.
- Do not add CSS frameworks.

## Change Size

- Keep edits small and reviewable.
- Prefer adding or changing one component-like unit at a time.
- If a requested change requires a larger rewrite, explain why before editing.
- Do not add new technical capabilities while implementing a feature unless the
  human approves the expanded scope.

## Verification

After changes:

- open `app/index.html` in a browser
- check the main visible flow
- check a narrow/mobile width when layout changes
- run `node --check app/app.js` when `app/app.js` changes
- verify the LLM missing-key state
- verify failed LLM calls show a clear error without breaking the weather
  evidence
- if JavaScript has been split, syntax-check each changed `.js` file when
  practical

Report what was checked and any remaining risk.