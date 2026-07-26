# Integration Architecture Copilot MVP

## Goal

Build the disposable, double-clickable workshop app described in the approved
brief. It turns one public Open-Meteo location and one fictional planning
scenario into a validated, weather-grounded advisory review.

## MVP

1. Search and select a public location with Open-Meteo geocoding.
2. Fetch current, hourly, and daily weather in one forecast request.
3. Map and show readable evidence, the raw response, and WeatherSignal.
4. Offer clearly labeled deterministic fictional fallback data only after a
   live request fails.
5. Read model endpoint, model name, and credential at request time; keep them
   out of persistent browser storage and clear all three on reload.
6. Request strict JSON from the approved OpenAI-compatible chat-completions
   endpoint, validate its five required fields, and render the advisory.
7. Verify syntax, the main browser flow, failure states, and 320 px layout.

## Out of scope

Production use, persistence, internal data, approval automation, accounts,
analytics, deployment, diagrams, and any data source beyond Open-Meteo and the
runtime-configured approved model endpoint.

## Assumptions

- The runtime endpoint is either an API base URL or a full chat-completions URL.
- Browser CORS policy may prevent a configured model endpoint from being called;
  this must appear as a recoverable model error without damaging weather data.
- Fallback use is an explicit participant action after a live weather failure.
