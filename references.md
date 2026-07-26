# Course references

Curated authoritative links for going deeper on any topic in the course. Each
day's guide ends with a short "References" footer that points back here and
lists the 3–5 most relevant links for that day.

> **Scope:** these are the official documentation pages for the public
> services, standards, and tools the course uses. They are not endorsements
> of any vendor beyond the workshop's approved scope.

---

## Open-Meteo (the only public data source)

- [Open-Meteo API docs](https://open-meteo.com/en/docs) — the forecast
  endpoint, every parameter, every unit. The canonical reference for what
  the app fetches.
- [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api) —
  the city-search endpoint, its parameters, and its response shape.
- [WMO weather interpretation codes](https://open-meteo.com/en/docs) (scroll
  to "Weather variable codes") — the full table mapping `weather_code`
  numbers to sky conditions.

## Groq (the model provider)

- [Groq Console](https://console.groq.com) — sign up, get a free API key,
  and manage models. No payment required for the free tier.
- [Groq API docs](https://console.groq.com/docs) — the chat-completions
  endpoint, request/response shape, JSON mode, and rate limits.
- [Groq available models](https://console.groq.com/docs/models) — the
  current list of models you can put in the **model name** field. Models
  get deprecated over time; check here if one returns 404.

## OpenAI-compatible chat completions (the request shape)

- [OpenAI chat completions reference](https://platform.openai.com/docs/api-reference/chat) —
  the shape Groq implements. Read this for `messages`, `response_format`,
  `temperature`, and the `choices[0].message.content` response path.

## Accessibility (WAI-ARIA, keyboard, screen readers)

- [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/) — the
  canonical patterns for `role="dialog"`, focus traps, and modal behavior.
- [WebAIM keyboard accessibility](https://webaim.org/techniques/keyboard/) —
  why Tab, Shift+Tab, Enter, and visible focus matter, and how to test.
- [WebAIM screen reader testing](https://webaim.org/articles/screenreader_testing/) —
  how to test with VoiceOver (macOS), NVDA (Windows), or Orca (Linux).
- [MDN: live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) —
  how `aria-live` announces dynamic changes to screen readers.
- [Lighthouse accessibility audit](https://developer.chrome.com/docs/lighthouse/accessibility/scoring) —
  how the a11y score is calculated and what each audit checks.

## Threat modeling (Day 4)

- [OWASP threat modeling overview](https://owasp.org/www-community/Threat_Modeling) —
  a plain-language introduction to assets, trust boundaries, attacker
  capabilities, and abuse paths.
- [STRIDE cheat sheet](https://owasp.org/www-community/controls/Threat_Modeling_Cheat_Sheet) —
  the six threat categories (Spoofing, Tampering, Repudiation, Information
  disclosure, Denial of service, Elevation of privilege) applied to a
  system boundary.

## GitHub Copilot

- [GitHub Copilot docs](https://docs.github.com/en/copilot) — setup, chat,
  plan mode, and the `/rubber-duck` and `/spar` review commands.
- [GitHub Copilot App](https://docs.github.com/en/copilot/github-copilot-in-the-github-copilot-app) —
  the standalone chat application where rubber-duck and spar live (separate
  from the editor extension).

## skills.sh (Day 5)

- [skills.sh](https://skills.sh) — the public catalog. Browse, search, and
  inspect skill source files before installing.
- [skills CLI](https://github.com/superpowers-extra/skills) — the `npx skills`
  command reference: `add`, `remove`, `list`, and the `DISABLE_TELEMETRY`
  flag.

## Excalidraw (Day 2 sketching)

- [Excalidraw](https://excalidraw.com) — the web app, no install. Save as
  `.excalidraw` source and export a PNG.
- [Excalidraw docs](https://docs.excalidraw.com) — keyboard shortcuts,
  export formats, and library shapes.

## Planning skills (Day 2)

These are the skills the course installs for Day 2. Each link is the
canonical source — read it before you run the skill.

- `write-spec` — [skills.sh](https://skills.sh) search "write-spec"
- `architecture` — search "architecture" or "ADR"
- `writing-plans` — search "writing-plans"
- `grill-with-docs` — search "grill-with-docs"
- `inquisition` — bundled in this repo at `assets/skills/inquisition.zip`

If a skill isn't found on skills.sh, it may be part of the **superpowers**
collection — search for "superpowers" on skills.sh or ask Copilot to check
whether it's installed.

---

## Going deeper: AI applied to architecture

Curated articles for the architect who already knows architecture and wants
to see how AI is being applied to it. These are the sources behind the
course's habits — specify, generate, validate, read critically — applied to
real architect tasks.

### AI and the architect's role

- [Where Architects Sit in the Era of AI](https://www.infoq.com/articles/architects-ai-era/) —
  how the architect's role shifts when AI generates code, specs, and
  decisions. What stays yours, what you delegate, what you review.
- [Architecture in a Flow of AI-Augmented Change](https://www.infoq.com/articles/architecture-ai-augmented-change/) —
  how architecture practice changes when change itself is AI-accelerated.
  The review cycle shrinks; the boundary decisions get sharper.
- [The Oil and Water Moment in AI Architecture](https://www.infoq.com/articles/oil-water-moment-ai-architecture/) —
  why AI and traditional architecture practices don't mix automatically, and
  what an architect has to do to make them work together.
- [Architecting the MVP in the Age of AI](https://www.infoq.com/articles/architecting-mvp-AI/) —
  how the minimum-viable-product slice changes when AI can generate most of
  it. What you bound, what you let the model fill, what you reject.

### Governing AI in architecture

- [Architectural Governance at AI Speed](https://www.infoq.com/articles/architectural-governance-ai-speed/) —
  how to keep architecture review meaningful when AI produces decisions
  faster than humans can review them. The course's Day 2 inquisition habit,
  at org scale.
- [Governing AI in the Cloud: a Practical Guide for Architects](https://www.infoq.com/articles/governing-ai-cloud-guide/) —
  a practical guide to the guardrails, boundaries, and review gates an
  architect puts around AI in a real cloud environment. The Day 4
  credential-boundary habit, expanded.
- [Trustworthy Productivity: Securing AI Accelerated Development](https://www.infoq.com/articles/secure-ai-development/) —
  how to keep AI-accelerated development trustworthy: threat modeling,
  credential boundaries, and what "reviewable" means when the model wrote
  half the code.

### Agentic AI architecture

- [Agentic AI Architecture Framework for Enterprises](https://www.infoq.com/articles/agentic-ai-architecture-framework/) —
  a reference framework for architecting agentic AI systems in an
  enterprise: agent roles, orchestration, memory, governance, and the
  boundaries between them.
- [Evaluating AI Agents in Practice: Benchmarks, Frameworks, and Lessons Learned](https://www.infoq.com/articles/evaluating-ai-agents-lessons-learned/) —
  how to evaluate agents the way you evaluate architecture: with
  benchmarks, failure cases, and a critical read of the output. The course's
  "label every claim" habit, applied to agent evaluation.
- [Agentic AI Architecture](https://www.infoq.com/minibooks/agentic-ai-architecture/) —
  an InfoQ eMag (free PDF) collecting the key articles on agentic AI
  architecture in one place. A longer read if the articles above leave you
  wanting more.

### Keeping up

- [InfoQ AI Architecture](https://www.infoq.com/ai-architecture/) — the
  topic page. New articles, news, and podcasts on AI applied to
  architecture, updated weekly. Bookmark it.
- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar) —
  the biannual opinionated guide to what's emerging in AI, architecture, and
  the intersection. Search for "AI" and "architecture" in the current
  radar.

### Top three to read first

1. **[Where Architects Sit in the Era of AI](https://www.infoq.com/articles/architects-ai-era/)**
   — the role shift. Read this first; it frames everything else.
2. **[Architectural Governance at AI Speed](https://www.infoq.com/articles/architectural-governance-ai-speed/)**
   — how to keep review meaningful when AI outpaces it. The course's
   inquisition habit at org scale.
3. **[Agentic AI Architecture Framework for Enterprises](https://www.infoq.com/articles/agentic-ai-architecture-framework/)**
   — a reference framework for the systems the course is a toy version of.