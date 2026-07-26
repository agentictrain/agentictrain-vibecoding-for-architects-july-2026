const WeatherSignalApi = window.WeatherSignal;

if (!WeatherSignalApi) {
  throw new Error('WeatherSignal API failed to load.');
}

const SEARCH_DEBOUNCE_MS = 300;
const MAX_SEARCH_RESULTS = 5;
const SEARCH_MIN_LENGTH = 2;
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

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

const WMO_LABELS = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with light hail',
  99: 'Thunderstorm with hail'
};

const WMO_ICONS = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌦️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

const HOURLY_PAGE_SIZE = 8;
const HOURLY_DAY_START = 6;
const HOURLY_DAY_END = 19;

const state = {
  query: '',
  selectedLocation: null,
  scenario: '',
  unitSystem: 'metric',
  search: {
    results: [],
    status: 'idle',
    message: '',
    requestId: 0,
    controller: null
  },
  weather: {
    kind: 'empty',
    signal: null,
    rawResponse: null,
    failedRawResponse: null,
    error: '',
    sourceUrl: ''
  },
  activeAttemptId: 0,
  forecastController: null,
  evidence: {
    hourlyPage: 0,
    hourlyFilter: 'all',
    hourlySort: 'time',
    dayExpanded: {}
  }
};

const elements = {
  appStatus: document.querySelector('#app-status'),
  liveRegion: document.querySelector('#live-region'),
  weatherForm: document.querySelector('#weather-form'),
  locationQuery: document.querySelector('#location-query'),
  searchFeedback: document.querySelector('#search-feedback'),
  searchResultsPanel: document.querySelector('#search-results-panel'),
  searchResults: document.querySelector('#search-results'),
  selectedLocation: document.querySelector('#selected-location'),
  selectedLocationCopy: document.querySelector('#selected-location-copy'),
  selectionTag: document.querySelector('#selection-tag'),
  scenario: document.querySelector('#scenario'),
  scenarioEcho: document.querySelector('#scenario-echo'),
  unitSystem: document.querySelector('#unit-system'),
  fetchWeather: document.querySelector('#fetch-weather'),
  loadFallback: document.querySelector('#load-fallback'),
  weatherRegion: document.querySelector('#weather-region')
};

let searchDebounceHandle = 0;

bindEvents();
render();

function bindEvents() {
  elements.weatherForm.addEventListener('submit', handleFetchWeather);
  elements.locationQuery.addEventListener('input', handleLocationInput);
  elements.scenario.addEventListener('change', handleScenarioChange);
  elements.unitSystem.addEventListener('change', handleUnitSystemChange);
  elements.loadFallback.addEventListener('click', handleLoadFallback);
  elements.searchResults.addEventListener('click', handleLocationSelection);
  elements.weatherRegion.addEventListener('click', handleWeatherRegionClick);
}

function handleLocationInput(event) {
  const nextQuery = event.target.value;
  state.query = nextQuery;
  if (state.selectedLocation && nextQuery.trim() !== formatLocationLabel(state.selectedLocation)) {
    invalidateSelection();
  }

  clearTimeout(searchDebounceHandle);
  const trimmedQuery = nextQuery.trim();

  if (trimmedQuery.length < SEARCH_MIN_LENGTH) {
    abortSearch();
    state.search.results = [];
    state.search.status = trimmedQuery.length === 0 ? 'idle' : 'too-short';
    state.search.message =
      trimmedQuery.length === 0 ? '' : 'Type at least two characters to search.';
    render();
    return;
  }

  searchDebounceHandle = window.setTimeout(function runDebouncedSearch() {
    searchLocations(trimmedQuery);
  }, SEARCH_DEBOUNCE_MS);
}

function handleScenarioChange(event) {
  state.scenario = event.target.value;
  render();
}

function handleUnitSystemChange(event) {
  const previousUnitSystem = state.unitSystem;
  state.unitSystem = event.target.value;

  if (
    state.selectedLocation &&
    state.weather.kind === 'success' &&
    previousUnitSystem !== state.unitSystem
  ) {
    startForecastAttempt(state.selectedLocation);
    return;
  }

  render();
}

async function handleFetchWeather(event) {
  event.preventDefault();

  if (!state.selectedLocation || state.weather.kind === 'loading') {
    return;
  }

  await startForecastAttempt(state.selectedLocation);
}

function handleLoadFallback() {
  cancelForecastAttempt();
  resetEvidenceState();
  state.weather = {
    kind: 'fallback',
    signal: WeatherSignalApi.createFallbackSignal(),
    rawResponse: null,
    failedRawResponse: null,
    error: '',
    sourceUrl: 'bundled://fictional-weather-signal'
  };
  announce('Fictional fallback data loaded.');
  render();
}

function handleLocationSelection(event) {
  const button = event.target.closest('[data-location-index]');
  if (!button) {
    return;
  }

  const index = Number.parseInt(button.getAttribute('data-location-index'), 10);
  const nextLocation = state.search.results[index];
  if (!nextLocation) {
    return;
  }

  state.selectedLocation = nextLocation;
  state.query = formatLocationLabel(nextLocation);
  elements.locationQuery.value = state.query;
  state.search.results = [];
  state.search.status = 'selected';
  state.search.message = 'Location selected. Fetching weather automatically.';
  announce('Location selected. Fetching weather.');
  render();
  startForecastAttempt(nextLocation);
}

function handleWeatherRegionClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) {
    return;
  }
  const action = target.getAttribute('data-action');

  if (action === 'retry-weather' && state.selectedLocation) {
    startForecastAttempt(state.selectedLocation);
    return;
  }

  if (action === 'hourly-prev') {
    state.evidence.hourlyPage = Math.max(0, state.evidence.hourlyPage - 1);
    render();
    return;
  }

  if (action === 'hourly-next') {
    const signal = state.weather.signal;
    if (!signal) {
      return;
    }
    const total = filteredHourlyIndexes(signal).length;
    const maxPage = Math.max(0, Math.ceil(total / HOURLY_PAGE_SIZE) - 1);
    state.evidence.hourlyPage = Math.min(maxPage, state.evidence.hourlyPage + 1);
    render();
    return;
  }

  if (action === 'hourly-filter') {
    state.evidence.hourlyFilter = target.getAttribute('data-value') || 'all';
    state.evidence.hourlyPage = 0;
    render();
    return;
  }

  if (action === 'hourly-sort') {
    state.evidence.hourlySort = target.getAttribute('data-value') || 'time';
    state.evidence.hourlyPage = 0;
    render();
    return;
  }

  if (action === 'toggle-day') {
    const index = Number.parseInt(target.getAttribute('data-index'), 10);
    if (Number.isFinite(index)) {
      state.evidence.dayExpanded[index] = !state.evidence.dayExpanded[index];
      render();
    }
    return;
  }
}

async function searchLocations(query) {
  abortSearch();
  state.search.requestId += 1;
  const requestId = state.search.requestId;
  const controller = new AbortController();
  state.search.controller = controller;
  state.search.status = 'loading';
  state.search.message = 'Searching locations...';
  render();

  try {
    const response = await fetch(buildSearchUrl(query), {
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error('Location search failed.');
    }
    const payload = await response.json();
    if (requestId !== state.search.requestId) {
      return;
    }

    const results = Array.isArray(payload.results)
      ? payload.results.slice(0, MAX_SEARCH_RESULTS).map(normalizeLocationResult)
      : [];

    state.search.results = results;
    state.search.status = results.length > 0 ? 'ready' : 'empty';
    state.search.message = results.length > 0
      ? `${results.length} location ${results.length === 1 ? 'result' : 'results'} ready.`
      : 'No locations matched that query.';
    announce(state.search.message);
    render();
  } catch (error) {
    if (error.name === 'AbortError' || requestId !== state.search.requestId) {
      return;
    }
    state.search.results = [];
    state.search.status = 'error';
    state.search.message = 'Search error. Try another query or retry.';
    announce(state.search.message);
    render();
  }
}

async function startForecastAttempt(location) {
  cancelForecastAttempt();
  resetEvidenceState();
  state.activeAttemptId += 1;
  const attemptId = state.activeAttemptId;
  const controller = new AbortController();
  state.forecastController = controller;
  const sourceUrl = buildForecastUrl(location, state.unitSystem);

  state.weather = {
    kind: 'loading',
    signal: null,
    rawResponse: null,
    failedRawResponse: null,
    error: '',
    sourceUrl: sourceUrl
  };
  announce(`Fetching weather for ${formatLocationLabel(location)}.`);
  render();

  let rawResponse = null;
  try {
    const response = await fetch(sourceUrl, {
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Weather fetch failed with status ${response.status}.`);
    }

    rawResponse = await response.json();
    if (attemptId !== state.activeAttemptId) {
      return;
    }

    const signal = WeatherSignalApi.mapWeatherSignal(location, rawResponse, sourceUrl);
    state.weather = {
      kind: 'success',
      signal: signal,
      rawResponse: rawResponse,
      failedRawResponse: null,
      error: '',
      sourceUrl: sourceUrl
    };
    announce('Live weather loaded.');
    render();
  } catch (error) {
    if (error.name === 'AbortError' || attemptId !== state.activeAttemptId) {
      return;
    }

    const isPayloadError = Boolean(rawResponse);
    state.weather = {
      kind: 'error',
      signal: null,
      rawResponse: null,
      failedRawResponse: isPayloadError ? rawResponse : null,
      error: error.message || 'Weather fetch failed.',
      sourceUrl: sourceUrl
    };
    announce('Weather fetch failed. Retry is available.');
    render();
  }
}

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    name: query,
    count: String(MAX_SEARCH_RESULTS),
    language: 'en',
    format: 'json'
  });
  return `${GEOCODING_BASE_URL}?${params.toString()}`;
}

function buildForecastUrl(location, unitSystem) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    forecast_days: '7',
    timezone: 'auto'
  });

  if (unitSystem === 'imperial') {
    params.set('temperature_unit', 'fahrenheit');
    params.set('wind_speed_unit', 'mph');
    params.set('precipitation_unit', 'inch');
  }

  return `${FORECAST_BASE_URL}?${params.toString()}`;
}

function normalizeLocationResult(result) {
  return {
    id: result.id || `${result.name}-${result.latitude}-${result.longitude}`,
    name: String(result.name || '').trim(),
    admin1: typeof result.admin1 === 'string' && result.admin1.trim() ? result.admin1.trim() : '',
    country: String(result.country || '').trim(),
    latitude: Number(result.latitude),
    longitude: Number(result.longitude),
    timezone: typeof result.timezone === 'string' && result.timezone.trim() ? result.timezone.trim() : ''
  };
}

function invalidateSelection() {
  state.selectedLocation = null;
  state.weather = {
    kind: 'empty',
    signal: null,
    rawResponse: null,
    error: '',
    sourceUrl: ''
  };
  announce('Selected location cleared. Choose a location again.');
}

function abortSearch() {
  if (state.search.controller) {
    state.search.controller.abort();
    state.search.controller = null;
  }
}

function cancelForecastAttempt() {
  if (state.forecastController) {
    state.forecastController.abort();
    state.forecastController = null;
  }
}

function render() {
  renderHeader();
  renderSearch();
  renderSelection();
  renderControls();
  renderWeatherState();
  renderScenarioEcho();
}

function renderHeader() {
  const statusText = {
    empty: 'Select a location to load weather automatically.',
    loading: 'Loading weather evidence for the active attempt.',
    success: 'Live weather loaded.',
    fallback: 'Fictional fallback data is on screen. It is not live weather.',
    error: 'Weather fetch failed. Live evidence is not loaded.'
  }[state.weather.kind];
  elements.appStatus.textContent = statusText;
}

function renderSearch() {
  elements.locationQuery.setAttribute('aria-expanded', String(state.search.results.length > 0));
  elements.searchFeedback.textContent = state.search.message;

  elements.searchResults.replaceChildren();
  if (state.search.results.length === 0) {
    elements.searchResultsPanel.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  state.search.results.forEach(function appendResult(location, index) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const name = document.createElement('span');
    const meta = document.createElement('span');

    button.type = 'button';
    button.className = 'result-button';
    button.setAttribute('data-location-index', String(index));
    button.setAttribute('aria-label', formatLocationLabel(location));
    name.className = 'result-button__name';
    meta.className = 'result-button__meta';

    name.textContent = formatLocationLabel(location);
    meta.textContent = location.timezone || 'Timezone unavailable from geocoding';
    meta.setAttribute('aria-hidden', 'true');
    button.append(name, meta);
    item.appendChild(button);
    fragment.appendChild(item);
  });

  elements.searchResults.appendChild(fragment);
  elements.searchResultsPanel.hidden = false;
}

function renderSelection() {
  const hasSelection = Boolean(state.selectedLocation);
  elements.selectedLocation.classList.toggle('selection-card--empty', !hasSelection);

  if (!hasSelection) {
    elements.selectionTag.textContent = 'Not ready';
    elements.selectedLocationCopy.textContent =
      'Choose one search result to load weather automatically.';
    return;
  }

  const timezoneCopy = state.selectedLocation.timezone
    ? `Timezone: ${state.selectedLocation.timezone}.`
    : 'Timezone unavailable from geocoding. A fallback view would disclose UTC substitution.';

  elements.selectionTag.textContent = 'Selected';
  elements.selectedLocationCopy.textContent =
    `${formatLocationLabel(state.selectedLocation)}. ${formatCoordinates(state.selectedLocation)}. ${timezoneCopy}`;
}

function renderControls() {
  elements.fetchWeather.disabled = !state.selectedLocation || state.weather.kind === 'loading';
  elements.locationQuery.value = state.query;
  elements.scenario.value = state.scenario;
  elements.unitSystem.value = state.unitSystem;
}

function renderScenarioEcho() {
  if (!state.scenario) {
    elements.scenarioEcho.textContent = 'No scenario selected yet.';
    return;
  }

  elements.scenarioEcho.textContent =
    state.scenario === 'warehouse-planning'
      ? 'Warehouse planning selected. Stored for the later advisory phase.'
      : 'Delivery planning selected. Stored for the later advisory phase.';
}

function renderWeatherState() {
  elements.weatherRegion.setAttribute('aria-busy', String(state.weather.kind === 'loading'));

  switch (state.weather.kind) {
    case 'loading':
      elements.weatherRegion.replaceChildren(renderLoadingState());
      return;
    case 'success':
      elements.weatherRegion.replaceChildren(renderSignalState(state.weather.signal, state.weather.rawResponse));
      return;
    case 'fallback':
      elements.weatherRegion.replaceChildren(renderSignalState(state.weather.signal, null));
      return;
    case 'error':
      elements.weatherRegion.replaceChildren(renderErrorState());
      return;
    default:
      elements.weatherRegion.replaceChildren(renderEmptyState());
  }
}

function renderEmptyState() {
  const article = document.createElement('article');
  article.className = 'state-card state-card--empty';

  const title = document.createElement('h3');
  const copy = document.createElement('p');

  title.textContent = 'No weather loaded yet';
  copy.textContent =
    'Select a location to load weather automatically, or load the fictional fallback. No sample evidence is shown by default.';
  article.append(title, copy);
  return article;
}

function renderLoadingState() {
  const article = document.createElement('article');
  article.className = 'state-card state-card--loading';

  const title = document.createElement('h3');
  const copy = document.createElement('p');

  title.textContent = 'Loading weather evidence';
  copy.textContent =
    'The active attempt owns this region. Prior evidence is cleared until this request succeeds or fails.';
  article.append(title, copy);
  return article;
}

function renderErrorState() {
  const article = document.createElement('article');
  const title = document.createElement('h3');
  const copy = document.createElement('p');
  const actions = document.createElement('div');
  const retryButton = document.createElement('button');

  article.className = 'state-card state-card--error';
  article.setAttribute('role', 'alert');
  title.textContent = 'Live weather failed';
  copy.textContent = `${state.weather.error} Retry to start a new active attempt. The app does not auto-load fallback after failure.`;

  actions.className = 'state-card__actions';
  retryButton.type = 'button';
  retryButton.className = 'button button--ghost';
  retryButton.setAttribute('data-action', 'retry-weather');
  retryButton.disabled = !state.selectedLocation;
  retryButton.textContent = 'Retry live weather';

  actions.appendChild(retryButton);
  article.append(title, copy, actions);
  article.appendChild(renderFailedLiveRawBlock());
  return article;
}

function renderFailedLiveRawBlock() {
  const details = document.createElement('details');
  const wrapper = document.createElement('section');
  const summary = document.createElement('summary');
  const copy = document.createElement('p');
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  wrapper.className = 'json-panel';
  summary.textContent = 'Raw response';
  if (state.weather.failedRawResponse) {
    copy.textContent = 'Failed live response. The payload was received but rejected by mapping.';
    code.textContent = JSON.stringify(state.weather.failedRawResponse, null, 2);
  } else {
    copy.textContent = 'No response payload was received.';
    code.textContent = 'No response payload was received.';
  }

  pre.appendChild(code);
  wrapper.append(summary, copy, pre);
  details.appendChild(wrapper);
  return details;
}

function renderSignalState(signal, rawResponse) {
  const wrapper = document.createElement('div');
  wrapper.className = 'signal-shell';
  wrapper.append(
    renderSignalBanner(signal),
    renderCurrentCard(signal),
    renderProvenance(signal),
    renderHourlyBlock(signal),
    renderDailyBlock(signal)
  );
  if (signal.isFallback) {
    wrapper.appendChild(renderFallbackActions());
  }
  return wrapper;
}

function renderFallbackActions() {
  const actions = document.createElement('div');
  actions.className = 'state-card__actions';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.className = 'button button--ghost';
  retryButton.setAttribute('data-action', 'retry-weather');
  retryButton.disabled = !state.selectedLocation;
  retryButton.textContent = 'Retry live weather';

  actions.appendChild(retryButton);
  return actions;
}

function renderSignalBanner(signal) {
  const banner = document.createElement('section');
  const copyWrap = document.createElement('div');
  const title = document.createElement('p');
  const copy = document.createElement('p');
  const tag = document.createElement('span');

  banner.className = `signal-banner ${signal.isFallback ? 'signal-banner--fallback' : 'signal-banner--live'}`;
  title.className = 'signal-banner__title';
  copy.className = 'signal-banner__copy';
  tag.className = 'tag';

  title.textContent = signal.isFallback ? 'Fictional fallback data' : 'Live weather loaded';
  copy.textContent = signal.isFallback
    ? 'The live fetch failed. The values are a workshop example and are not actual weather for the selected place. Use Retry live weather to start a new active attempt.'
    : 'These values came from the active Open-Meteo forecast response and passed mapping.';
  tag.textContent = signal.evidenceMode;

  copyWrap.append(title, copy);
  banner.append(copyWrap, tag);
  return banner;
}

function renderCurrentCard(signal) {
  const section = document.createElement('section');
  const head = document.createElement('div');
  const title = document.createElement('h3');
  const location = document.createElement('p');
  const hero = document.createElement('div');
  const icon = document.createElement('span');
  const value = document.createElement('p');
  const summary = document.createElement('div');

  section.className = 'metric-card metric-card--hero';
  head.className = 'evidence-block__header';
  hero.className = 'metric-card__hero';
  icon.className = 'metric-card__icon';
  icon.setAttribute('aria-hidden', 'true');
  value.className = 'metric-card__value';
  summary.className = 'metric-card__summary';

  title.textContent = 'Current conditions';
  location.textContent = `${signal.location} at ${formatDateTime(signal.current.time)}`;
  icon.textContent = weatherCodeIcon(signal.current.weatherCode);
  value.textContent = formatWithUnit(signal.current.temperature, signal.current.units.temperature);

  [
    weatherCodeLabel(signal.current.weatherCode),
    `Feels like ${formatWithUnit(signal.current.apparentTemperature, signal.current.units.apparentTemperature)}`,
    `Wind ${formatWithUnit(signal.current.windSpeed, signal.current.units.windSpeed)}`,
    `Precipitation ${formatWithUnit(signal.current.precipitation, signal.current.units.precipitation)}`
  ].forEach(function appendPriorityChip(text) {
    const chip = document.createElement('span');
    chip.className = 'chip chip--priority';
    chip.textContent = text;
    summary.appendChild(chip);
  });

  hero.append(icon, value);
  head.append(title, location);
  section.append(head, hero, summary);
  section.appendChild(renderCurrentDetails(signal));
  return section;
}

function renderCurrentDetails(signal) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const grid = document.createElement('dl');

  details.className = 'current-details';
  summary.textContent = 'More current fields';
  grid.className = 'current-details__grid';

  [
    ['Day/Night', signal.current.isDay === 1 ? 'Day' : 'Night'],
    ['Gusts', formatWithUnit(signal.current.windGusts, signal.current.units.windGusts)],
    ['Humidity', formatWithUnit(signal.current.humidity, signal.current.units.humidity)],
    ['Cloud cover', formatWithUnit(signal.current.cloudCover, signal.current.units.cloudCover)],
    ['Pressure', formatWithUnit(signal.current.pressure, signal.current.units.pressure)]
  ].forEach(function appendDetail(entry) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = entry[0];
    description.textContent = entry[1];
    row.append(term, description);
    grid.appendChild(row);
  });

  details.append(summary, grid);
  return details;
}

function renderProvenance(signal) {
  const section = document.createElement('dl');
  section.className = 'provenance-list';
  [
    ['Evidence mode', signal.evidenceMode],
    ['Source kind', signal.sourceKind],
    ['Timezone', signal.timezone],
    ['Produced at', signal.producedAt],
    ['Coordinates', `${signal.latitude}, ${signal.longitude}`]
  ].forEach(function appendEntry(entry) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');

    term.textContent = entry[0];
    description.textContent = entry[1];
    row.append(term, description);
    section.appendChild(row);
  });
  return section;
}

function renderHourlyBlock(signal) {
  const section = document.createElement('section');
  const header = document.createElement('div');
  const title = document.createElement('h3');
  const copy = document.createElement('p');
  const controls = document.createElement('div');
  const filterGroup = document.createElement('div');
  const sortGroup = document.createElement('div');
  const sparklineWrap = document.createElement('div');
  const grid = document.createElement('div');
  const pager = document.createElement('div');

  section.className = 'evidence-block';
  header.className = 'evidence-block__header';
  title.className = 'evidence-block__title';
  copy.className = 'evidence-block__copy';
  controls.className = 'evidence-controls';
  filterGroup.className = 'segmented';
  sortGroup.className = 'segmented';
  sparklineWrap.className = 'sparkline-wrap';
  grid.className = 'timeline-grid';
  pager.className = 'pager';

  title.textContent = 'Next 24 hours';
  copy.textContent = 'Filter, sort, and page through the next 24 hours.';

  const filteredIndexes = filteredHourlyIndexes(signal);
  const total = filteredIndexes.length;
  const maxPage = Math.max(0, Math.ceil(total / HOURLY_PAGE_SIZE) - 1);
  const page = Math.min(state.evidence.hourlyPage, maxPage);
  const pageStart = page * HOURLY_PAGE_SIZE;
  const pageIndexes = filteredIndexes.slice(pageStart, pageStart + HOURLY_PAGE_SIZE);

  const filterOptions = [
    ['all', 'All'],
    ['day', 'Day'],
    ['night', 'Night']
  ];
  filterOptions.forEach(function appendFilter(option) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'segmented__btn';
    btn.setAttribute('data-action', 'hourly-filter');
    btn.setAttribute('data-value', option[0]);
    btn.setAttribute('aria-pressed', String(state.evidence.hourlyFilter === option[0]));
    btn.textContent = option[1];
    filterGroup.appendChild(btn);
  });

  const sortOptions = [
    ['time', 'Time'],
    ['temp-desc', 'Temp ↓'],
    ['temp-asc', 'Temp ↑'],
    ['precip-desc', 'Rain ↓']
  ];
  sortOptions.forEach(function appendSort(option) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'segmented__btn';
    btn.setAttribute('data-action', 'hourly-sort');
    btn.setAttribute('data-value', option[0]);
    btn.setAttribute('aria-pressed', String(state.evidence.hourlySort === option[0]));
    btn.textContent = option[1];
    sortGroup.appendChild(btn);
  });

  if (pageIndexes.length > 1) {
    sparklineWrap.appendChild(renderSparkline(signal, pageIndexes));
  }

  pageIndexes.forEach(function appendHour(index) {
    const card = document.createElement('article');
    const top = document.createElement('div');
    const hour = document.createElement('p');
    const icon = document.createElement('span');
    const temp = document.createElement('p');
    const meta = document.createElement('div');

    card.className = 'timeline-card';
    top.className = 'timeline-card__top';
    hour.className = 'timeline-card__time';
    icon.className = 'timeline-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    temp.className = 'timeline-card__temp';
    meta.className = 'timeline-card__meta';

    hour.textContent = formatHour(signal.hourly.time[index]);
    icon.textContent = weatherCodeIcon(signal.hourly.weatherCode[index]);
    temp.textContent = formatWithUnit(signal.hourly.temperature[index], signal.hourly.units.temperature);

    const precipLine = document.createElement('p');
    precipLine.textContent = `Rain ${formatWithUnit(signal.hourly.precipitationProbability[index], signal.hourly.units.precipitationProbability)}`;
    meta.appendChild(precipLine);

    top.append(hour, icon);
    card.append(top, temp, meta);
    grid.appendChild(card);
  });

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'pager__btn';
  prevBtn.setAttribute('data-action', 'hourly-prev');
  prevBtn.disabled = page === 0;
  prevBtn.textContent = '‹ Prev';

  const pageInfo = document.createElement('span');
  pageInfo.className = 'pager__info';
  pageInfo.textContent = total > 0 ? `Page ${page + 1} of ${maxPage + 1} · ${total} hours` : 'No hours match this filter';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'pager__btn';
  nextBtn.setAttribute('data-action', 'hourly-next');
  nextBtn.disabled = page >= maxPage;
  nextBtn.textContent = 'Next ›';

  pager.append(prevBtn, pageInfo, nextBtn);

  controls.append(filterGroup, sortGroup);
  header.append(title, copy);
  section.append(header, controls);
  if (sparklineWrap.children.length) {
    section.appendChild(sparklineWrap);
  }
  section.append(grid, pager);
  return section;
}

function renderDailyBlock(signal) {
  const section = document.createElement('section');
  const header = document.createElement('div');
  const title = document.createElement('h3');
  const copy = document.createElement('p');
  const grid = document.createElement('div');

  section.className = 'evidence-block';
  header.className = 'evidence-block__header';
  title.className = 'evidence-block__title';
  copy.className = 'evidence-block__copy';
  grid.className = 'day-grid';

  title.textContent = 'Next 7 days';
  copy.textContent = 'Tap a day to expand sunrise, sunset, wind, and precipitation details.';

  signal.daily.date.forEach(function appendDay(date, index) {
    const card = document.createElement('article');
    const top = document.createElement('button');
    const topHead = document.createElement('div');
    const weekday = document.createElement('p');
    const icon = document.createElement('span');
    const temp = document.createElement('p');
    const summary = document.createElement('p');
    const details = document.createElement('div');

    card.className = 'day-card';
    top.className = 'day-card__top';
    top.type = 'button';
    top.setAttribute('data-action', 'toggle-day');
    top.setAttribute('data-index', String(index));
    top.setAttribute('aria-expanded', String(Boolean(state.evidence.dayExpanded[index])));
    topHead.className = 'day-card__head';
    weekday.className = 'day-card__weekday';
    icon.className = 'day-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    temp.className = 'day-card__temp';
    summary.className = 'day-card__summary';
    details.className = 'day-card__details';

    weekday.textContent = formatWeekday(date);
    icon.textContent = weatherCodeIcon(signal.daily.weatherCode[index]);
    temp.textContent = `${formatWithUnit(signal.daily.temperatureMax[index], signal.daily.units.temperatureMax)} / ${formatWithUnit(signal.daily.temperatureMin[index], signal.daily.units.temperatureMin)}`;
    summary.textContent = `Rain ${formatWithUnit(signal.daily.precipitationProbabilityMax[index], signal.daily.units.precipitationProbabilityMax)}`;

    topHead.append(weekday, icon);
    top.append(topHead, temp, summary);

    if (state.evidence.dayExpanded[index]) {
      [
        weatherCodeLabel(signal.daily.weatherCode[index]),
        `Precipitation sum ${formatWithUnit(signal.daily.precipitationSum[index], signal.daily.units.precipitationSum)}`,
        `Max wind ${formatWithUnit(signal.daily.windSpeedMax[index], signal.daily.units.windSpeedMax)}`,
        `Sunrise ${formatClock(signal.daily.sunrise[index])}`,
        `Sunset ${formatClock(signal.daily.sunset[index])}`
      ].forEach(function appendLine(text) {
        const line = document.createElement('p');
        line.textContent = text;
        details.appendChild(line);
      });
    }

    card.append(top, details);
    grid.appendChild(card);
  });

  header.append(title, copy);
  section.append(header, grid);
  return section;
}

function formatLocationLabel(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function formatCoordinates(location) {
  return `Lat ${location.latitude.toFixed(2)}, Lon ${location.longitude.toFixed(2)}`;
}

function formatWithUnit(value, unit) {
  return `${formatNumber(value)}${unit ? ` ${unit}` : ''}`;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function weatherCodeLabel(code) {
  return WMO_LABELS[code] || `WMO code ${code}`;
}

function formatDateTime(value) {
  return value.replace('T', ' ');
}

function formatHour(value) {
  return value.split('T')[1] || value;
}

function formatClock(value) {
  return value.split('T')[1] || value;
}

function formatWeekday(value) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`));
}

function weatherCodeIcon(code) {
  return WMO_ICONS[code] || '🌡️';
}

function resetEvidenceState() {
  state.evidence.hourlyPage = 0;
  state.evidence.hourlyFilter = 'all';
  state.evidence.hourlySort = 'time';
  state.evidence.dayExpanded = {};
}

function isDaytimeHour(timeString) {
  const hourPart = (timeString.split('T')[1] || '').slice(0, 2);
  const hour = Number.parseInt(hourPart, 10);
  if (!Number.isFinite(hour)) {
    return true;
  }
  return hour >= HOURLY_DAY_START && hour <= HOURLY_DAY_END;
}

function filteredHourlyIndexes(signal) {
  const indexes = signal.hourly.time.map(function mapIndex(_, index) {
    return index;
  });
  const filtered = indexes.filter(function matchFilter(index) {
    if (state.evidence.hourlyFilter === 'all') {
      return true;
    }
    const isDay = isDaytimeHour(signal.hourly.time[index]);
    return state.evidence.hourlyFilter === 'day' ? isDay : !isDay;
  });
  if (state.evidence.hourlySort === 'temp-desc') {
    return filtered.slice().sort(function sortByTempDesc(a, b) {
      return signal.hourly.temperature[b] - signal.hourly.temperature[a];
    });
  }
  if (state.evidence.hourlySort === 'temp-asc') {
    return filtered.slice().sort(function sortByTempAsc(a, b) {
      return signal.hourly.temperature[a] - signal.hourly.temperature[b];
    });
  }
  if (state.evidence.hourlySort === 'precip-desc') {
    return filtered.slice().sort(function sortByPrecipDesc(a, b) {
      return signal.hourly.precipitationProbability[b] - signal.hourly.precipitationProbability[a];
    });
  }
  return filtered;
}

function renderSparkline(signal, pageIndexes) {
  const temps = pageIndexes.map(function tempOf(i) {
    return signal.hourly.temperature[i];
  });
  const unit = signal.hourly.units.temperature;
  const min = Math.min.apply(null, temps);
  const max = Math.max.apply(null, temps);
  const range = max - min || 1;
  const W = 300;
  const H = 60;
  const padX = 6;
  const padY = 10;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const step = temps.length > 1 ? innerW / (temps.length - 1) : 0;

  const points = temps.map(function toPoint(value, index) {
    const x = padX + index * step;
    const y = padY + innerH - ((value - min) / range) * innerH;
    return [x, y];
  });

  const lineD = points
    .map(function toLine(p, i) {
      return `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    })
    .join(' ');
  const areaD = `${lineD} L${points[points.length - 1][0].toFixed(1)},${(H - padY).toFixed(1)} L${points[0][0].toFixed(1)},${(H - padY).toFixed(1)} Z`;

  const svgNS = 'http://www.w3.org/2000/svg';
  const wrap = document.createElement('div');
  wrap.className = 'sparkline-card';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'sparkline');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Temperature trend from ${formatNumber(max)} to ${formatNumber(min)} ${unit}`);

  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'spark-grad');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');
  const stop1 = document.createElementNS(svgNS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'var(--accent)');
  stop1.setAttribute('stop-opacity', '0.35');
  const stop2 = document.createElementNS(svgNS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', 'var(--accent)');
  stop2.setAttribute('stop-opacity', '0.02');
  grad.append(stop1, stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const area = document.createElementNS(svgNS, 'path');
  area.setAttribute('d', areaD);
  area.setAttribute('fill', 'url(#spark-grad)');
  svg.appendChild(area);

  const line = document.createElementNS(svgNS, 'path');
  line.setAttribute('d', lineD);
  line.setAttribute('class', 'sparkline__path');
  svg.appendChild(line);

  points.forEach(function appendDot(p) {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', p[0].toFixed(1));
    dot.setAttribute('cy', p[1].toFixed(1));
    dot.setAttribute('r', '2');
    dot.setAttribute('class', 'sparkline__dot');
    svg.appendChild(dot);
  });

  const labels = document.createElement('div');
  labels.className = 'sparkline__labels';
  const high = document.createElement('span');
  high.className = 'sparkline__label sparkline__label--high';
  high.textContent = `▲ ${formatWithUnit(max, unit)}`;
  const low = document.createElement('span');
  low.className = 'sparkline__label sparkline__label--low';
  low.textContent = `▼ ${formatWithUnit(min, unit)}`;
  labels.append(high, low);

  wrap.append(svg, labels);
  return wrap;
}

function announce(message) {
  elements.liveRegion.textContent = '';
  window.setTimeout(function writeAnnouncement() {
    elements.liveRegion.textContent = message;
  }, 0);
}
