# Phase 4 — Generate an API spec from a data mapping

## The problem

You have a small data mapping and a bounded API design brief for the
`WeatherSignal` shape from Day 3. You need an API specification that
implements both sources without adding operations, fields, or security.

## The data mapping

```text
WeatherSignal {
  location: string
  latitude: number
  longitude: number
  timezone: string
  isFallback: boolean
  current: {
    temperature: number
    apparentTemperature: number
    humidity: number
    precipitation: number
    weatherCode: number
    windSpeed: number
    windDirection: number
    windGusts: number
    cloudCover: number
    pressure: number
    isDay: number
  }
  hourly: {
    time: string[24]
    temperature: number[24]
    precipitationProbability: number[24]
    precipitation: number[24]
    weatherCode: number[24]
    windSpeed: number[24]
  }
  daily: {
    date: string[7]
    temperatureMax: number[7]
    temperatureMin: number[7]
    precipitationSum: number[7]
    precipitationProbabilityMax: number[7]
    weatherCode: number[7]
    windSpeedMax: number[7]
    sunrise: string[7]
    sunset: string[7]
  }
}
```

## The API design brief

The fictional product owner approved this interface for the exercise:

- `GET /weather` retrieves one `WeatherSignal`.
- `latitude` and `longitude` are required numeric query parameters.
- A successful request returns `200` with `WeatherSignal`.
- Invalid coordinates return `400` with `{ code, message }`.
- Missing weather data returns `404` with `{ code, message }`.
- An unavailable upstream provider returns `502` with `{ code, message }`.
- The exercise does not define authentication.

## What to do

1. Search [skills.sh](https://skills.sh) for "API spec," "OpenAPI," or
   "Swagger." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill on the mapping and design brief above.
4. Validate the spec against both sources (see below).
5. Save the reviewed specification as valid raw YAML in `openapi.yaml`.
6. Save the reviewed specification to the Phase 0 Jira ticket as a
   comment, then fetch the ticket again and verify the stored content.

## Validate the spec against the sources

- Does every schema field trace to the mapping or approved error shape?
- Does every operation, parameter, and response trace to the design brief?
- Did it add endpoints, fields, responses, or auth schemes that aren't
  defined?

Fix the overclaims. Keep or remove the skill.

## Save the reviewed API specification to Jira

For this workshop, store the specification as a comment on the ticket
you created in Phase 0. Do not overwrite the ticket description or
change its workflow fields.

1. Save the corrected specification locally as `openapi.yaml`. The file
   must contain raw YAML, without Markdown headings or code fences.
2. Parse or lint `openapi.yaml` locally and fix every syntax error before
   publishing it.
3. Open the host-local Copilot Chat in **Agent** mode and ask it to
   prepare the Jira comment without writing it:

   ```text
   Using the Atlassian Jira tools, fetch <TICKET-KEY> and confirm its
   summary. Read #file:openapi.yaml and prepare a Jira comment titled
   "OpenAPI specification — WeatherSignal API" containing the complete
   reviewed YAML in a code block.

   Show me the exact target ticket and exact comment first. Do not write
   to Jira yet. Do not change the description, status, assignee, or any
   other ticket field. Do not rewrite or truncate the specification.
   ```

4. Confirm that the preview targets the intended ticket and contains
   the complete validated specification.
5. Approve the write explicitly:

   ```text
   Add exactly that approved OpenAPI comment to <TICKET-KEY>. Make no
   other Jira changes.
   ```

6. Ask Copilot to fetch the ticket and its latest comments again.
   Verify `openapi`, `info`, every path, every schema, and every response
   from the local file are present in the stored comment.

If the comment is truncated, altered, or blocked by Jira permissions,
do not claim it was saved. Keep the valid local file, capture the exact
blocked reason, and ask the facilitator.

## Checklist

- [ ] Searched skills.sh and found an API spec skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the data mapping and design brief
- [ ] Validated every field and operation against a source
- [ ] Fixed invented endpoints, responses, fields, or auth schemes
- [ ] Saved and syntax-checked the reviewed `openapi.yaml`
- [ ] Previewed and approved the exact Jira comment
- [ ] Fetched Jira again and verified the complete stored specification
- [ ] Decided keep or remove
