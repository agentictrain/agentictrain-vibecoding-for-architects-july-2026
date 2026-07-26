# Changed files

## 2026-07-22 city-search slice

- app/index.html: Refocused Region 1 on accessible city search, added combobox/listbox structure, search status/alert areas, and selected-location summary block.
- app/styles.css: Added city-search panel styling, suggestion-list styling, selected-location visuals, and preserved responsive behavior.
- app/app.js: Implemented debounced Open-Meteo city search, superseded request handling with AbortController, keyboard navigation, explicit selection, and status/error rendering.

## 2026-07-22 weather-fetch and mapping step

- app/weather-signal.js: Added atomic validation and mapping from Open-Meteo response blocks into bounded WeatherSignal output.
- app/app.js: Added forecast URL builder, active-attempt fetch flow, mapper integration, weather loading/success/error states, and readable/raw/mapped evidence rendering.
- app/index.html: Added Region 2 weather state containers and JSON viewers; loaded weather-signal.js before app.js.
- app/styles.css: Added weather state, readable evidence card, and JSON viewer styling.
- implementation/decisions.md: Added weather-fetch/mapping decisions.
- implementation/verify.md: Added weather-fetch/mapping verification outcomes and residual risk.

## 2026-07-22 fallback and retry step

- app/weather-signal.js: Added deterministic fictional weather-fallback-v1 builder and exported createFallbackSignal.
- app/app.js: Added automatic fallback transition after non-abort live failures, fallback banner content, failed-live raw labeling, and explicit retry actions for fallback and error-with-retry states.
- app/index.html: Added fallback banner block, retry button, and dynamic raw summary target in Region 2.
- app/styles.css: Added fallback banner and retry action styling.
- implementation/decisions.md: Added fallback/retry decisions.
- implementation/verify.md: Added fallback + retry verification and mobile-width check results.
