# Phase 2 — Draft an ADR

## The problem

You need an Architecture Decision Record for this fictional scenario:

> The order service currently stores its current state with a CRUD model in
> PostgreSQL. The team needs a trace of every order-state change and wants to
> replay changes for debugging and analytics. It has not selected an event
> store or delivery platform. Operational capacity, retention, consistency
> requirements, and team experience with event-sourcing technology are
> unknown.
>
> Should the team adopt event sourcing for the order service?

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
4. Open Copilot and run the skill on the complete fictional scenario above.
5. Read the output critically (see below).
6. Save the reviewed ADR locally as `adr-event-sourcing.md`.
7. Save the reviewed ADR to the Phase 0 Jira ticket as a comment, then
   fetch the ticket again and verify the stored comment.

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

## Save the reviewed ADR to Jira

For this workshop, store the ADR as a comment on the ticket you created
in Phase 0. A comment preserves the original ticket description, status,
and assignment while keeping the decision visible in Jira.

1. Save the corrected ADR locally as `adr-event-sourcing.md`.
2. Open the host-local Copilot Chat in **Agent** mode and provide the
   Phase 0 ticket key.
3. Ask Copilot to prepare the Jira comment without writing it:

   ```text
   Using the Atlassian Jira tools, fetch <TICKET-KEY> and confirm its
   summary. Read #file:adr-event-sourcing.md and prepare an ADR comment
   containing its complete reviewed content.

   Show me the exact target ticket and exact comment first. Do not write
   to Jira yet. Do not change the description, status, assignee, or any
   other ticket field.
   ```

4. Check that the preview targets the intended ticket and exactly
   matches the reviewed ADR. Remove any invented context.
5. Approve the write explicitly:

   ```text
   Add exactly that approved ADR comment to <TICKET-KEY>. Make no other
   Jira changes.
   ```

6. Ask Copilot to fetch the ticket and its latest comments again.
   Compare the stored decision, status, alternatives, consequences, and
   claim labels with the local ADR.

If the Jira comment tool or write permission is unavailable, do not
bypass the restriction. Keep the local ADR, capture the exact blocked
reason, and ask the facilitator.

## Checklist

- [ ] Searched skills.sh and found an ADR skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the fictional problem
- [ ] Labeled each claim in the output
- [ ] Fixed the overclaims
- [ ] Saved the reviewed ADR locally
- [ ] Previewed and approved the exact Jira comment
- [ ] Fetched Jira again and verified the stored ADR
- [ ] Decided keep or remove
