# Tiny Todo

A small, public, non-sensitive sample repo for the Day 5 Phase 5 codebase
exploration exercise. It's intentionally simple — three files, one feature,
a couple of obvious smells — so a codebase-exploration skill has something
real to read without you having to find a repo on GitHub.

If you'd rather explore a real public repo, you can still run
`git clone https://github.com/<a-small-public-repo> .` in an empty folder
and point the skill at that instead. This bundled sample is the offline
fallback.

## What it does

A single-page todo list. Add an item, mark it done, delete it. Items persist
for the session only (in-memory). No backend, no database, no build step.

## Files

- `index.html` — the page shell and the todo list markup
- `app.js` — the add / toggle / delete logic
- `README.md` — this file

## Known smells (for the critical-reading step)

- No tests
- No error handling around `JSON.parse` in `loadState`
- `todos` is a global mutable array
- The delete button has no keyboard-accessible name