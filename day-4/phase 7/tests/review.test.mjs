import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { requestReview, validateReview, resolvesWeatherSignalPath } = require('../app/review.js');
const credential = 'temporary-secret-value';

test('requestReview uses the exact Groq chat-completions contract', async function () {
  let capturedUrl;
  let capturedOptions;
  const signal = buildSignal();
  const review = await requestReview(signal, 'warehouse-planning', buildSettings(), {
    signal: { name: 'abort-signal' },
    fetchImplementation: async function fetchStub(url, options) {
      capturedUrl = url;
      capturedOptions = options;
      return jsonContentResponse(JSON.stringify(buildValidReview()));
    }
  });

  const body = JSON.parse(capturedOptions.body);
  const userContent = JSON.parse(body.messages[1].content);
  assert.equal(capturedUrl, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(capturedOptions.method, 'POST');
  assert.equal(capturedOptions.headers['Content-Type'], 'application/json');
  assert.equal(capturedOptions.headers.Authorization, `Bearer ${credential}`);
  assert.deepEqual(capturedOptions.signal, { name: 'abort-signal' });
  assert.equal(body.model, 'facilitator-model');
  assert.equal(body.stream, false);
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.equal(body.temperature, 0.2);
  assert.deepEqual(userContent, { signal: signal, scenario: 'warehouse-planning' });
  assert.equal(capturedOptions.body.includes(credential), false);
  assert.deepEqual(review, buildValidReview());
});

test('requestReview accepts Groq metadata and ignores it', async function () {
  const review = await requestReview(buildSignal(), 'warehouse-planning', buildSettings(), {
    fetchImplementation: async function groqResponseStub() {
      return {
        ok: true,
        status: 200,
        json: async function json() {
          return {
            choices: [{
              message: { content: JSON.stringify(buildValidReview()), reasoning: 'Ignored metadata' }
            }],
            x_groq: { id: 'request-metadata' }
          };
        }
      };
    }
  });
  assert.deepEqual(review, buildValidReview());
});

test('validateReview trims and accepts the exact five-field contract', function () {
  const review = buildValidReview();
  review.summary = '  Rain affects loading operations.  ';
  review.evidence = [' WeatherSignal.current.precipitation '];
  assert.deepEqual(validateReview(review, buildSignal()), {
    summary: 'Rain affects loading operations.',
    risks: review.risks,
    actions: review.actions,
    questions: review.questions,
    evidence: ['WeatherSignal.current.precipitation']
  });
});

test('validateReview rejects missing, extra, malformed, and unsafe fields', function () {
  const missing = buildValidReview();
  delete missing.questions;
  assert.throws(function () { validateReview(missing, buildSignal()); }, /exactly summary/);
  assert.throws(function () {
    validateReview({ ...buildValidReview(), confidence: 'high' }, buildSignal());
  }, /exactly summary/);
  assert.throws(function () {
    validateReview({ ...buildValidReview(), summary: 'One. Two. Three. Four.' }, buildSignal());
  }, /1 to 3 sentences/);
  assert.throws(function () {
    validateReview({ ...buildValidReview(), risks: [] }, buildSignal());
  }, /risks must contain 1 to 6 items/);
  assert.throws(function () {
    validateReview({ ...buildValidReview(), actions: ['<strong>Act</strong>'] }, buildSignal());
  }, /plain text/);
});

test('evidence paths resolve own fields and reject missing or unsafe traversal', function () {
  const signal = buildSignal();
  assert.equal(resolvesWeatherSignalPath('WeatherSignal.current.temperature', signal), true);
  assert.equal(resolvesWeatherSignalPath('WeatherSignal.daily.precipitationProbabilityMax.0', signal), true);
  assert.equal(resolvesWeatherSignalPath('WeatherSignal.current.missing', signal), false);
  assert.equal(resolvesWeatherSignalPath('WeatherSignal.__proto__.polluted', signal), false);

  const review = buildValidReview();
  const untrustedPath = 'WeatherSignal.current.roadCondition-secret-response-text';
  review.evidence = [untrustedPath];
  assert.throws(
    function () { validateReview(review, signal); },
    function doesNotReflectModelText(error) {
      return /evidence item 1/.test(error.message) && !error.message.includes(untrustedPath);
    }
  );
});

test('requestReview failures never expose credentials or provider bodies', async function () {
  const failures = [
    async function failedFetchStub() { throw new Error(`request with ${credential} failed`); },
    async function statusStub() { return { ok: false, status: 401 }; },
    async function missingContentStub() { return { ok: true, json: async function () { return { choices: [] }; } }; },
    async function malformedJsonStub() { return jsonContentResponse(`{not-json-${credential}`); }
  ];

  for (const fetchImplementation of failures) {
    await assert.rejects(
      requestReview(buildSignal(), 'delivery-planning', buildSettings(), { fetchImplementation: fetchImplementation }),
      function credentialIsRedacted(error) {
        assert.equal(error.message.includes(credential), false);
        return true;
      }
    );
  }
});

test('requestReview preserves AbortError for lifecycle handling', async function () {
  const abortError = new Error('aborted');
  abortError.name = 'AbortError';
  await assert.rejects(
    requestReview(buildSignal(), 'delivery-planning', buildSettings(), {
      fetchImplementation: async function abortStub() { throw abortError; }
    }),
    function isAbort(error) { return error === abortError; }
  );
});

function buildSettings() {
  return {
    baseUrl: 'https://api.groq.com/openai/',
    model: 'facilitator-model',
    apiKey: credential
  };
}

function buildSignal() {
  return {
    location: 'Workshop Harbor, Fictional Coast',
    isFallback: true,
    current: {
      temperature: 18,
      precipitation: 2.5,
      windSpeed: 22,
      cloudCover: 40
    },
    daily: { precipitationProbabilityMax: [70] }
  };
}

function buildValidReview() {
  return {
    summary: 'Rain and wind may affect the selected operation.',
    risks: ['Wet surfaces may slow handling.'],
    actions: ['Confirm covered staging is available.'],
    questions: ['Are local loading areas sheltered?'],
    evidence: [
      'WeatherSignal.current.precipitation',
      'WeatherSignal.current.windSpeed'
    ]
  };
}

function jsonContentResponse(content) {
  return {
    ok: true,
    status: 200,
    json: async function json() {
      return { choices: [{ message: { content: content } }] };
    }
  };
}
