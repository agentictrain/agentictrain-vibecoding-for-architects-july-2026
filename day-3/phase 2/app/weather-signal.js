(function weatherSignalModule(global) {
  'use strict';

  const CURRENT_FIELDS = [
    ['temperature_2m', 'temperature'],
    ['apparent_temperature', 'apparentTemperature'],
    ['relative_humidity_2m', 'humidity'],
    ['precipitation', 'precipitation'],
    ['weather_code', 'weatherCode'],
    ['wind_speed_10m', 'windSpeed'],
    ['wind_direction_10m', 'windDirection'],
    ['wind_gusts_10m', 'windGusts'],
    ['cloud_cover', 'cloudCover'],
    ['surface_pressure', 'pressure'],
    ['is_day', 'isDay']
  ];

  const HOURLY_FIELDS = [
    ['temperature_2m', 'temperature'],
    ['precipitation_probability', 'precipitationProbability'],
    ['precipitation', 'precipitation'],
    ['weather_code', 'weatherCode'],
    ['wind_speed_10m', 'windSpeed']
  ];

  const DAILY_FIELDS = [
    ['temperature_2m_max', 'temperatureMax'],
    ['temperature_2m_min', 'temperatureMin'],
    ['precipitation_sum', 'precipitationSum'],
    ['precipitation_probability_max', 'precipitationProbabilityMax'],
    ['weather_code', 'weatherCode'],
    ['wind_speed_10m_max', 'windSpeedMax'],
    ['sunrise', 'sunrise'],
    ['sunset', 'sunset']
  ];

  function ensure(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function ensureFiniteNumber(value, message) {
    ensure(Number.isFinite(value), message);
  }

  function ensureString(value, message) {
    ensure(typeof value === 'string' && value.length > 0, message);
  }

  function ensureIsoSequence(values, message) {
    ensure(Array.isArray(values), message);

    for (let i = 0; i < values.length; i += 1) {
      ensureString(values[i], message);

      const timestamp = Date.parse(values[i]);
      ensure(Number.isFinite(timestamp), message);

      if (i > 0) {
        ensure(values[i] >= values[i - 1], message);
      }
    }
  }

  function extractUnits(unitsBlock, fields, sectionName) {
    const units = {};

    fields.forEach(([sourceKey, targetKey]) => {
      const unitValue = unitsBlock[sourceKey];

      if (sourceKey === 'is_day' && (unitValue === undefined || unitValue === null || unitValue === '')) {
        units[targetKey] = '0|1';
        return;
      }

      ensureString(unitValue, `${sectionName} missing unit for ${sourceKey}`);
      units[targetKey] = unitValue;
    });

    return units;
  }

  function extractCurrent(currentBlock, currentUnitsBlock) {
    ensure(currentBlock && typeof currentBlock === 'object', 'current block missing');
    ensure(currentUnitsBlock && typeof currentUnitsBlock === 'object', 'current units block missing');

    ensureString(currentBlock.time, 'current time missing or invalid');
    ensure(Number.isFinite(Date.parse(currentBlock.time)), 'current time missing or invalid');

    const current = {
      time: currentBlock.time,
      units: extractUnits(currentUnitsBlock, CURRENT_FIELDS, 'current')
    };

    CURRENT_FIELDS.forEach(([sourceKey, targetKey]) => {
      const value = currentBlock[sourceKey];
      ensureFiniteNumber(value, `current ${sourceKey} missing or invalid`);

      if (sourceKey === 'is_day') {
        ensure(value === 0 || value === 1, 'current is_day must be 0 or 1');
      }

      current[targetKey] = value;
    });

    return current;
  }

  function sliceHourly(hourlyBlock, hourlyUnitsBlock, currentTime) {
    ensure(hourlyBlock && typeof hourlyBlock === 'object', 'hourly block missing');
    ensure(hourlyUnitsBlock && typeof hourlyUnitsBlock === 'object', 'hourly units block missing');

    ensureIsoSequence(hourlyBlock.time, 'hourly times missing or invalid');

    const startIndex = hourlyBlock.time.findIndex((timeValue) => timeValue >= currentTime);
    ensure(startIndex >= 0, 'hourly series does not contain current-or-later hour');

    const endIndex = startIndex + 24;
    ensure(hourlyBlock.time.length >= endIndex, 'hourly series must include 24 entries');

    const hourly = {
      time: hourlyBlock.time.slice(startIndex, endIndex),
      units: extractUnits(hourlyUnitsBlock, HOURLY_FIELDS, 'hourly')
    };

    HOURLY_FIELDS.forEach(([sourceKey, targetKey]) => {
      const values = hourlyBlock[sourceKey];
      ensure(Array.isArray(values), `hourly ${sourceKey} missing`);
      ensure(values.length === hourlyBlock.time.length, `hourly ${sourceKey} misaligned`);

      for (let i = 0; i < values.length; i += 1) {
        ensureFiniteNumber(values[i], `hourly ${sourceKey} has invalid value`);
      }

      hourly[targetKey] = values.slice(startIndex, endIndex);
    });

    return hourly;
  }

  function sliceDaily(dailyBlock, dailyUnitsBlock) {
    ensure(dailyBlock && typeof dailyBlock === 'object', 'daily block missing');
    ensure(dailyUnitsBlock && typeof dailyUnitsBlock === 'object', 'daily units block missing');

    ensureIsoSequence(dailyBlock.time, 'daily dates missing or invalid');
    ensure(dailyBlock.time.length >= 7, 'daily series must include 7 entries');

    const daily = {
      date: dailyBlock.time.slice(0, 7),
      units: extractUnits(dailyUnitsBlock, DAILY_FIELDS, 'daily')
    };

    DAILY_FIELDS.forEach(([sourceKey, targetKey]) => {
      const values = dailyBlock[sourceKey];
      ensure(Array.isArray(values), `daily ${sourceKey} missing`);
      ensure(values.length === dailyBlock.time.length, `daily ${sourceKey} misaligned`);

      if (sourceKey === 'sunrise' || sourceKey === 'sunset') {
        ensureIsoSequence(values, `daily ${sourceKey} invalid`);
      } else {
        for (let i = 0; i < values.length; i += 1) {
          ensureFiniteNumber(values[i], `daily ${sourceKey} has invalid value`);
        }
      }

      daily[targetKey] = values.slice(0, 7);
    });

    return daily;
  }

  function mapWeatherSignal(location, responsePayload, sourceUrl) {
    ensure(location && typeof location === 'object', 'selected location is missing');
    ensureFiniteNumber(location.latitude, 'selected location latitude is invalid');
    ensureFiniteNumber(location.longitude, 'selected location longitude is invalid');
    ensure(location.latitude >= -90 && location.latitude <= 90, 'selected location latitude is out of range');
    ensure(location.longitude >= -180 && location.longitude <= 180, 'selected location longitude is out of range');
    ensureString(location.name, 'selected location name is missing');
    ensureString(location.country, 'selected location country is missing');
    ensureString(sourceUrl, 'source URL is missing');

    ensure(responsePayload && typeof responsePayload === 'object', 'forecast payload missing');

    const timezone = typeof responsePayload.timezone === 'string' && responsePayload.timezone
      ? responsePayload.timezone
      : 'auto';

    const current = extractCurrent(responsePayload.current, responsePayload.current_units);
    const hourly = sliceHourly(responsePayload.hourly, responsePayload.hourly_units, current.time);
    const daily = sliceDaily(responsePayload.daily, responsePayload.daily_units);

    return {
      location: location.admin1
        ? `${location.name}, ${location.admin1}, ${location.country}`
        : `${location.name}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone,
      sourceUrl,
      isFallback: false,
      current,
      hourly,
      daily
    };
  }

  global.WeatherSignal = {
    mapWeatherSignal
  };
}(window));
