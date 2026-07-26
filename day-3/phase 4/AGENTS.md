# AGENTS.md

Working rules for agent-assisted proof-of-concept development.

## Operating Style

- Be direct, practical, and evidence-driven.
- Prefer doing small approved work over proposing broad rewrites.
- Use plain English for decisions, risks, and next steps.
- Keep explanations short unless they affect scope, safety, or verification.
- If something is uncertain, say the assumption before acting.
- Do not hide technical risk from the human.

## First Steps

Before changing files:

1. Read `INDEX.md`, `AGENTS.md`, and `TECH.md`.
2. Identify the active task, active folder, expected outcome, and constraints.
3. Inspect only the files needed for the task.
4. Tell the human which files you plan to edit.
5. For non-trivial work, create or update a short plan before editing.

Use existing `INDEX.md` files to navigate. Do not start with broad full-repo
scans unless the index is missing or clearly stale.

## Planning

For non-trivial work, keep planning lightweight and visible.

Use the `plans/` folder for planning and decision artifacts.

Use or create these files when they help the task:

- `plans/spec.md`: goal, user, constraints, non-goals, assumptions
- `plans/plan.md`: small ordered implementation steps
- `plans/acceptance-criteria.md`: observable checks for done
- `plans/timeline.md`: short record of prompts, decisions, checks, and
  checkpoints
- `plans/follow-ups.md`: useful ideas that are not part of the MVP

Do not create planning files for tiny wording, style, or one-line fixes unless
the human asks for them.

Do not implement a plan while it has unresolved open questions that affect:

- MVP scope
- user flow or visible behavior
- data shape or examples
- technical boundaries
- acceptance criteria
- verification steps

Resolve the question with the human first, or write the answer as an explicit
assumption in `plans/spec.md` and call it out before editing.

## MVP Discipline

For non-trivial work, define the MVP before implementing.

The MVP is the smallest useful version that can be shown, checked, and discussed.
It is not a place for every good idea.

Separate work into:

- MVP: required for the first useful demo
- Later: useful, but not needed now
- Out of scope: not part of this task

Do not add Later or Out of scope items unless the human explicitly changes the
plan.

If the request is broad, propose the smallest useful MVP slice first and ask for
plain-English approval before implementing.

## Questions And Assumptions

- Ask only questions that block safe progress.
- If a reasonable assumption is enough, write it down and continue only when it
  does not leave the plan with unresolved open questions.
- Keep must-have work separate from nice-to-have ideas.
- Do not turn optional ideas into approved scope.
- If the human changes direction, update the plan before editing further.

## Scope Control

- Stay inside the active folder unless the human expands scope.
- Follow `TECH.md` for technical boundaries.
- Do not add dependencies, services, persistence, accounts, logins, analytics,
  deployment, or external integrations unless the human explicitly approves.
- For this PoC, the approved integration scope is limited to the Open-Meteo
  weather API and the LLM weather-grounded review workflow described in
  `TECH.md`. Anything beyond that needs a new plain-English approval.
- Do not use real personal, customer, supplier, financial, security, or internal
  company data.
- Keep proof-of-concept data fictional or clearly placeholder.

## Editing Rules

- Make focused, reviewable changes.
- Prefer small component-like edits over broad rewrites.
- Preserve unrelated user changes.
- Do not delete or replace files you did not intend to change.
- Use existing structure before inventing new structure.
- Add comments only when they clarify non-obvious behavior.
- Keep visible text and labels clear enough for a non-technical reviewer.

## Implementation Records

Use the `implementation/` folder for records created while building or changing
the app.

Use or create these files when they help the task:

- `implementation/decisions.md`: decisions the agent made without direct human
  approval
- `implementation/changed-files.md`: short summary of changed files and why
- `implementation/debug-notes.md`: issues found, fixes tried, and outcomes
- `implementation/verify.md`: checks run, results, and remaining risks

If the agent makes a decision without direct human control, record it in
`implementation/decisions.md` before closeout.

Each self-made decision entry should include:

- decision
- reason
- alternatives considered
- expected impact
- whether human approval is still needed

Do not hide self-made decisions only in chat.

## Token And Context Discipline

- Read `INDEX.md` files first.
- Prefer targeted file reads over broad scans.
- Avoid dumping long terminal output into chat.
- Avoid verbose commands when a short check proves the point.
- Keep files small enough to inspect cheaply.
- If a file becomes hard to scan, explain the split or index update you
  recommend before editing more.
- Update relevant `INDEX.md` files when adding, moving, or splitting files.

## Verification

Before saying work is done:

- Run the smallest meaningful check first.
- Follow the verification steps in `TECH.md`.
- Verify visible app changes in a browser when practical.
- Re-check narrow/mobile width when layout changes.
- Report exact checks run and whether they passed.
- If a check cannot run, say why and name the remaining risk.

## Checkpoints

Agents manage Git mechanics. Humans approve intent.

Use this order:

```text
Verify first.
Review changed files second.
Checkpoint third.
```

Before checkpointing:

- inspect changed files
- summarize the change in plain English
- suggest a clear checkpoint message
- create the checkpoint only after explicit human confirmation

Use human-friendly terms: checkpoint, changed files, compare changes, recover,
last good version.

## Recovery

If recovery is needed:

1. Compare the current work with the last good checkpoint.
2. Explain what would be lost.
3. Recommend the safest recovery option.
4. Ask for explicit confirmation before rolling back.

Do not use destructive Git commands unless the human clearly approves the exact
operation.

## Closeout

When finishing a task, report:

- what changed
- important files touched
- checks run and results
- remaining risks or open questions
- suggested checkpoint message, when useful

Keep the final answer short and actionable.
