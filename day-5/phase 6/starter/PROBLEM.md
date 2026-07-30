# Phase 6 — Build a dashboard from a spreadsheet

## The problem

You have a CSV file with fictional operational data. You need a visual
dashboard a stakeholder can read — a Power BI replacement, built with
plain HTML/CSS/JS and no backend.

## The data

The CSV file is at `day-5/phase 6/starter/data.csv`. It contains
5,000 rows of deterministic, fictional order-batch data covering 2025.
Each row is one aggregated batch, not one individual order.

| Column | Type | Meaning |
| --- | --- | --- |
| `BatchId` | string | Unique batch identifier |
| `Date` | `YYYY-MM-DD` | Batch date in 2025 |
| `Region` | enum | North, South, East, or West |
| `Channel` | enum | Web, Retail, Partner, or Mobile |
| `Product` | enum | Product category |
| `Revenue` | integer | Batch revenue in whole fictional US dollars |
| `Orders` | integer | Orders represented by the batch |
| `Returns` | integer | Returned orders; never greater than `Orders` |

Inspect the scale and schema before sending the file to a skill:

```bash
wc -l day-5/phase\ 6/starter/data.csv
head -n 6 day-5/phase\ 6/starter/data.csv
shasum -a 256 day-5/phase\ 6/starter/data.csv
```

`wc -l` must report `5001`: one header plus 5,000 data rows. The dataset is
reproducible from `generate-data.mjs` with seed `20260730`. Its SHA-256 is
`52101afae5e4fb5ba26b7ceb28b03833757b1522b0c49fb72901672d2b195dc5`.
Do not regenerate it during the exercise.

## What to do

1. Search [skills.sh](https://skills.sh) for "dashboard," "chart,"
   "data visualization," or "report." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill against `data.csv`.
4. Require it to aggregate all rows rather than charting a sample.
5. Read the output critically (see below).

## Read the output critically

- Do the charts match the data in the CSV?
- Did it process all 5,000 rows or silently truncate/sample the file?
- Are the labels and units correct?
- Did it invent metrics or columns that aren't in the file?
- Is returns rate calculated as `SUM(Returns) / SUM(Orders)`, rather than
  averaging row-level percentages?
- Does it work from a double-click with no install?
- Does it look readable at a narrow width (390px)?
- Can you reach every chart and table with the keyboard and see a focus
  indicator?

Fix the overclaims. Keep or remove the skill.

Optional extension outside the two-hour route: Run Lighthouse
**Accessibility** and fix missing names, contrast, and landmarks until the
score reaches 100.

## Checklist

- [ ] Searched skills.sh and found a dashboard or charting skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill against data.csv
- [ ] Confirmed the dashboard processed all 5,000 rows
- [ ] Verified the charts match the data
- [ ] Verified the returns-rate denominator
- [ ] Verified it works from a double-click
- [ ] Verified it looks readable at 390px
- [ ] Verified keyboard access and visible focus
- [ ] Decided keep or remove

Optional extension:

- [ ] Reached a Lighthouse accessibility score of 100
