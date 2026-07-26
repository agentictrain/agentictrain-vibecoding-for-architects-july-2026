'use strict';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const APPROVED_MODEL = '';
const MAX_REVIEW_ITEMS = 6;

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'cloud_cover',
  'surface_pressure',
  'is_day'
];

const HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m'
];

const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'weather_code',
  'wind_speed_10m_max',
  'sunrise',
  'sunset'
];

const SCENARIOS = {
  warehouse: {
    name: 'Fictional warehouse planning',
    context: 'Plan staffing, yard activity, loading windows, and goods handling for a fictional warehouse.'
  },
  delivery: {
    name: 'Fictional delivery planning',
    context: 'Plan fictional local delivery routes, driver handoffs, loading windows, and schedule resilience.'
  }
};

const state = {
  selectedLocation: null,
  rawWeather: null,
  weatherSignal: null,
  weatherSource: null
};

const elements = {
  appStatus: document.querySelector('#app-status'),
  locationForm: document.querySelector('#location-form'),
  locationQuery: document.querySelector('#location-query'),
  searchButton: document.querySelector('#search-button'),
  locationResults: document.querySelector('#location-results'),
  selectedLocation: document.querySelector('#selected-location'),
  scenario: document.querySelector('#scenario'),
  endpoint: document.querySelector('#model-endpoint'),
  model: document.querySelector('#model-name'),
  credential: document.querySelector('#model-credential'),
  clearSettings: document.querySelector('#clear-settings'),
  fetchWeather: document.querySelector('#fetch-weather'),
  generateReview: document.querySelector('#generate-review'),
  weatherState: document.querySelector('#weather-state'),
  weatherStateLabel: document.querySelector('#weather-state-label'),
  weatherStateMessage: document.querySelector('#weather-state-message'),
  retryWeather: document.querySelector('#retry-weather'),
  useFallback: document.querySelector('#use-fallback'),
  weatherContent: document.querySelector('#weather-content'),
  sourceBadge: document.querySelector('#source-badge'),
  weatherLocation: document.querySelector('#weather-location'),
  currentConditions: document.querySelector('#current-conditions'),
  hourlyForecast: document.querySelector('#hourly-forecast'),
  dailyForecast: document.querySelector('#daily-forecast'),
  rawResponse: document.querySelector('#raw-response'),
  mappedSignal: document.querySelector('#mapped-signal'),
  reviewState: document.querySelector('#review-state'),
  reviewStateLabel: document.querySelector('#review-state-label'),
  reviewStateMessage: document.querySelector('#review-state-message'),
  retryReview: document.querySelector('#retry-review'),
  reviewContent: document.querySelector('#review-content'),
  reviewSummary: document.querySelector('#review-summary'),
  reviewRisks: document.querySelector('#review-risks'),
  reviewActions: document.querySelector('#review-actions'),
  reviewQuestions: document.querySelector('#review-questions'),
  reviewEvidence: document.querySelector('#review-evidence')
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function announce(message) {
  elements.appStatus.textContent = message;
}

function setBusy(button, isBusy, busyText, idleText) {
  button.disabled = isBusy;
  button.textContent = isBusy ? busyText : idleText;
}

function setWeatherState(type, label, message, options = {}) {
  elements.weatherState.className = `state-panel state-${type}`;
  elements.weatherStateLabel.textContent = label;
  elements.weatherStateMessage.textContent = message;
  elements.retryWeather.hidden = !options.retry;
  elements.useFallback.hidden = !options.fallback;
}

function setReviewState(type, label, message, retry = false) {
  elements.reviewState.className = `state-panel state-${type}`;
  elements.reviewStateLabel.textContent = label;
  elements.reviewStateMessage.textContent = message;
  elements.retryReview.hidden = !retry;
}

function clearModelSettings(announceChange = false) {
  elements.endpoint.value = '';
  elements.model.value = '';
  elements.credential.value = '';
  if (announceChange) announce('Runtime model settings cleared.');
}

function locationLabel(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function resetReview(message = 'Weather evidence is ready. Add runtime model settings to generate a review.') {
  elements.reviewContent.hidden = true;
  setReviewState('empty', 'Ready', message);
}

async function searchLocations(event) {
  event.preventDefault();
  const query = elements.locationQuery.value.trim();
  if (query.length < 2) {
    elements.locationQuery.reportValidity();
    return;
  }

  setBusy(elements.searchButton, true, 'Searching...', 'Search');
  elements.locationResults.replaceChildren(createElement('p', 'search-message', 'Searching public locations...'));
  announce('Searching Open-Meteo for public locations.');

  try {
    const url = new URL(GEOCODING_URL);
    url.searchParams.set('name', query);
    url.searchParams.set('count', '5');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo geocoding returned ${response.status}.`);
    const payload = await response.json();
    renderLocationResults(Array.isArray(payload.results) ? payload.results : []);
  } catch (error) {
    elements.locationResults.replaceChildren(
      createElement('p', 'search-message', 'Location search failed. Check the connection and try again.')
    );
    announce('Location search failed. Check the connection and try again.');
  } finally {
    setBusy(elements.searchButton, false, 'Searching...', 'Search');
  }
}

function renderLocationResults(locations) {
  elements.locationResults.replaceChildren();
  if (locations.length === 0) {
    elements.locationResults.append(createElement('p', 'search-message', 'No matching public locations found.'));
    announce('No matching public locations found.');
    return;
  }

  locations.forEach((location) => {
    const button = createElement('button', 'result-button');
    button.type = 'button';
    button.append(createElement('span', '', location.name));
    button.append(createElement('small', '', [location.admin1, location.country].filter(Boolean).join(', ')));
    button.addEventListener('click', () => selectLocation(location));
    elements.locationResults.append(button);
  });
  announce(`${locations.length} public location results found.`);
}

function selectLocation(location) {
  state.selectedLocation = {
    name: location.name,
    admin1: location.admin1 || '',
    country: location.country || '',
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || 'auto'
  };
  state.rawWeather = null;
  state.weatherSignal = null;
  state.weatherSource = null;
  elements.selectedLocation.textContent = `Selected: ${locationLabel(state.selectedLocation)}`;
  elements.locationResults.replaceChildren();
  elements.fetchWeather.disabled = false;
  elements.generateReview.disabled = true;
  elements.weatherContent.hidden = true;
  setWeatherState('empty', 'Empty', 'Location selected. Fetch live weather evidence when ready.');
  elements.reviewContent.hidden = true;
  setReviewState('empty', 'Empty', 'Fetch weather evidence before generating a review.');
  announce(`${locationLabel(state.selectedLocation)} selected.`);
}

function forecastUrl(location) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', CURRENT_FIELDS.join(','));
  url.searchParams.set('hourly', HOURLY_FIELDS.join(','));
  url.searchParams.set('daily', DAILY_FIELDS.join(','));
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');
  return url;
}

function assertWeatherPayload(payload) {
  if (!payload || !payload.current || !payload.hourly || !payload.daily) {
    throw new Error('Open-Meteo returned incomplete weather evidence.');
  }
  if (!Array.isArray(payload.hourly.time) || payload.hourly.time.length < 24) {
    throw new Error('Open-Meteo returned fewer than 24 hourly periods.');
  }
  if (!Array.isArray(payload.daily.time) || payload.daily.time.length < 7) {
    throw new Error('Open-Meteo returned fewer than 7 daily periods.');
  }
}

async function fetchWeather() {
  if (!state.selectedLocation) {
    announce('Select a public location before fetching weather.');
    return;
  }

  setBusy(elements.fetchWeather, true, 'Fetching...', 'Fetch weather');
  elements.generateReview.disabled = true;
  elements.weatherContent.hidden = true;
  setWeatherState('loading', 'Loading', 'Requesting current, hourly, and daily weather in one Open-Meteo call.');
  resetReview('Waiting for weather evidence.');
  announce('Fetching live weather evidence from Open-Meteo.');

  try {
    const response = await fetch(forecastUrl(state.selectedLocation));
    if (!response.ok) throw new Error(`Open-Meteo forecast returned ${response.status}.`);
    const payload = await response.json();
    assertWeatherPayload(payload);
    applyWeather(payload, 'live');
  } catch (error) {
    state.rawWeather = null;
    state.weatherSignal = null;
    state.weatherSource = null;
    setWeatherState(
      'error',
      'Live request failed',
      `${error.message} Retry live weather or explicitly use labeled fictional fallback data.`,
      { retry: true, fallback: true }
    );
    announce('Live weather request failed. Retry and fictional fallback options are available.');
  } finally {
    setBusy(elements.fetchWeather, false, 'Fetching...', 'Fetch weather');
    elements.fetchWeather.disabled = !state.selectedLocation;
  }
}

function mapSeries(values, unit, count) {
  return {
    values: Array.isArray(values) ? values.slice(0, count) : [],
    unit: unit || 'unknown'
  };
}

function mapCurrent(value, unit) {
  return { value: value ?? null, unit: unit || 'unknown' };
}

function mapWeatherSignal(payload, source) {
  const currentUnits = payload.current_units || {};
  const hourlyUnits = payload.hourly_units || {};
  const dailyUnits = payload.daily_units || {};
  const location = state.selectedLocation || {
    name: 'Fictional Workshop Location',
    admin1: '',
    country: 'Demo only',
    latitude: 0,
    longitude: 0
  };

  return {
    source: source === 'live' ? 'Open-Meteo live response' : 'Fictional deterministic fallback',
    location: {
      label: locationLabel(location),
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: payload.timezone || location.timezone || 'unknown'
    },
    current: {
      observedAt: mapCurrent(payload.current.time, 'ISO 8601 local time'),
      temperature: mapCurrent(payload.current.temperature_2m, currentUnits.temperature_2m),
      apparentTemperature: mapCurrent(payload.current.apparent_temperature, currentUnits.apparent_temperature),
      humidity: mapCurrent(payload.current.relative_humidity_2m, currentUnits.relative_humidity_2m),
      precipitation: mapCurrent(payload.current.precipitation, currentUnits.precipitation),
      weatherCode: mapCurrent(payload.current.weather_code, currentUnits.weather_code || 'WMO code'),
      windSpeed: mapCurrent(payload.current.wind_speed_10m, currentUnits.wind_speed_10m),
      windDirection: mapCurrent(payload.current.wind_direction_10m, currentUnits.wind_direction_10m),
      windGusts: mapCurrent(payload.current.wind_gusts_10m, currentUnits.wind_gusts_10m),
      cloudCover: mapCurrent(payload.current.cloud_cover, currentUnits.cloud_cover),
      pressure: mapCurrent(payload.current.surface_pressure, currentUnits.surface_pressure),
      dayOrNight: mapCurrent(payload.current.is_day === 1 ? 'day' : 'night', 'day/night')
    },
    hourly: {
      time: mapSeries(payload.hourly.time, 'ISO 8601 local time', 24),
      temperature: mapSeries(payload.hourly.temperature_2m, hourlyUnits.temperature_2m, 24),
      precipitationProbability: mapSeries(
        payload.hourly.precipitation_probability,
        hourlyUnits.precipitation_probability,
        24
      ),
      precipitation: mapSeries(payload.hourly.precipitation, hourlyUnits.precipitation, 24),
      weatherCode: mapSeries(payload.hourly.weather_code, hourlyUnits.weather_code || 'WMO code', 24),
      windSpeed: mapSeries(payload.hourly.wind_speed_10m, hourlyUnits.wind_speed_10m, 24)
    },
    daily: {
      time: mapSeries(payload.daily.time, 'ISO 8601 date', 7),
      temperatureMax: mapSeries(payload.daily.temperature_2m_max, dailyUnits.temperature_2m_max, 7),
      temperatureMin: mapSeries(payload.daily.temperature_2m_min, dailyUnits.temperature_2m_min, 7),
      precipitationSum: mapSeries(payload.daily.precipitation_sum, dailyUnits.precipitation_sum, 7),
      precipitationProbability: mapSeries(
        payload.daily.precipitation_probability_max,
        dailyUnits.precipitation_probability_max,
        7
      ),
      weatherCode: mapSeries(payload.daily.weather_code, dailyUnits.weather_code || 'WMO code', 7),
      windSpeedMax: mapSeries(payload.daily.wind_speed_10m_max, dailyUnits.wind_speed_10m_max, 7),
      sunrise: mapSeries(payload.daily.sunrise, dailyUnits.sunrise || 'ISO 8601 local time', 7),
      sunset: mapSeries(payload.daily.sunset, dailyUnits.sunset || 'ISO 8601 local time', 7)
    }
  };
}

function applyWeather(payload, source) {
  state.rawWeather = payload;
  state.weatherSource = source;
  state.weatherSignal = mapWeatherSignal(payload, source);
  renderWeather();
  elements.generateReview.disabled = false;
  resetReview();

  if (source === 'live') {
    setWeatherState('success', 'Live success', 'Live Open-Meteo evidence loaded and mapped into WeatherSignal.');
    announce('Live weather evidence loaded successfully.');
  } else {
    setWeatherState(
      'fallback',
      'Fictional fallback',
      'Deterministic fictional data is in use. It is not a successful live Open-Meteo response.'
    );
    announce('Clearly labeled fictional fallback weather is now in use.');
  }
}

function valueWithUnit(field) {
  if (field.value === null || field.value === undefined) return 'Unavailable';
  return `${field.value} ${field.unit}`;
}

function seriesValue(section, fieldName, index) {
  const field = section[fieldName];
  const value = field.values[index];
  return value === null || value === undefined ? 'Unavailable' : `${value} ${field.unit}`;
}

function formatTime(value, options) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, options).format(date);
}

function renderMetrics() {
  const current = state.weatherSignal.current;
  const metrics = [
    ['Temperature', current.temperature],
    ['Feels like', current.apparentTemperature],
    ['Humidity', current.humidity],
    ['Precipitation', current.precipitation],
    ['Weather code', current.weatherCode],
    ['Wind speed', current.windSpeed],
    ['Wind direction', current.windDirection],
    ['Wind gusts', current.windGusts],
    ['Cloud cover', current.cloudCover],
    ['Pressure', current.pressure],
    ['Light', current.dayOrNight]
  ];
  elements.currentConditions.replaceChildren();
  metrics.forEach(([label, field]) => {
    const wrapper = createElement('div', 'metric');
    wrapper.append(createElement('dt', '', label));
    wrapper.append(createElement('dd', '', valueWithUnit(field)));
    elements.currentConditions.append(wrapper);
  });
}

function addForecastRow(list, label, value) {
  const row = createElement('div');
  row.append(createElement('dt', '', label));
  row.append(createElement('dd', '', value));
  list.append(row);
}

function renderHourly() {
  const hourly = state.weatherSignal.hourly;
  elements.hourlyForecast.replaceChildren();
  hourly.time.values.forEach((time, index) => {
    const card = createElement('article', 'forecast-card');
    card.append(createElement('time', '', formatTime(time, { weekday: 'short', hour: 'numeric' })));
    const list = createElement('dl');
    addForecastRow(list, 'Temperature', seriesValue(hourly, 'temperature', index));
    addForecastRow(list, 'Rain chance', seriesValue(hourly, 'precipitationProbability', index));
    addForecastRow(list, 'Precipitation', seriesValue(hourly, 'precipitation', index));
    addForecastRow(list, 'Weather code', seriesValue(hourly, 'weatherCode', index));
    addForecastRow(list, 'Wind', seriesValue(hourly, 'windSpeed', index));
    card.append(list);
    elements.hourlyForecast.append(card);
  });
}

function renderDaily() {
  const daily = state.weatherSignal.daily;
  elements.dailyForecast.replaceChildren();
  daily.time.values.forEach((time, index) => {
    const card = createElement('article', 'forecast-card');
    card.append(createElement('time', '', formatTime(`${time}T12:00:00`, { weekday: 'short', month: 'short', day: 'numeric' })));
    const list = createElement('dl');
    addForecastRow(list, 'High', seriesValue(daily, 'temperatureMax', index));
    addForecastRow(list, 'Low', seriesValue(daily, 'temperatureMin', index));
    addForecastRow(list, 'Rain total', seriesValue(daily, 'precipitationSum', index));
    addForecastRow(list, 'Rain chance', seriesValue(daily, 'precipitationProbability', index));
    addForecastRow(list, 'Weather code', seriesValue(daily, 'weatherCode', index));
    addForecastRow(list, 'Max wind', seriesValue(daily, 'windSpeedMax', index));
    addForecastRow(list, 'Sunrise', formatTime(daily.sunrise.values[index], { hour: 'numeric', minute: '2-digit' }));
    addForecastRow(list, 'Sunset', formatTime(daily.sunset.values[index], { hour: 'numeric', minute: '2-digit' }));
    card.append(list);
    elements.dailyForecast.append(card);
  });
}

function renderWeather() {
  elements.weatherContent.hidden = false;
  elements.sourceBadge.textContent = state.weatherSource === 'live' ? 'Live Open-Meteo' : 'Fictional fallback';
  elements.sourceBadge.className = state.weatherSource === 'live' ? 'source-badge' : 'source-badge fallback';
  elements.weatherLocation.textContent = state.weatherSignal.location.label;
  renderMetrics();
  renderHourly();
  renderDaily();
  elements.rawResponse.textContent = JSON.stringify(state.rawWeather, null, 2);
  elements.mappedSignal.textContent = JSON.stringify(state.weatherSignal, null, 2);
}

function createFallbackPayload() {
  const hours = Array.from({ length: 24 }, (_, index) => `2026-01-15T${String(index).padStart(2, '0')}:00`);
  const days = Array.from({ length: 7 }, (_, index) => `2026-01-${String(15 + index).padStart(2, '0')}`);
  const temperatures = hours.map((_, index) => Number((7 + Math.sin(index / 4) * 3).toFixed(1)));

  return {
    fictionalFallback: true,
    fallbackNotice: 'Deterministic workshop data. Not returned by Open-Meteo.',
    latitude: state.selectedLocation?.latitude ?? 0,
    longitude: state.selectedLocation?.longitude ?? 0,
    timezone: state.selectedLocation?.timezone || 'Europe/London',
    current_units: {
      temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', precipitation: 'mm',
      weather_code: 'WMO code', wind_speed_10m: 'km/h', wind_direction_10m: '°', wind_gusts_10m: 'km/h',
      cloud_cover: '%', surface_pressure: 'hPa', is_day: ''
    },
    current: {
      time: '2026-01-15T09:00', temperature_2m: 7.8, apparent_temperature: 4.6, relative_humidity_2m: 82,
      precipitation: 0.4, weather_code: 61, wind_speed_10m: 22, wind_direction_10m: 245,
      wind_gusts_10m: 39, cloud_cover: 88, surface_pressure: 1008, is_day: 1
    },
    hourly_units: {
      temperature_2m: '°C', precipitation_probability: '%', precipitation: 'mm', weather_code: 'WMO code',
      wind_speed_10m: 'km/h'
    },
    hourly: {
      time: hours,
      temperature_2m: temperatures,
      precipitation_probability: hours.map((_, index) => (index < 8 ? 65 : index < 16 ? 35 : 20)),
      precipitation: hours.map((_, index) => (index % 5 === 0 ? 0.6 : 0.1)),
      weather_code: hours.map((_, index) => (index < 10 ? 61 : 3)),
      wind_speed_10m: hours.map((_, index) => 18 + (index % 6) * 2)
    },
    daily_units: {
      temperature_2m_max: '°C', temperature_2m_min: '°C', precipitation_sum: 'mm',
      precipitation_probability_max: '%', weather_code: 'WMO code', wind_speed_10m_max: 'km/h',
      sunrise: '', sunset: ''
    },
    daily: {
      time: days,
      temperature_2m_max: [10, 9, 8, 11, 12, 10, 9],
      temperature_2m_min: [4, 3, 2, 5, 6, 4, 3],
      precipitation_sum: [4.2, 1.1, 0.2, 3.4, 0, 0.6, 2.1],
      precipitation_probability_max: [75, 50, 20, 65, 10, 30, 55],
      weather_code: [61, 51, 3, 61, 2, 51, 61],
      wind_speed_10m_max: [39, 32, 24, 35, 20, 22, 31],
      sunrise: days.map((day) => `${day}T08:01`),
      sunset: days.map((day) => `${day}T16:23`)
    }
  };
}

function useFallbackWeather() {
  applyWeather(createFallbackPayload(), 'fallback');
}

function chatCompletionsUrl(endpoint) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:') throw new Error('The approved endpoint must use HTTPS.');
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Use an endpoint without credentials, query parameters, or fragments.');
  }
  const path = url.pathname.replace(/\/+$/, '');
  if (path.endsWith('/chat/completions')) return url.toString();
  url.pathname = path.endsWith('/v1') ? `${path}/chat/completions` : `${path}/v1/chat/completions`;
  return url.toString();
}

function readModelSettings() {
  const endpoint = elements.endpoint.value.trim();
  const model = elements.model.value.trim();
  const credential = elements.credential.value;
  if (!endpoint || !model || !credential) {
    throw new Error('Enter the endpoint, model name, and temporary demo credential.');
  }
  return { url: chatCompletionsUrl(endpoint), model, credential };
}

function buildReviewMessages() {
  const scenario = SCENARIOS[elements.scenario.value];
  return [
    {
      role: 'system',
      content: [
        'You are a bounded workshop architecture assistant.',
        'Use only the supplied fictional scenario and WeatherSignal.',
        'Return one JSON object with exactly five keys: summary, risks, actions, questions, evidence.',
        'summary must be a non-empty string.',
        'risks, actions, questions, and evidence must each be arrays of 1 to 6 non-empty strings.',
        'Evidence entries must name WeatherSignal field paths that support a review claim.',
        'Do not claim approval, certainty, production readiness, or facts outside the supplied evidence.'
      ].join(' ')
    },
    {
      role: 'user',
      content: JSON.stringify({
        scenario: { name: scenario.name, context: scenario.context },
        weatherSignal: state.weatherSignal
      })
    }
  ];
}

function parseReviewContent(content) {
  if (typeof content === 'object' && content !== null) return content;
  if (typeof content !== 'string') throw new Error('The model response did not contain JSON content.');
  return JSON.parse(content.trim());
}

function validateStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_REVIEW_ITEMS) {
    throw new Error(`${fieldName} must contain 1 to ${MAX_REVIEW_ITEMS} items.`);
  }
  if (value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    throw new Error(`${fieldName} must contain only non-empty text items.`);
  }
  return value.map((item) => item.trim());
}

function validateReview(value) {
  const expectedKeys = ['actions', 'evidence', 'questions', 'risks', 'summary'];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The model response is not a JSON object.');
  }
  const keys = Object.keys(value).sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error('The model response must contain exactly summary, risks, actions, questions, and evidence.');
  }
  if (typeof value.summary !== 'string' || value.summary.trim() === '') {
    throw new Error('Summary must be non-empty text.');
  }
  return {
    summary: value.summary.trim(),
    risks: validateStringArray(value.risks, 'Risks'),
    actions: validateStringArray(value.actions, 'Actions'),
    questions: validateStringArray(value.questions, 'Questions'),
    evidence: validateStringArray(value.evidence, 'Evidence')
  };
}

async function generateReview() {
  if (!state.weatherSignal) {
    announce('Fetch weather evidence before generating a review.');
    return;
  }

  let settings;
  try {
    settings = readModelSettings();
  } catch (error) {
    setReviewState('error', 'Settings required', error.message, true);
    elements.reviewContent.hidden = true;
    announce(error.message);
    return;
  }

  setBusy(elements.generateReview, true, 'Generating...', 'Generate review');
  setReviewState('loading', 'Loading', 'Sending only the fictional scenario and mapped WeatherSignal for review.');
  elements.reviewContent.hidden = true;
  announce('Generating a bounded weather-grounded review.');

  try {
    const response = await fetch(settings.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.credential}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: buildReviewMessages(),
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });
    if (!response.ok) throw new Error(`The model endpoint returned ${response.status}.`);
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const review = validateReview(parseReviewContent(content));
    renderReview(review);
    setReviewState('success', 'Success', 'Validated model JSON rendered as workshop-only advisory output.');
    announce('Weather-grounded review generated and validated.');
  } catch (error) {
    setReviewState('error', 'Review failed', `${error.message} Weather evidence remains available.`, true);
    elements.reviewContent.hidden = true;
    announce('Review generation failed. Weather evidence remains available and retry is ready.');
  } finally {
    settings.credential = '';
    setBusy(elements.generateReview, false, 'Generating...', 'Generate review');
    elements.generateReview.disabled = !state.weatherSignal;
  }
}

function renderList(element, items) {
  element.replaceChildren();
  items.forEach((item) => element.append(createElement('li', '', item)));
}

function renderReview(review) {
  elements.reviewSummary.textContent = review.summary;
  renderList(elements.reviewRisks, review.risks);
  renderList(elements.reviewActions, review.actions);
  renderList(elements.reviewQuestions, review.questions);
  renderList(elements.reviewEvidence, review.evidence);
  elements.reviewContent.hidden = false;
}

function handleScenarioChange() {
  if (state.weatherSignal) resetReview('Scenario changed. Generate a new review from the existing weather evidence.');
  announce(`${SCENARIOS[elements.scenario.value].name} selected.`);
}

function bindEvents() {
  elements.locationForm.addEventListener('submit', searchLocations);
  elements.fetchWeather.addEventListener('click', fetchWeather);
  elements.retryWeather.addEventListener('click', fetchWeather);
  elements.useFallback.addEventListener('click', useFallbackWeather);
  elements.generateReview.addEventListener('click', generateReview);
  elements.retryReview.addEventListener('click', generateReview);
  elements.clearSettings.addEventListener('click', () => clearModelSettings(true));
  elements.scenario.addEventListener('change', handleScenarioChange);
  window.addEventListener('pageshow', () => clearModelSettings(false));
}

function start() {
  clearModelSettings(false);
  bindEvents();
}

start();
