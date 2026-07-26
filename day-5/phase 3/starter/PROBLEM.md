# Phase 3 — Review an architecture for missing NFRs

## The problem

You have a short fictional architecture description. You need to find
missing non-functional requirements, risks, and dependencies.

## The architecture

```text
A small e-commerce checkout service. A single Node.js backend handles
cart, payment, and order creation. It talks to Stripe for payments and
PostgreSQL for order storage. The frontend is a React SPA. There is no
queue, no cache, and no CDN. Deployed on a single VM.
```

## What to do

1. Search [skills.sh](https://skills.sh) for "architecture review,"
   "NFR," or "risk review." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill on the architecture above.
4. Read the output critically (see below).

## Read the output critically

Label each finding:

- **Source evidence** — directly observable from the description.
- **Model inference** — a reasonable reading of the architecture.
- **Assumption** — plausible but not stated.
- **Unsupported claim** — invented compliance, SLAs, or policies.

Ask yourself:

- Which findings are grounded in the description?
- Which are reasonable inferences (e.g. "no cache means slow under
  load")?
- Which are unsupported (e.g. "GDPR requires..." when GDPR wasn't
  mentioned)?
- Did it miss something obvious (e.g. no backup strategy, no
  rate-limiting)?

Fix the overclaims. Keep or remove the skill.

## Checklist

- [ ] Searched skills.sh and found a review skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the architecture description
- [ ] Labeled each finding
- [ ] Fixed the overclaims
- [ ] Decided keep or remove