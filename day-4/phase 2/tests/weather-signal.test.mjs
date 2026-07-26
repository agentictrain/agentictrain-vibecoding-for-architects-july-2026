import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mapWeatherSignal, createFallbackSignal } = require('../app/weather-signal.js');

test('mapWeatherSignal returns a complete live WeatherSignal', function () {
  const location = buildLocation();
  const payload = buildValidPayload();
  const sourceUrl = 'https://api.open-meteo.com/v1/forecast?latitude=38.88&longitude=-77.1';
  const signal = mapWeatherSignal(location, payload, sourceUrl);

  assert.equal(signal.location, 'Arlington, Virginia, United States');
  assert.equal(signal.latitude, 38.88);
  assert.equal(signal.longitude, -77.1);
  assert.equal(signal.timezone, 'America/New_York');
  assert.equal(signal.sourceUrl, sourceUrl);
  assert.equal(signal.sourceKind, 'open-meteo');
  assert.equal(signal.evidenceMode, 'live');
  assert.equal(signal.isFallback, false);
  assert.equal(signal.current.units.temperature, '°C');
  assert.equal(signal.hourly.time.length, 24);
  assert.equal(signal.hourly.time[0], payload.current.time);
  assert.equal(signal.daily.date.length, 7);
  assert.equal(signal.daily.units.date, 'iso8601');
});

test('mapWeatherSignal rejects missing current block', function () {
  const payload = buildValidPayload();
  delete payload.current;
  assert.throws(function () {
    mapWeatherSignal(buildLocation(), payload, 'https://example.com');
  }, /response.current must be an object/);
});

test('mapWeatherSignal rejects invalid unit strings', function () {
  const payload = buildValidPayload();
  payload.hourly_units.temperature_2m = 'kelvin';
  assert.throws(function () {
    mapWeatherSignal(buildLocation(), payload, 'https://example.com');
  }, /response.hourly_units.temperature_2m is invalid/);
});

test('mapWeatherSignal rejects short hourly slices', function () {
  const payload = buildValidPayload();
  payload.hourly.time = payload.hourly.time.slice(0, 23);
  payload.hourly.temperature_2m = payload.hourly.temperature_2m.slice(0, 23);
  payload.hourly.precipitation_probability = payload.hourly.precipitation_probability.slice(0, 23);
  payload.hourly.precipitation = payload.hourly.precipitation.slice(0, 23);
  payload.hourly.weather_code = payload.hourly.weather_code.slice(0, 23);
  payload.hourly.wind_speed_10m = payload.hourly.wind_speed_10m.slice(0, 23);
  assert.throws(function () {
    mapWeatherSignal(buildLocation(), payload, 'https://example.com');
  }, /24 entries at or after the current local hour/);
});

test('mapWeatherSignal rejects short daily arrays', function () {
  const payload = buildValidPayload();
  payload.daily.time = payload.daily.time.slice(0, 6);
  payload.daily.temperature_2m_max = payload.daily.temperature_2m_max.slice(0, 6);
  payload.daily.temperature_2m_min = payload.daily.temperature_2m_min.slice(0, 6);
  payload.daily.precipitation_sum = payload.daily.precipitation_sum.slice(0, 6);
  payload.daily.precipitation_probability_max = payload.daily.precipitation_probability_max.slice(0, 6);
  payload.daily.weather_code = payload.daily.weather_code.slice(0, 6);
  payload.daily.wind_speed_10m_max = payload.daily.wind_speed_10m_max.slice(0, 6);
  payload.daily.sunrise = payload.daily.sunrise.slice(0, 6);
  payload.daily.sunset = payload.daily.sunset.slice(0, 6);
  assert.throws(function () {
    mapWeatherSignal(buildLocation(), payload, 'https://example.com');
  }, /Daily data must contain 7 entries/);
});

test('mapWeatherSignal rejects invalid is_day values', function () {
  const payload = buildValidPayload();
  payload.current.is_day = 2;
  assert.throws(function () {
    mapWeatherSignal(buildLocation(), payload, 'https://example.com');
  }, /must be 0 or 1/);
});

test('createFallbackSignal returns deterministic fictional values', function () {
  const fallbackOne = createFallbackSignal();
  const fallbackTwo = createFallbackSignal();

  assert.equal(fallbackOne.location, 'Workshop Harbor, Fictional Coast');
  assert.equal(fallbackOne.sourceUrl, 'bundled://fictional-weather-signal');
  assert.equal(fallbackOne.sourceKind, 'workshop-fixture');
  assert.equal(fallbackOne.evidenceMode, 'fictional-fallback');
  assert.equal(fallbackOne.isFallback, true);
  assert.deepEqual(fallbackOne.current, fallbackTwo.current);
  assert.deepEqual(fallbackOne.hourly, fallbackTwo.hourly);
  assert.deepEqual(fallbackOne.daily, fallbackTwo.daily);
});

function buildLocation() {
  return {
    name: 'Arlington',
    admin1: 'Virginia',
    country: 'United States',
    latitude: 38.88,
    longitude: -77.1,
    timezone: 'America/New_York'
  };
}

function buildValidPayload() {
  const hourlyTimes = [];
  const dailyDates = [];
  const sunrise = [];
  const sunset = [];
  const startHour = new Date(Date.UTC(2026, 6, 22, 0, 0, 0));

  for (let hour = 0; hour < 30; hour += 1) {
    hourlyTimes.push(formatIsoLocalDateTime(addHours(startHour, hour)));
  }

  for (let day = 0; day < 7; day += 1) {
    const date = `2026-07-${String(22 + day).padStart(2, '0')}`;
    dailyDates.push(date);
    sunrise.push(`${date}T05:58`);
    sunset.push(`${date}T20:19`);
  }

  return {
    timezone: 'America/New_York',
    current_units: {
      time: 'iso8601',
      temperature_2m: '°C',
      apparent_temperature: '°C',
      relative_humidity_2m: '%',
      precipitation: 'mm',
      weather_code: 'wmo code',
      wind_speed_10m: 'km/h',
      wind_direction_10m: '°',
      wind_gusts_10m: 'km/h',
      cloud_cover: '%',
      surface_pressure: 'hPa',
      is_day: ''
    },
    current: {
      time: '2026-07-22T06:00',
      temperature_2m: 28,
      apparent_temperature: 31,
      relative_humidity_2m: 77,
      precipitation: 1.1,
      weather_code: 61,
      wind_speed_10m: 14,
      wind_direction_10m: 160,
      wind_gusts_10m: 26,
      cloud_cover: 83,
      surface_pressure: 1008,
      is_day: 1
    },
    hourly_units: {
      time: 'iso8601',
      temperature_2m: '°C',
      precipitation_probability: '%',
      precipitation: 'mm',
      weather_code: 'wmo code',
      wind_speed_10m: 'km/h'
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: fillNumberArray(30, 24),
      precipitation_probability: fillNumberArray(30, 35),
      precipitation: fillNumberArray(30, 0.2),
      weather_code: fillNumberArray(30, 61),
      wind_speed_10m: fillNumberArray(30, 12)
    },
    daily_units: {
      time: 'iso8601',
      temperature_2m_max: '°C',
      temperature_2m_min: '°C',
      precipitation_sum: 'mm',
      precipitation_probability_max: '%',
      weather_code: 'wmo code',
      wind_speed_10m_max: 'km/h',
      sunrise: 'iso8601',
      sunset: 'iso8601'
    },
    daily: {
      time: dailyDates,
      temperature_2m_max: fillNumberArray(7, 30),
      temperature_2m_min: fillNumberArray(7, 22),
      precipitation_sum: fillNumberArray(7, 1.4),
      precipitation_probability_max: fillNumberArray(7, 48),
      weather_code: fillNumberArray(7, 61),
      wind_speed_10m_max: fillNumberArray(7, 18),
      sunrise: sunrise,
      sunset: sunset
    }
  };
}

function fillNumberArray(length, baseValue) {
  return Array.from({ length }, function createValue(_, index) {
    return baseValue + index;
  });
}

function addHours(dateValue, hourCount) {
  return new Date(dateValue.getTime() + (hourCount * 60 * 60 * 1000));
}

function formatIsoLocalDateTime(dateValue) {
  return `${dateValue.getUTCFullYear()}-${String(dateValue.getUTCMonth() + 1).padStart(2, '0')}-${String(dateValue.getUTCDate()).padStart(2, '0')}T${String(dateValue.getUTCHours()).padStart(2, '0')}:${String(dateValue.getUTCMinutes()).padStart(2, '0')}`;
}