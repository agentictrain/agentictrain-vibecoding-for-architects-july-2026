const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 2;
const SEARCH_MAX_RESULTS = 5;
const FORECAST_DAYS = 7;

const FORECAST_CURRENT_FIELDS = [
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

const FORECAST_HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m'
];

const FORECAST_DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'weather_code',
  'wind_speed_10m_max',
  'sunrise',
  'sunset'
];

const state = {
  query: '',
  selectedLocation: null,
  weatherAttemptId: 0,
  weatherController: null,
  weather: {
    kind: 'empty',
    message: '',
    sourceUrl: '',
    rawPayload: null,
    mappedSignal: null
  },
  search: {
    isLoading: false,
    results: [],
    error: '',
    activeIndex: -1,
    requestId: 0,
    controller: null,
    debounceTimer: null
  }
};

const ui = {
  starterStatus: document.querySelector('#starter-status'),
  searchInput: document.querySelector('#location-query'),
  searchResults: document.querySelector('#location-suggestions'),
  searchStatus: document.querySelector('#search-status'),
  searchAlert: document.querySelector('#search-alert'),
  selectedLocation: document.querySelector('#selected-location'),
  fetchWeatherButton: document.querySelector('#fetch-weather'),
  weatherStatus: document.querySelector('#weather-status'),
  weatherError: document.querySelector('#weather-error'),
  weatherEmpty: document.querySelector('#weather-empty'),
  weatherLoading: document.querySelector('#weather-loading'),
  weatherSuccess: document.querySelector('#weather-success'),
  weatherReadable: document.querySelector('#weather-readable'),
  weatherRawJson: document.querySelector('#weather-raw-json'),
  weatherMappedJson: document.querySelector('#weather-mapped-json')
};

function buildSearchUrl(query) {
  const params = new URLSearchParams({
    name: query,
    count: String(SEARCH_MAX_RESULTS),
    language: 'en',
    format: 'json'
  });

  return `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
}

function formatLocationName(location) {
  const parts = [location.name];

  if (location.admin1) {
    parts.push(location.admin1);
  }

  parts.push(location.country);
  return parts.join(', ');
}

function normalizeSearchResults(payload) {
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results
    .filter((entry) => (
      typeof entry?.name === 'string'
      && typeof entry?.country === 'string'
      && Number.isFinite(entry?.latitude)
      && Number.isFinite(entry?.longitude)
    ))
    .slice(0, SEARCH_MAX_RESULTS)
    .map((entry) => ({
      id: entry.id ?? null,
      name: entry.name,
      admin1: typeof entry.admin1 === 'string' ? entry.admin1 : '',
      country: entry.country,
      latitude: entry.latitude,
      longitude: entry.longitude,
      timezone: typeof entry.timezone === 'string' ? entry.timezone : ''
    }));
}

async function searchLocations(query, requestId) {
  const url = buildSearchUrl(query);

  if (state.search.controller) {
    state.search.controller.abort();
  }

  state.search.controller = new AbortController();
  state.search.isLoading = true;
  state.search.error = '';
  state.search.activeIndex = -1;
  renderSearchState();

  try {
    const response = await fetch(url, { signal: state.search.controller.signal });

    if (!response.ok) {
      throw new Error(`Search failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();

    if (requestId !== state.search.requestId) {
      return;
    }

    state.search.results = normalizeSearchResults(payload);
    state.search.isLoading = false;
    state.search.error = '';
    renderSearchState();
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    if (requestId !== state.search.requestId) {
      return;
    }

    state.search.results = [];
    state.search.isLoading = false;
    state.search.error = error.message || 'Search failed.';
    renderSearchState();
  }
}

function clearSearchResults() {
  if (state.search.controller) {
    state.search.controller.abort();
  }

  state.search.results = [];
  state.search.error = '';
  state.search.isLoading = false;
  state.search.activeIndex = -1;
  renderSearchState();
}

function setWeatherState(nextWeatherState) {
  state.weather = {
    ...state.weather,
    ...nextWeatherState
  };

  renderWeatherState();
  renderSelectedLocation();
}

function resetWeatherEvidence() {
  if (state.weatherController) {
    state.weatherController.abort();
    state.weatherController = null;
  }

  setWeatherState({
    kind: 'empty',
    message: '',
    sourceUrl: '',
    rawPayload: null,
    mappedSignal: null
  });
}

function onQueryInput(event) {
  const nextQuery = event.target.value.trim();
  const changedAfterSelection = Boolean(
    state.selectedLocation && nextQuery !== state.selectedLocation.name
  );

  state.query = nextQuery;

  if (changedAfterSelection) {
    state.selectedLocation = null;
    resetWeatherEvidence();
  }

  if (state.search.debounceTimer) {
    clearTimeout(state.search.debounceTimer);
  }

  if (nextQuery.length < SEARCH_MIN_CHARS) {
    clearSearchResults();
    renderSelectedLocation();
    return;
  }

  state.search.debounceTimer = setTimeout(() => {
    state.search.requestId += 1;
    searchLocations(nextQuery, state.search.requestId);
  }, SEARCH_DEBOUNCE_MS);

  renderSelectedLocation();
}

function setActiveSuggestion(nextIndex) {
  if (!state.search.results.length) {
    state.search.activeIndex = -1;
    renderSearchState();
    return;
  }

  const boundedIndex = Math.max(0, Math.min(nextIndex, state.search.results.length - 1));
  state.search.activeIndex = boundedIndex;
  renderSearchState();
}

function onQueryKeyDown(event) {
  if (!state.search.results.length) {
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActiveSuggestion(state.search.activeIndex + 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActiveSuggestion(state.search.activeIndex - 1);
    return;
  }

  if (event.key === 'Enter' && state.search.activeIndex >= 0) {
    event.preventDefault();
    selectLocation(state.search.results[state.search.activeIndex]);
    return;
  }

  if (event.key === 'Escape') {
    clearSearchResults();
  }
}

function selectLocation(location) {
  state.selectedLocation = location;
  state.query = location.name;
  ui.searchInput.value = location.name;
  state.search.results = [];
  state.search.activeIndex = -1;
  state.search.error = '';
  state.search.isLoading = false;
  resetWeatherEvidence();
  renderSearchState();
  renderSelectedLocation();
}

function buildForecastUrl(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
    current: FORECAST_CURRENT_FIELDS.join(','),
    hourly: FORECAST_HOURLY_FIELDS.join(','),
    daily: FORECAST_DAILY_FIELDS.join(',')
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchWeatherForSelectedLocation() {
  if (!state.selectedLocation || state.weather.kind === 'loading') {
    return;
  }

  if (state.weatherController) {
    state.weatherController.abort();
  }

  state.weatherAttemptId += 1;
  const attemptId = state.weatherAttemptId;
  const sourceUrl = buildForecastUrl(state.selectedLocation);
  const controller = new AbortController();

  state.weatherController = controller;
  setWeatherState({
    kind: 'loading',
    message: 'Fetching weather evidence.',
    sourceUrl,
    rawPayload: null,
    mappedSignal: null
  });

  try {
    const response = await fetch(sourceUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Weather request failed with HTTP ${response.status}.`);
    }

    const rawPayload = await response.json();

    if (attemptId !== state.weatherAttemptId) {
      return;
    }

    const mappedSignal = window.WeatherSignal.mapWeatherSignal(
      state.selectedLocation,
      rawPayload,
      sourceUrl
    );

    setWeatherState({
      kind: 'success',
      message: 'Live weather loaded and mapped.',
      sourceUrl,
      rawPayload,
      mappedSignal
    });

    state.weatherController = null;
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    if (attemptId !== state.weatherAttemptId) {
      return;
    }

    setWeatherState({
      kind: 'error',
      message: error.message || 'Weather fetch failed.',
      rawPayload: null,
      mappedSignal: null
    });

    state.weatherController = null;
  }
}

function renderReadableWeather(signal) {
  ui.weatherReadable.replaceChildren();

  const grid = document.createElement('div');
  grid.className = 'weather-readable-grid';

  const cards = [
    ['Location', signal.location],
    ['Timezone', signal.timezone],
    ['Current temperature', `${signal.current.temperature} ${signal.current.units.temperature}`],
    ['Current precipitation', `${signal.current.precipitation} ${signal.current.units.precipitation}`],
    ['Current wind speed', `${signal.current.windSpeed} ${signal.current.units.windSpeed}`],
    ['Current weather code', String(signal.current.weatherCode)],
    ['Hourly entries', String(signal.hourly.time.length)],
    ['Daily entries', String(signal.daily.date.length)]
  ];

  cards.forEach(([label, value]) => {
    const card = document.createElement('article');
    const labelNode = document.createElement('p');
    const valueNode = document.createElement('p');

    card.className = 'weather-readable-item';
    labelNode.className = 'weather-readable-label';
    valueNode.className = 'weather-readable-value';

    labelNode.textContent = label;
    valueNode.textContent = value;

    card.append(labelNode, valueNode);
    grid.append(card);
  });

  const sourceLine = document.createElement('p');
  sourceLine.className = 'field-note';
  sourceLine.textContent = `Source URL: ${signal.sourceUrl}`;

  ui.weatherReadable.append(grid, sourceLine);
}

function renderWeatherState() {
  const { kind, message, rawPayload, mappedSignal } = state.weather;

  ui.weatherError.hidden = true;
  ui.weatherError.textContent = '';

  ui.weatherEmpty.hidden = true;
  ui.weatherLoading.hidden = true;
  ui.weatherSuccess.hidden = true;

  if (kind === 'loading') {
    ui.weatherStatus.textContent = 'Loading weather evidence...';
    ui.weatherLoading.hidden = false;
    ui.starterStatus.textContent = 'Fetching weather for the selected location.';
    return;
  }

  if (kind === 'error') {
    ui.weatherStatus.textContent = 'Weather request failed. Fix the issue and try again.';
    ui.weatherError.hidden = false;
    ui.weatherError.textContent = message;
    ui.weatherEmpty.hidden = false;
    ui.starterStatus.textContent = 'Weather fetch failed. No WeatherSignal emitted.';
    return;
  }

  if (kind === 'success') {
    ui.weatherStatus.textContent = 'Live weather loaded and mapped to WeatherSignal.';
    ui.weatherSuccess.hidden = false;
    renderReadableWeather(mappedSignal);
    ui.weatherRawJson.textContent = JSON.stringify(rawPayload, null, 2);
    ui.weatherMappedJson.textContent = JSON.stringify(mappedSignal, null, 2);
    ui.starterStatus.textContent = 'Weather fetch succeeded. Review raw and mapped evidence.';
    return;
  }

  ui.weatherStatus.textContent = 'Select a location, then fetch weather.';
  ui.weatherEmpty.hidden = false;
}

function renderSearchState() {
  const hasResults = state.search.results.length > 0;
  ui.searchInput.setAttribute('aria-expanded', hasResults ? 'true' : 'false');

  if (state.search.error) {
    ui.searchAlert.hidden = false;
    ui.searchAlert.textContent = state.search.error;
  } else {
    ui.searchAlert.hidden = true;
    ui.searchAlert.textContent = '';
  }

  ui.searchResults.textContent = '';

  if (state.search.isLoading) {
    ui.searchStatus.textContent = 'Searching locations...';
    ui.starterStatus.textContent = 'Looking up location options.';
    return;
  }

  if (state.query.length < SEARCH_MIN_CHARS) {
    ui.searchStatus.textContent = 'Start typing to search for a location.';
    ui.starterStatus.textContent = 'City search ready. Select a location to enable weather fetch.';
    return;
  }

  if (state.selectedLocation) {
    ui.searchStatus.textContent = 'Location selected. You can change the query to pick a different place.';
    ui.starterStatus.textContent = 'Location selected. You can now fetch weather evidence.';
    return;
  }

  if (state.search.error) {
    ui.searchStatus.textContent = 'Search failed. Check your connection and try again.';
    ui.starterStatus.textContent = 'Location search error. No weather request was made.';
    return;
  }

  if (!hasResults) {
    ui.searchStatus.textContent = 'No matching locations found.';
    ui.starterStatus.textContent = 'No locations found for that query.';
    return;
  }

  ui.searchStatus.textContent = `${state.search.results.length} location options available.`;
  ui.starterStatus.textContent = 'Choose one location from the results list.';

  state.search.results.forEach((location, index) => {
    const item = document.createElement('li');
    const option = document.createElement('button');
    const optionId = `location-option-${index}`;

    item.className = 'search-item';

    option.id = optionId;
    option.className = 'search-option';
    option.type = 'button';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', state.search.activeIndex === index ? 'true' : 'false');

    const title = document.createElement('strong');
    title.textContent = formatLocationName(location);

    const metadata = document.createElement('span');
    metadata.textContent = `Lat ${location.latitude.toFixed(2)}, Lon ${location.longitude.toFixed(2)}${location.timezone ? `, ${location.timezone}` : ''}`;

    option.append(title, metadata);
    option.addEventListener('click', () => {
      selectLocation(location);
      ui.searchInput.focus();
    });

    if (state.search.activeIndex === index) {
      ui.searchInput.setAttribute('aria-activedescendant', optionId);
    }

    item.append(option);
    ui.searchResults.append(item);
  });

  if (state.search.activeIndex < 0) {
    ui.searchInput.setAttribute('aria-activedescendant', '');
  }
}

function renderSelectedLocation() {
  if (!state.selectedLocation) {
    ui.selectedLocation.hidden = true;
    ui.selectedLocation.textContent = '';
    ui.fetchWeatherButton.disabled = true;
    return;
  }

  const locationLabel = formatLocationName(state.selectedLocation);
  const timezoneLabel = state.selectedLocation.timezone || 'Timezone unavailable';

  ui.selectedLocation.hidden = false;
  ui.selectedLocation.replaceChildren();

  const title = document.createElement('p');
  title.className = 'selected-location-title';
  title.textContent = `Selected location: ${locationLabel}`;

  const details = document.createElement('p');
  details.textContent = `Latitude ${state.selectedLocation.latitude.toFixed(2)}, longitude ${state.selectedLocation.longitude.toFixed(2)}, timezone ${timezoneLabel}.`;

  ui.selectedLocation.append(title, details);
  ui.fetchWeatherButton.disabled = state.weather.kind === 'loading';
}

function bindEvents() {
  ui.searchInput.addEventListener('input', onQueryInput);
  ui.searchInput.addEventListener('keydown', onQueryKeyDown);
  ui.fetchWeatherButton.addEventListener('click', fetchWeatherForSelectedLocation);
}

function init() {
  bindEvents();
  renderSearchState();
  renderSelectedLocation();
  renderWeatherState();
}

init();
