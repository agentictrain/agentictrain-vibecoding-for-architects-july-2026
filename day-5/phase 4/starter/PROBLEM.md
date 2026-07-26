# Phase 4 — Generate an API spec from a data mapping

## The problem

You have a small data mapping — the `WeatherSignal` shape from Day 3.
You need an API spec with endpoints, request/response shapes, and error
codes.

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

## What to do

1. Search [skills.sh](https://skills.sh) for "API spec," "OpenAPI," or
   "Swagger." Find a candidate skill.
2. Inspect the source, then install it.
3. Open Copilot and run the skill on the mapping above.
4. Validate the spec against the mapping (see below).

## Validate the spec against the mapping

- Does every field in the spec trace back to the mapping?
- Did it invent endpoints or fields that don't exist in the source?
- Did it add auth schemes the PoC doesn't have?
- Are the error codes sensible or invented?

Fix the overclaims. Keep or remove the skill.

## Checklist

- [ ] Searched skills.sh and found an API spec skill
- [ ] Inspected the source files before installing
- [ ] Ran the skill on the data mapping
- [ ] Validated every field traces back to the mapping
- [ ] Fixed invented endpoints, fields, or auth schemes
- [ ] Decided keep or remove