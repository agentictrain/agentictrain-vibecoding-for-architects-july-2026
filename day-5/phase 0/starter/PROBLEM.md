# Phase 0 — Connect local Copilot to Jira

## The problem

Connect the GitHub Copilot agent running in your local VS Code host to Jira.
Use Atlassian Rovo MCP and your existing Jira permissions. Do not install a
Copilot cloud agent in Jira.

## What to do

Follow the complete
[Phase 0 guide](../../README.md#phase-0--connect-local-copilot-to-jira-and-create-a-ticket).
The core exercise has four outcomes:

1. Add `https://mcp.atlassian.com/v1/mcp/authv2` as a user-level HTTP MCP
   server in VS Code.
2. Complete OAuth, then use a read-only Jira request to verify access.
3. Preview and approve creation of the fictional workshop-summary ticket.
4. Open and fetch the created ticket again to verify the stored fields.

Do not put Jira tokens, credentials, or production information in the
workspace or chat.

## Optional implementation exercise

After the core route, you can read an implementation-ready Jira ticket,
start in Copilot **Plan** mode, approve the plan, implement locally, and map
every acceptance criterion to verification evidence. This add-on is outside
the two-hour route.

## Checklist

- [ ] Connected the local VS Code host to Atlassian Rovo MCP
- [ ] Completed a read-only Jira request
- [ ] Previewed and approved the exact ticket creation
- [ ] Opened and fetched the created ticket
- [ ] Kept credentials and production data out of the exercise
