# Application files

- `index.html` defines the static shell, the three visible regions, the search
  result container, and the evidence mounting point.
- `styles.css` provides the responsive three-panel layout, live versus fallback
  banners, JSON viewers, and visible focus treatment.
- `app.js` owns in-memory state, geocoding search, forecast fetch orchestration,
  review request lifecycle, rendering, retry, and explicit fallback loading.
- `weather-signal.js` exposes the pure WeatherSignal validator/mapper and the
  deterministic fictional fallback factory.
- `review.js` exposes the Groq chat-completions request and strict
  five-field review validator. It loads after `weather-signal.js` and before
  `app.js` as a normal script, with no imports or build step.

Open `index.html` in a browser to inspect the complete static PoC. The page has
no build step and no persistence.
