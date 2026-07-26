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

  const FALLBACK_HOURLY_TIME = [
    '2026-07-22T09:00', '2026-07-22T10:00', '2026-07-22T11:00', '2026-07-22T12:00',
    '2026-07-22T13:00', '2026-07-22T14:00', '2026-07-22T15:00', '2026-07-22T16:00',
    '2026-07-22T17:00', '2026-07-22T18:00', '2026-07-22T19:00', '2026-07-22T20:00',
    '2026-07-22T21:00', '2026-07-22T22:00', '2026-07-22T23:00', '2026-07-23T00:00',
    '2026-07-23T01:00', '2026-07-23T02:00', '2026-07-23T03:00', '2026-07-23T04:00',
    '2026-07-23T05:00', '2026-07-23T06:00', '2026-07-23T07:00', '2026-07-23T08:00'
  ];

  const FALLBACK_DAILY_DATE = [
    '2026-07-22',
    '2026-07-23',
    '2026-07-24',
    '2026-07-25',
    '2026-07-26',
    '2026-07-27',
    '2026-07-28'
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

  function createFallbackSignal(selectedLocation) {
    const timezone = (selectedLocation && typeof selectedLocation.timezone === 'string' && selectedLocation.timezone)
      ? selectedLocation.timezone
      : 'UTC';

    return {
      location: 'Workshop Harbor, Fictional Coast',
      latitude: 36.12,
      longitude: -122.45,
      timezone,
      sourceUrl: 'bundled://fictional-weather-signal',
      isFallback: true,
      current: {
        time: '2026-07-22T09:00',
        temperature: 18,
        apparentTemperature: 17,
        humidity: 76,
        precipitation: 1.2,
        weatherCode: 61,
        windSpeed: 24,
        windDirection: 225,
        windGusts: 36,
        cloudCover: 78,
        pressure: 1008,
        isDay: 1,
        units: {
          temperature: 'degC',
          apparentTemperature: 'degC',
          humidity: '%',
          precipitation: 'mm',
          weatherCode: 'wmo code',
          windSpeed: 'km/h',
          windDirection: 'deg',
          windGusts: 'km/h',
          cloudCover: '%',
          pressure: 'hPa',
          isDay: '0|1'
        }
      },
      hourly: {
        time: FALLBACK_HOURLY_TIME.slice(),
        temperature: [18, 18, 19, 19, 20, 20, 19, 18, 17, 16, 16, 15, 15, 14, 14, 13, 13, 13, 12, 12, 12, 12, 13, 14],
        precipitationProbability: [70, 65, 60, 55, 50, 40, 35, 30, 35, 40, 45, 50, 55, 60, 62, 64, 66, 68, 72, 74, 76, 74, 70, 66],
        precipitation: [1.2, 1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.0, 0.0, 0.0, 0.1, 0.1, 0.2, 0.4, 0.6, 0.7, 0.9, 1.1, 1.2, 1.0, 0.8, 0.6, 0.4, 0.2],
        weatherCode: [61, 61, 61, 80, 80, 3, 3, 2, 2, 1, 1, 3, 3, 61, 61, 61, 63, 63, 63, 61, 61, 80, 80, 3],
        windSpeed: [24, 23, 22, 22, 21, 20, 19, 18, 18, 17, 17, 18, 19, 20, 21, 22, 23, 24, 24, 23, 22, 22, 21, 20],
        units: {
          temperature: 'degC',
          precipitationProbability: '%',
          precipitation: 'mm',
          weatherCode: 'wmo code',
          windSpeed: 'km/h'
        }
      },
      daily: {
        date: FALLBACK_DAILY_DATE.slice(),
        temperatureMax: [20, 21, 22, 19, 18, 20, 21],
        temperatureMin: [13, 14, 14, 12, 11, 12, 13],
        precipitationSum: [6.4, 4.2, 2.8, 7.1, 9.3, 4.8, 3.1],
        precipitationProbabilityMax: [80, 72, 65, 84, 90, 75, 70],
        weatherCode: [61, 80, 3, 63, 63, 61, 3],
        windSpeedMax: [36, 33, 30, 38, 41, 34, 32],
        sunrise: [
          '2026-07-22T06:03',
          '2026-07-23T06:04',
          '2026-07-24T06:05',
          '2026-07-25T06:06',
          '2026-07-26T06:07',
          '2026-07-27T06:08',
          '2026-07-28T06:09'
        ],
        sunset: [
          '2026-07-22T20:17',
          '2026-07-23T20:16',
          '2026-07-24T20:15',
          '2026-07-25T20:14',
          '2026-07-26T20:13',
          '2026-07-27T20:12',
          '2026-07-28T20:11'
        ],
        units: {
          temperatureMax: 'degC',
          temperatureMin: 'degC',
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

  global.WeatherSignal = {
    mapWeatherSignal,
    createFallbackSignal
  };
}(window));
