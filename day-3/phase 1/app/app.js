const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_CHARS = 2;
const SEARCH_MAX_RESULTS = 5;

const state = {
  query: '',
  selectedLocation: null,
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
  fetchWeatherButton: document.querySelector('#fetch-weather')
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

function onQueryInput(event) {
  const nextQuery = event.target.value.trim();
  const changedAfterSelection = Boolean(
    state.selectedLocation && nextQuery !== state.selectedLocation.name
  );

  state.query = nextQuery;

  if (changedAfterSelection) {
    state.selectedLocation = null;
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
  renderSearchState();
  renderSelectedLocation();
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
    ui.starterStatus.textContent = 'City search ready. Weather fetch is not active in this step.';
    return;
  }

  if (state.selectedLocation) {
    ui.searchStatus.textContent = 'Location selected. You can change the query to pick a different place.';
    ui.starterStatus.textContent = 'Location selected. Weather fetch remains disabled in this step.';
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
  ui.fetchWeatherButton.disabled = true;
}

function bindEvents() {
  ui.searchInput.addEventListener('input', onQueryInput);
  ui.searchInput.addEventListener('keydown', onQueryKeyDown);
}

function init() {
  bindEvents();
  renderSearchState();
  renderSelectedLocation();
}

init();
