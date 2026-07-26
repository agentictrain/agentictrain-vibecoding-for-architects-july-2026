import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { requestReview, validateReview } = require('../app/review.js');

test('requestReview uses the exact Groq chat-completions contract', async function () {
  const originalFetch = globalThis.fetch;
  let capturedUrl;
  let capturedOptions;
  globalThis.fetch = async function fetchStub(url, options) {
    capturedUrl = url;
    capturedOptions = options;
    return jsonResponse(buildValidReview());
  };

  try {
    const signal = buildSignal();
    const review = await requestReview(signal, 'warehouse-planning', buildSettings());
    const body = JSON.parse(capturedOptions.body);
    const userContent = JSON.parse(body.messages[1].content);

    assert.equal(capturedUrl, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(capturedOptions.method, 'POST');
    assert.equal(capturedOptions.headers['Content-Type'], 'application/json');
    assert.equal(capturedOptions.headers.Authorization, 'Bearer test');
    assert.equal(body.model, 'facilitator-model');
    assert.equal(body.stream, false);
    assert.deepEqual(body.response_format, { type: 'json_object' });
    assert.equal(body.temperature, 0.2);
    assert.deepEqual(userContent, { signal: signal, scenario: 'warehouse-planning' });
    assert.deepEqual(review, buildValidReview());
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestReview accepts Groq reasoning metadata and current-condition evidence paths', async function () {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function groqResponseStub() {
    return {
      ok: true,
      status: 200,
      json: async function json() {
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                summary: 'Hot, dry conditions may affect warehouse operations.',
                risks: ['Heat stress may affect staff.'],
                actions: ['Provide hydration and shade.'],
                questions: ['Will temperatures increase?'],
                evidence: [
                  'WeatherSignal.current.temperature',
                  'WeatherSignal.current.windSpeed',
                  'WeatherSignal.current.cloudCover'
                ]
              }),
              reasoning: 'Provider reasoning metadata is not part of the review contract.'
            }
          }],
          x_groq: { id: 'request-metadata' }
        };
      }
    };
  };

  try {
    const review = await requestReview(buildSignal(), 'warehouse-planning', buildSettings());
    assert.deepEqual(review.evidence, [
      'WeatherSignal.current.temperature',
      'WeatherSignal.current.windSpeed',
      'WeatherSignal.current.cloudCover'
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
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

test('validateReview rejects missing and extra fields', function () {
  const missing = buildValidReview();
  delete missing.questions;
  assert.throws(function validateMissing() {
    validateReview(missing, buildSignal());
  }, /exactly summary/);

  const extra = { ...buildValidReview(), confidence: 'high' };
  assert.throws(function validateExtra() {
    validateReview(extra, buildSignal());
  }, /exactly summary/);
});

test('validateReview rejects invalid summary and array cardinality', function () {
  const longSummary = buildValidReview();
  longSummary.summary = 'One. Two. Three. Four.';
  assert.throws(function validateLongSummary() {
    validateReview(longSummary, buildSignal());
  }, /1 to 3 sentences/);

  const emptyRisks = buildValidReview();
  emptyRisks.risks = [];
  assert.throws(function validateEmptyRisks() {
    validateReview(emptyRisks, buildSignal());
  }, /risks must contain 1 to 6 items/);

  const blankAction = buildValidReview();
  blankAction.actions = ['   '];
  assert.throws(function validateBlankAction() {
    validateReview(blankAction, buildSignal());
  }, /actions\[0\] must be a non-empty string/);
});

test('validateReview rejects evidence paths that do not exist on the signal', function () {
  const review = buildValidReview();
  const untrustedPath = 'WeatherSignal.current.roadCondition-secret-response-text';
  review.evidence = [untrustedPath];
  assert.throws(
    function validateUnknownPath() {
      validateReview(review, buildSignal());
    },
    function doesNotReflectModelText(error) {
      return /evidence item 1 contains a path that does not exist/.test(error.message) &&
        !error.message.includes(untrustedPath);
    }
  );
});

test('requestReview rejects missing content, malformed JSON, and non-2xx replies', async function (t) {
  const originalFetch = globalThis.fetch;
  t.after(function restoreFetch() {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async function missingContentStub() {
    return { ok: true, json: async function json() { return { choices: [] }; } };
  };
  await assert.rejects(requestReview(buildSignal(), 'delivery-planning', buildSettings()), /no review content/);

  globalThis.fetch = async function malformedJsonStub() {
    return jsonContentResponse('{not-json');
  };
  await assert.rejects(requestReview(buildSignal(), 'delivery-planning', buildSettings()), /not valid JSON/);

  globalThis.fetch = async function statusStub() {
    return { ok: false, status: 401 };
  };
  await assert.rejects(requestReview(buildSignal(), 'delivery-planning', buildSettings()), /status 401/);
});

test('requestReview does not expose credentials when fetch fails', async function () {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function failedFetchStub() {
    throw new Error('request with test failed');
  };

  try {
    await assert.rejects(
      requestReview(buildSignal(), 'delivery-planning', buildSettings()),
      function credentialIsRedacted(error) {
        return /could not be completed/.test(error.message) && !error.message.includes('request with test');
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function buildSettings() {
  return {
    baseUrl: 'https://api.groq.com/openai/',
    model: 'facilitator-model',
    apiKey: 'test'
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
    daily: {
      precipitationProbabilityMax: [70]
    }
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

function jsonResponse(review) {
  return jsonContentResponse(JSON.stringify(review));
}

function jsonContentResponse(content) {
  return {
    ok: true,
    status: 200,
    json: async function json() {
      return {
        choices: [{ message: { content: content } }]
      };
    }
  };
}