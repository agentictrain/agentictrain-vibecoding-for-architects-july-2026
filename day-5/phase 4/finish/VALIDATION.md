# WeatherSignal API — validation notes

- Every field in the `WeatherSignal` response schema traces back to the
  source mapping.
- Array cardinalities (24 for hourly and 7 for daily) match the mapping.
- No authentication scheme was added because the source does not define
  one.
- `GET /weather`, its latitude and longitude parameters, the error shape,
  and the 400, 404, and 502 responses trace to the approved exercise design
  brief.

## Claims removed

- ~~`POST /weather` for creating custom signals.~~ — Unsupported. The
  design brief has no create operation.
- ~~`securitySchemes: bearerAuth`~~ — Unsupported. The source defines no
  authentication scheme.

The reference `openapi.yaml` contains raw YAML and traces to both provided
sources, so it can be parsed, linted, reviewed, and copied to the workshop
Jira ticket without stripping Markdown wrappers first.
