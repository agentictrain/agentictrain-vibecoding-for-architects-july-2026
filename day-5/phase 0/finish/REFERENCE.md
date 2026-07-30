# Phase 0 — Reference result

## Core result

A complete Phase 0 produces operational evidence rather than a code artifact:

- VS Code lists the user-level `atlassian` MCP server as running.
- A read-only Copilot request returns the expected Jira site and project.
- The participant previews the project, issue type, summary, and description
  before approving creation.
- The returned Jira URL opens the intended ticket.
- A second Copilot fetch returns the same key, summary, and description.

The participant records only the fictional ticket key and verification
result. They do not record OAuth tokens, API tokens, or private Jira content.

## Optional implementation result

The optional add-on is complete only when Copilot begins in **Plan** mode,
the approved plan maps every acceptance criterion to code and tests, the
implementation stays within scope, and the final evidence identifies any
criterion that remains incomplete. No Jira update, commit, push, or pull
request is implied.
