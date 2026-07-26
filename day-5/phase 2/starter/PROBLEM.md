# Phase 2 — Draft an ADR

## The problem

You need an Architecture Decision Record for a fictional decision:

> Should we use event sourcing for our order service?

You could write it from scratch, or find a skill that drafts ADRs from
a short problem statement.

## What to do

1. Search [skills.sh](https://skills.sh) for "ADR" or "architecture
   decision." Find a candidate skill.
2. Inspect its source: read the `SKILL.md`, any scripts, and the
   install command. What does it do when it runs? What does it write?
3. Install it:
   ```bash
   DISABLE_TELEMETRY=1 npx --yes skills add <skill-source> --yes
   ```
4. Open Copilot and run the skill on the fictional problem above.
5. Read the output critically (see below).

## Read the output critically

Label each claim in the ADR:

- **Source evidence** — restates something from the problem statement.
- **Model inference** — a reasonable reading of the problem.
- **Assumption** — plausible but not stated.
- **Unsupported claim** — invented constraints, policies, or
  stakeholders.

Ask yourself:

- Does the ADR state the decision, drivers, alternatives, and
  consequences?
- Did the model invent constraints, policies, or stakeholders?
- Which claims are source evidence, which are inferences, which are
  unsupported?

Fix the overclaims. Keep or remove the skill.

## Checklist

- [ ] Searched skills.sh and found an ADR skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the fictional problem
- [ ] Labeled each claim in the output
- [ ] Fixed the overclaims
- [ ] Decided keep or remove