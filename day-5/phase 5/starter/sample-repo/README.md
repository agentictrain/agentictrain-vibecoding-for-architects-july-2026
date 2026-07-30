# Tiny Todo

A small, public, non-sensitive sample repo for the Day 5 Phase 5 codebase
exploration exercise. It's intentionally simple — three files, one feature,
a couple of obvious smells — so a codebase-exploration skill has something
real to read without you having to find a repo on GitHub.

The main exercise uses the pinned `expressjs/cookie-parser` revision. This
bundled sample is the offline fallback.

## What it does

A single-page todo list. Add an item, mark it done, delete it. Items persist
in browser `localStorage`. No backend, no database, no build step.

## Files

- `index.html` — the page shell and the todo list markup
- `app.js` — the add / toggle / delete logic
- `README.md` — this file

## Known smells (for the critical-reading step)

- No tests
- `todos` is a global mutable array
- Storage read/write errors are swallowed without visible recovery or feedback
- Todo checkboxes have no accessible name
- `Date.now()` can produce duplicate IDs for additions in the same millisecond
