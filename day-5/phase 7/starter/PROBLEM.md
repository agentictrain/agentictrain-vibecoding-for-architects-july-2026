# Phase 7 — Turn meeting notes into a decision document

## The problem

You have a short fictional meeting transcript. You need a decision
document: the decision, the rationale, who agreed, what's open.

## The meeting transcript

```text
Meeting: Platform team sync, 2026-07-24
Attendees: Alice (tech lead), Bob (infra), Carlos (backend), Dana (data)

Alice: We need to pick a message broker for the new order service.
  Kafka or SQS?
Bob: Kafka gives us replay and ordering, but ops is heavier. We'd need
  a cluster.
Carlos: SQS is simpler. We don't need replay for orders. But we lose
  ordering guarantees across consumers.
Dana: For analytics, replay would be nice. But we can batch from the DB
  instead.
Alice: So the trade-off is ops cost vs replay. Anyone feel strongly?
Bob: I'd rather not run a Kafka cluster for one service.
Carlos: Agreed. SQS for now, revisit if we need replay.
Alice: OK. SQS. Dana, you're OK with batching from DB?
Dana: Yes, for now.
Alice: Open question: what happens if SQS has a regional outage? Bob,
  can you look into a fallback?
Bob: I'll check multi-region options for next week.
```

## What to do

1. Search [skills.sh](https://skills.sh) for "meeting notes," "decision
   document," or "summary." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill on the transcript above.
4. Read the output critically (see below).

## Read the output critically

Label each material claim as source evidence, model inference, assumption, or
unsupported claim. Then check:

- Did the model attribute opinions to people who didn't speak?
- Did it invent a consensus that wasn't reached?
- Did it fill gaps with plausible-sounding but unsupported reasoning?
- Are the open questions captured accurately?
- Did it distinguish explicit agreement from support inferred from a
  participant's position?

Fix the overclaims. Keep or remove the skill.

## Checklist

- [ ] Searched skills.sh and found a meeting-notes or decision skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the transcript
- [ ] Labeled each claim
- [ ] Fixed the overclaims
- [ ] Decided keep or remove
