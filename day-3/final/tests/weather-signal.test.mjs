import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { mapWeatherSignal, createFallbackSignal } = require('../app/weather-signal.js');

const location = {
  name: 'Arlington',
  admin1: 'Virginia',
  country: 'United States',
  latitude: 38.88101,
  longitude: -77.10428,
  timezone: 'America/New_York'
};

function createValidPayload() {
  const baseTime = Date.parse('2026-07-22T00:00:00Z');
  const hourlyTime = Array.from(
    { length: 26 },
    (_, i) => new Date(baseTime + (i * 60 * 60 * 1000)).toISOString().slice(0, 16)
  );
  const dailyTime = [
    '2026-07-22',
    '2026-07-23',
    '2026-07-24',
    '2026-07-25',
    '2026-07-26',
    '2026-07-27',
    '2026-07-28'
  ];

  return {
    timezone: 'America/New_York',
    current_units: {
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
      is_day: '0|1'
    },
    current: {
      time: '2026-07-22T02:00',
      temperature_2m: 30,
      apparent_temperature: 31,
      relative_humidity_2m: 58,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 10,
      wind_direction_10m: 220,
      wind_gusts_10m: 18,
      cloud_cover: 35,
      surface_pressure: 1012,
      is_day: 1
    },
    hourly_units: {
      temperature_2m: '°C',
      precipitation_probability: '%',
      precipitation: 'mm',
      weather_code: 'wmo code',
      wind_speed_10m: 'km/h'
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: Array.from({ length: 26 }, (_, i) => 20 + (i % 4)),
      precipitation_probability: Array.from({ length: 26 }, (_, i) => 10 + i),
      precipitation: Array.from({ length: 26 }, (_, i) => (i % 3) * 0.2),
      weather_code: Array.from({ length: 26 }, () => 2),
      wind_speed_10m: Array.from({ length: 26 }, (_, i) => 10 + (i % 5))
    },
    daily_units: {
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
      time: dailyTime,
      temperature_2m_max: [31, 32, 33, 30, 29, 31, 32],
      temperature_2m_min: [20, 21, 22, 19, 18, 19, 20],
      precipitation_sum: [0.2, 1, 0.3, 2, 0.1, 0.4, 0],
      precipitation_probability_max: [20, 55, 30, 75, 15, 25, 10],
      weather_code: [2, 61, 3, 63, 1, 2, 0],
      wind_speed_10m_max: [22, 28, 25, 33, 21, 20, 18],
      sunrise: [
        '2026-07-22T06:00',
        '2026-07-23T06:01',
        '2026-07-24T06:02',
        '2026-07-25T06:03',
        '2026-07-26T06:04',
        '2026-07-27T06:05',
        '2026-07-28T06:06'
      ],
      sunset: [
        '2026-07-22T20:00',
        '2026-07-23T19:59',
        '2026-07-24T19:58',
        '2026-07-25T19:57',
        '2026-07-26T19:56',
        '2026-07-27T19:55',
        '2026-07-28T19:54'
      ]
    }
  };
}

test('maps valid payload to WeatherSignal contract', () => {
  const payload = createValidPayload();
  const sourceUrl = 'https://api.open-meteo.com/v1/forecast?test=1';

  const signal = mapWeatherSignal(location, payload, sourceUrl);

  assert.equal(signal.location, 'Arlington, Virginia, United States');
  assert.equal(signal.latitude, location.latitude);
  assert.equal(signal.longitude, location.longitude);
  assert.equal(signal.timezone, 'America/New_York');
  assert.equal(signal.sourceUrl, sourceUrl);
  assert.equal(signal.isFallback, false);
  assert.equal(signal.hourly.time.length, 24);
  assert.equal(signal.daily.date.length, 7);
  assert.equal(signal.current.units.windDirection, '°');
});

test('rejects unknown unit values', () => {
  const payload = createValidPayload();
  payload.current_units.temperature_2m = 'Kelvin-ish';

  assert.throws(
    () => mapWeatherSignal(location, payload, 'https://api.open-meteo.com/v1/forecast?x=1'),
    /unknown unit/
  );
});

test('rejects short hourly series', () => {
  const payload = createValidPayload();
  payload.hourly.time = payload.hourly.time.slice(0, 20);
  payload.hourly.temperature_2m = payload.hourly.temperature_2m.slice(0, 20);
  payload.hourly.precipitation_probability = payload.hourly.precipitation_probability.slice(0, 20);
  payload.hourly.precipitation = payload.hourly.precipitation.slice(0, 20);
  payload.hourly.weather_code = payload.hourly.weather_code.slice(0, 20);
  payload.hourly.wind_speed_10m = payload.hourly.wind_speed_10m.slice(0, 20);

  assert.throws(
    () => mapWeatherSignal(location, payload, 'https://api.open-meteo.com/v1/forecast?x=1'),
    /24 entries/
  );
});

test('creates deterministic fallback signal', () => {
  const fallbackA = createFallbackSignal({ timezone: 'America/New_York' });
  const fallbackB = createFallbackSignal({ timezone: 'America/New_York' });

  assert.deepEqual(fallbackA, fallbackB);
  assert.equal(fallbackA.isFallback, true);
  assert.equal(fallbackA.sourceUrl, 'bundled://fictional-weather-signal');
  assert.equal(fallbackA.hourly.time.length, 24);
  assert.equal(fallbackA.daily.date.length, 7);
});
