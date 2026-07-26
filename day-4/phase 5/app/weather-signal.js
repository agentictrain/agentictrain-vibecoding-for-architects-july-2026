(function createWeatherSignalNamespace(globalObject, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  globalObject.WeatherSignal = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createWeatherSignalApi() {
  const CURRENT_UNIT_RULES = {
    time: ['iso8601'],
    temperature_2m: ['°C', '°F'],
    apparent_temperature: ['°C', '°F'],
    relative_humidity_2m: ['%'],
    precipitation: ['mm', 'inch'],
    weather_code: ['wmo code'],
    wind_speed_10m: ['km/h', 'mph', 'mp/h', 'm/s', 'kn'],
    wind_direction_10m: ['°'],
    wind_gusts_10m: ['km/h', 'mph', 'mp/h', 'm/s', 'kn'],
    cloud_cover: ['%'],
    surface_pressure: ['hPa'],
    is_day: ['']
  };

  const HOURLY_UNIT_RULES = {
    time: ['iso8601'],
    temperature_2m: ['°C', '°F'],
    precipitation_probability: ['%'],
    precipitation: ['mm', 'inch'],
    weather_code: ['wmo code'],
    wind_speed_10m: ['km/h', 'mph', 'mp/h', 'm/s', 'kn']
  };

  const DAILY_UNIT_RULES = {
    time: ['iso8601'],
    temperature_2m_max: ['°C', '°F'],
    temperature_2m_min: ['°C', '°F'],
    precipitation_sum: ['mm', 'inch'],
    precipitation_probability_max: ['%'],
    weather_code: ['wmo code'],
    wind_speed_10m_max: ['km/h', 'mph', 'mp/h', 'm/s', 'kn'],
    sunrise: ['iso8601'],
    sunset: ['iso8601']
  };

  const FALLBACK_TEMPLATE = buildFallbackTemplate();

  function mapWeatherSignal(location, response, sourceUrl) {
    const validatedLocation = validateLocation(location);
    const current = mapCurrentSection(response);
    const hourly = mapHourlySection(response, current.time);
    const daily = mapDailySection(response);
    const timezone = readTimezone(response.timezone, validatedLocation.timezone);

    return {
      location: buildLocationLabel(validatedLocation),
      latitude: validatedLocation.latitude,
      longitude: validatedLocation.longitude,
      timezone: timezone,
      sourceUrl: assertNonEmptyString(sourceUrl, 'sourceUrl'),
      sourceKind: 'open-meteo',
      evidenceMode: 'live',
      isFallback: false,
      producedAt: new Date().toISOString(),
      current: current,
      hourly: hourly,
      daily: daily
    };
  }

  function createFallbackSignal() {
    const cloned = cloneJsonValue(FALLBACK_TEMPLATE);
    cloned.producedAt = new Date().toISOString();
    return cloned;
  }

  function validateLocation(location) {
    if (!location || typeof location !== 'object') {
      throw new Error('Selected location is required.');
    }

    const name = assertNonEmptyString(location.name, 'location.name');
    const country = assertNonEmptyString(location.country, 'location.country');
    const admin1 = typeof location.admin1 === 'string' ? location.admin1.trim() : '';
    const latitude = assertFiniteNumber(location.latitude, 'location.latitude');
    const longitude = assertFiniteNumber(location.longitude, 'location.longitude');

    if (latitude < -90 || latitude > 90) {
      throw new Error('location.latitude is out of range.');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('location.longitude is out of range.');
    }

    return {
      name: name,
      admin1: admin1,
      country: country,
      latitude: latitude,
      longitude: longitude,
      timezone: typeof location.timezone === 'string' ? location.timezone.trim() : ''
    };
  }

  function mapCurrentSection(response) {
    const current = assertObject(response.current, 'response.current');
    const currentUnits = assertObject(response.current_units, 'response.current_units');
    validateUnitSet(currentUnits, CURRENT_UNIT_RULES, 'response.current_units');

    const time = assertIsoDateTime(current.time, 'response.current.time');
    const isDay = assertFiniteNumber(current.is_day, 'response.current.is_day');
    if (isDay !== 0 && isDay !== 1) {
      throw new Error('response.current.is_day must be 0 or 1.');
    }

    return {
      time: time,
      temperature: assertFiniteNumber(current.temperature_2m, 'response.current.temperature_2m'),
      apparentTemperature: assertFiniteNumber(current.apparent_temperature, 'response.current.apparent_temperature'),
      humidity: assertFiniteNumber(current.relative_humidity_2m, 'response.current.relative_humidity_2m'),
      precipitation: assertFiniteNumber(current.precipitation, 'response.current.precipitation'),
      weatherCode: assertFiniteNumber(current.weather_code, 'response.current.weather_code'),
      windSpeed: assertFiniteNumber(current.wind_speed_10m, 'response.current.wind_speed_10m'),
      windDirection: assertFiniteNumber(current.wind_direction_10m, 'response.current.wind_direction_10m'),
      windGusts: assertFiniteNumber(current.wind_gusts_10m, 'response.current.wind_gusts_10m'),
      cloudCover: assertFiniteNumber(current.cloud_cover, 'response.current.cloud_cover'),
      pressure: assertFiniteNumber(current.surface_pressure, 'response.current.surface_pressure'),
      isDay: isDay,
      units: {
        time: currentUnits.time,
        temperature: currentUnits.temperature_2m,
        apparentTemperature: currentUnits.apparent_temperature,
        humidity: currentUnits.relative_humidity_2m,
        precipitation: currentUnits.precipitation,
        weatherCode: currentUnits.weather_code,
        windSpeed: currentUnits.wind_speed_10m,
        windDirection: currentUnits.wind_direction_10m,
        windGusts: currentUnits.wind_gusts_10m,
        cloudCover: currentUnits.cloud_cover,
        pressure: currentUnits.surface_pressure,
        isDay: currentUnits.is_day
      }
    };
  }

  function mapHourlySection(response, currentTime) {
    const hourly = assertObject(response.hourly, 'response.hourly');
    const hourlyUnits = assertObject(response.hourly_units, 'response.hourly_units');
    validateUnitSet(hourlyUnits, HOURLY_UNIT_RULES, 'response.hourly_units');

    const times = assertArray(hourly.time, 'response.hourly.time').map(function validateTime(value, index) {
      return assertIsoDateTime(value, `response.hourly.time[${index}]`);
    });

    ensureIncreasing(times, 'response.hourly.time');

    const temperature = readNumericArray(hourly.temperature_2m, 'response.hourly.temperature_2m');
    const precipitationProbability = readNumericArray(hourly.precipitation_probability, 'response.hourly.precipitation_probability');
    const precipitation = readNumericArray(hourly.precipitation, 'response.hourly.precipitation');
    const weatherCode = readNumericArray(hourly.weather_code, 'response.hourly.weather_code');
    const windSpeed = readNumericArray(hourly.wind_speed_10m, 'response.hourly.wind_speed_10m');

    const expectedLength = times.length;
    [temperature, precipitationProbability, precipitation, weatherCode, windSpeed].forEach(function ensureLength(list) {
      if (list.length !== expectedLength) {
        throw new Error('Hourly arrays must be equal in length.');
      }
    });

    const startIndex = findHourlyStartIndex(times, currentTime);
    if (startIndex === -1 || startIndex + 24 > times.length) {
      throw new Error('Hourly data must contain 24 entries at or after the current local hour.');
    }

    return {
      time: times.slice(startIndex, startIndex + 24),
      temperature: temperature.slice(startIndex, startIndex + 24),
      precipitationProbability: precipitationProbability.slice(startIndex, startIndex + 24),
      precipitation: precipitation.slice(startIndex, startIndex + 24),
      weatherCode: weatherCode.slice(startIndex, startIndex + 24),
      windSpeed: windSpeed.slice(startIndex, startIndex + 24),
      units: {
        time: hourlyUnits.time,
        temperature: hourlyUnits.temperature_2m,
        precipitationProbability: hourlyUnits.precipitation_probability,
        precipitation: hourlyUnits.precipitation,
        weatherCode: hourlyUnits.weather_code,
        windSpeed: hourlyUnits.wind_speed_10m
      }
    };
  }

  function mapDailySection(response) {
    const daily = assertObject(response.daily, 'response.daily');
    const dailyUnits = assertObject(response.daily_units, 'response.daily_units');
    validateUnitSet(dailyUnits, DAILY_UNIT_RULES, 'response.daily_units');

    const dates = assertArray(daily.time, 'response.daily.time').map(function validateDate(value, index) {
      return assertIsoDate(value, `response.daily.time[${index}]`);
    });
    ensureIncreasing(dates, 'response.daily.time');

    const temperatureMax = readNumericArray(daily.temperature_2m_max, 'response.daily.temperature_2m_max');
    const temperatureMin = readNumericArray(daily.temperature_2m_min, 'response.daily.temperature_2m_min');
    const precipitationSum = readNumericArray(daily.precipitation_sum, 'response.daily.precipitation_sum');
    const precipitationProbabilityMax = readNumericArray(daily.precipitation_probability_max, 'response.daily.precipitation_probability_max');
    const weatherCode = readNumericArray(daily.weather_code, 'response.daily.weather_code');
    const windSpeedMax = readNumericArray(daily.wind_speed_10m_max, 'response.daily.wind_speed_10m_max');
    const sunrise = assertArray(daily.sunrise, 'response.daily.sunrise').map(function validateSunrise(value, index) {
      return assertIsoDateTime(value, `response.daily.sunrise[${index}]`);
    });
    const sunset = assertArray(daily.sunset, 'response.daily.sunset').map(function validateSunset(value, index) {
      return assertIsoDateTime(value, `response.daily.sunset[${index}]`);
    });

    const expectedLength = dates.length;
    [temperatureMax, temperatureMin, precipitationSum, precipitationProbabilityMax, weatherCode, windSpeedMax, sunrise, sunset].forEach(function ensureLength(list) {
      if (list.length !== expectedLength) {
        throw new Error('Daily arrays must be equal in length.');
      }
    });

    if (expectedLength < 7) {
      throw new Error('Daily data must contain 7 entries.');
    }

    return {
      date: dates.slice(0, 7),
      temperatureMax: temperatureMax.slice(0, 7),
      temperatureMin: temperatureMin.slice(0, 7),
      precipitationSum: precipitationSum.slice(0, 7),
      precipitationProbabilityMax: precipitationProbabilityMax.slice(0, 7),
      weatherCode: weatherCode.slice(0, 7),
      windSpeedMax: windSpeedMax.slice(0, 7),
      sunrise: sunrise.slice(0, 7),
      sunset: sunset.slice(0, 7),
      units: {
        date: dailyUnits.time,
        temperatureMax: dailyUnits.temperature_2m_max,
        temperatureMin: dailyUnits.temperature_2m_min,
        precipitationSum: dailyUnits.precipitation_sum,
        precipitationProbabilityMax: dailyUnits.precipitation_probability_max,
        weatherCode: dailyUnits.weather_code,
        windSpeedMax: dailyUnits.wind_speed_10m_max,
        sunrise: dailyUnits.sunrise,
        sunset: dailyUnits.sunset
      }
    };
  }

  function validateUnitSet(actualUnits, expectedRules, label) {
    Object.keys(expectedRules).forEach(function verifyUnit(key) {
      const actualValue = actualUnits[key];
      if (!expectedRules[key].includes(actualValue)) {
        throw new Error(`${label}.${key} is invalid.`);
      }
    });
  }

  function findHourlyStartIndex(times, currentTime) {
    const exactMatch = times.indexOf(currentTime);
    if (exactMatch >= 0) {
      return exactMatch;
    }

    for (let index = 0; index < times.length; index += 1) {
      if (times[index] > currentTime) {
        return index;
      }
    }

    return -1;
  }

  function readTimezone(providerTimezone, locationTimezone) {
    if (typeof providerTimezone === 'string' && providerTimezone.trim()) {
      return providerTimezone.trim();
    }
    if (typeof locationTimezone === 'string' && locationTimezone.trim()) {
      return locationTimezone.trim();
    }
    return 'auto';
  }

  function readNumericArray(value, label) {
    return assertArray(value, label).map(function mapNumber(entry, index) {
      return assertFiniteNumber(entry, `${label}[${index}]`);
    });
  }

  function buildLocationLabel(location) {
    return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
  }

  function assertObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${label} must be an object.`);
    }
    return value;
  }

  function assertArray(value, label) {
    if (!Array.isArray(value)) {
      throw new Error(`${label} must be an array.`);
    }
    return value;
  }

  function assertFiniteNumber(value, label) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      throw new Error(`${label} must be a finite number.`);
    }
    return numberValue;
  }

  function assertNonEmptyString(value, label) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`${label} must be a non-empty string.`);
    }
    return value.trim();
  }

  function assertIsoDateTime(value, label) {
    const text = assertNonEmptyString(value, label);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text)) {
      throw new Error(`${label} must be an ISO local datetime.`);
    }
    return text;
  }

  function assertIsoDate(value, label) {
    const text = assertNonEmptyString(value, label);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      throw new Error(`${label} must be an ISO date.`);
    }
    return text;
  }

  function ensureIncreasing(values, label) {
    for (let index = 1; index < values.length; index += 1) {
      if (values[index] <= values[index - 1]) {
        throw new Error(`${label} must be ordered.`);
      }
    }
  }

  function buildFallbackTemplate() {
    const startHour = new Date(Date.UTC(2026, 1, 14, 6, 0, 0));
    const startDay = new Date(Date.UTC(2026, 1, 14, 0, 0, 0));
    const hourlyTimes = [];
    const dailyDates = [];
    const sunrise = [];
    const sunset = [];

    for (let hourIndex = 0; hourIndex < 24; hourIndex += 1) {
      hourlyTimes.push(formatIsoLocalDateTime(addHours(startHour, hourIndex)));
    }

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDay = addDays(startDay, dayIndex);
      dailyDates.push(formatIsoDate(currentDay));
      sunrise.push(`${formatIsoDate(currentDay)}T06:45`);
      sunset.push(`${formatIsoDate(currentDay)}T18:20`);
    }

    return {
      location: 'Workshop Harbor, Fictional Coast',
      latitude: 12.34,
      longitude: -45.67,
      timezone: 'Etc/UTC',
      sourceUrl: 'bundled://fictional-weather-signal',
      sourceKind: 'workshop-fixture',
      evidenceMode: 'fictional-fallback',
      isFallback: true,
      producedAt: '2026-02-14T06:00:00.000Z',
      current: {
        time: hourlyTimes[0],
        temperature: 18,
        apparentTemperature: 16,
        humidity: 72,
        precipitation: 0.8,
        weatherCode: 61,
        windSpeed: 18,
        windDirection: 210,
        windGusts: 27,
        cloudCover: 68,
        pressure: 1014,
        isDay: 1,
        units: {
          time: 'iso8601',
          temperature: '°C',
          apparentTemperature: '°C',
          humidity: '%',
          precipitation: 'mm',
          weatherCode: 'wmo code',
          windSpeed: 'km/h',
          windDirection: '°',
          windGusts: 'km/h',
          cloudCover: '%',
          pressure: 'hPa',
          isDay: ''
        }
      },
      hourly: {
        time: hourlyTimes,
        temperature: [18, 18, 17, 17, 16, 16, 16, 17, 18, 19, 20, 21, 21, 22, 22, 21, 20, 19, 19, 18, 18, 17, 17, 16],
        precipitationProbability: [45, 42, 40, 38, 36, 35, 30, 26, 22, 18, 15, 12, 10, 9, 8, 10, 14, 20, 24, 28, 34, 38, 42, 46],
        precipitation: [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        weatherCode: [61, 61, 61, 61, 3, 3, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2, 3, 3, 61, 61, 61, 61, 61],
        windSpeed: [18, 20, 19, 18, 17, 16, 15, 14, 13, 13, 12, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 20, 19],
        units: {
          time: 'iso8601',
          temperature: '°C',
          precipitationProbability: '%',
          precipitation: 'mm',
          weatherCode: 'wmo code',
          windSpeed: 'km/h'
        }
      },
      daily: {
        date: dailyDates,
        temperatureMax: [21, 22, 22, 20, 19, 20, 21],
        temperatureMin: [16, 16, 17, 15, 14, 15, 16],
        precipitationSum: [3.4, 2.6, 1.2, 0.4, 0.2, 0.9, 2.1],
        precipitationProbabilityMax: [68, 55, 42, 24, 18, 35, 58],
        weatherCode: [61, 3, 2, 1, 0, 3, 61],
        windSpeedMax: [27, 24, 21, 19, 18, 22, 25],
        sunrise: sunrise,
        sunset: sunset,
        units: {
          date: 'iso8601',
          temperatureMax: '°C',
          temperatureMin: '°C',
          precipitationSum: 'mm',
          precipitationProbabilityMax: '%',
          weatherCode: 'wmo code',
          windSpeedMax: 'km/h',
          sunrise: 'iso8601',
          sunset: 'iso8601'
        }
      }
    };
  }

  function addHours(dateValue, hourCount) {
    return new Date(dateValue.getTime() + (hourCount * 60 * 60 * 1000));
  }

  function addDays(dateValue, dayCount) {
    return new Date(dateValue.getTime() + (dayCount * 24 * 60 * 60 * 1000));
  }

  function formatIsoLocalDateTime(dateValue) {
    return `${formatIsoDate(dateValue)}T${String(dateValue.getUTCHours()).padStart(2, '0')}:${String(dateValue.getUTCMinutes()).padStart(2, '0')}`;
  }

  function formatIsoDate(dateValue) {
    return `${dateValue.getUTCFullYear()}-${String(dateValue.getUTCMonth() + 1).padStart(2, '0')}-${String(dateValue.getUTCDate()).padStart(2, '0')}`;
  }

  function cloneJsonValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  return {
    mapWeatherSignal: mapWeatherSignal,
    createFallbackSignal: createFallbackSignal
  };
});