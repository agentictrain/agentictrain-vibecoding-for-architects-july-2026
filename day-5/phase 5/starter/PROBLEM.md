# Phase 5 — Review an existing codebase

## The problem

You clone a small public GitHub repo. You need to understand what it
does, how it's structured, and where the risks are — without reading
every file yourself.

## What to do

1. Pick a small codebase to explore. You have two options:
   - **Bundled sample (offline):** use the tiny todo app shipped at
     `course/day-5/phase 5/starter/sample-repo/`. It's a three-file app with
     a couple of intentional smells — see its `README.md`.
   - **Public repo (online):** clone a small, public, non-sensitive repo of
     your choice:
     ```bash
     git clone https://github.com/<a-small-public-repo> .
     ```
2. Search [skills.sh](https://skills.sh) for "codebase," "code
   review," "onboarding," or "explore." Find a candidate skill.
3. Inspect the source, then install it.
4. Open Copilot in the chosen repo and ask the skill the questions
   below.
5. Read the answers critically (see below).

## Questions to ask

1. What does this codebase do?
2. Where are the main entry points?
3. What are the biggest risks or code smells?

## Read the answers critically

- Does each claim trace to actual code you can point to?
- Did it hallucinate files, functions, or patterns that don't exist?
- Did it miss something obvious (e.g. no tests, no error handling,
  hardcoded secrets)?
- Is the structure description accurate or guessed?

Verify two claims by opening the actual files. Fix or discard the
skill's wrong answers. Keep or remove the skill.

## Checklist

- [ ] Cloned a small public repo
- [ ] Searched skills.sh and found a codebase exploration skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill and asked the three questions
- [ ] Verified two claims against the actual code
- [ ] Labeled each claim
- [ ] Decided keep or remove