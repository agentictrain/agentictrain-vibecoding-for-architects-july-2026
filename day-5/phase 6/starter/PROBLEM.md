# Phase 6 — Build a dashboard from a spreadsheet

## The problem

You have a CSV file with fictional operational data. You need a visual
dashboard a stakeholder can read — a Power BI replacement, built with
plain HTML/CSS/JS and no backend.

## The data

The CSV file is at `course/day-5/phase 6/starter/data.csv`. It contains
fictional sales data by region and month:

| Region | Month | Revenue | Orders | Returns |
|--------|-------|---------|--------|---------|
| North  | Jan   | 42000   | 310    | 12      |
| North  | Feb   | 38000   | 280    | 9       |
| North  | Mar   | 51000   | 380    | 15      |
| South  | Jan   | 31000   | 220    | 8       |
| South  | Feb   | 29000   | 210    | 7       |
| South  | Mar   | 39000   | 290    | 11      |
| East   | Jan   | 25000   | 180    | 5       |
| East   | Feb   | 27000   | 190    | 6       |
| East   | Mar   | 33000   | 240    | 9       |
| West   | Jan   | 48000   | 350    | 14      |
| West   | Feb   | 44000   | 320    | 12      |
| West   | Mar   | 56000   | 410    | 18      |

## What to do

1. Search [skills.sh](https://skills.sh) for "dashboard," "chart,"
   "data visualization," or "report." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill against `data.csv`.
4. Read the output critically (see below).

## Read the output critically

- Do the charts match the data in the CSV?
- Are the labels and units correct?
- Did it invent metrics or columns that aren't in the file?
- Does it work from a double-click with no install?
- Does it look readable at a narrow width (390px)?

Fix the overclaims. Keep or remove the skill.

## Checklist

- [ ] Searched skills.sh and found a dashboard or charting skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill against data.csv
- [ ] Verified the charts match the data
- [ ] Verified it works from a double-click
- [ ] Verified it looks readable at 390px
- [ ] Decided keep or remove