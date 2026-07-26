(function createWeatherReviewNamespace(globalObject, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  globalObject.WeatherReview = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createWeatherReviewApi() {
  const REQUIRED_FIELDS = ['summary', 'risks', 'actions', 'questions', 'evidence'];
  const SYSTEM_PROMPT = [
    'Return one JSON object with exactly five fields: summary, risks, actions, questions, evidence.',
    'summary must be a non-empty string of 1 to 3 sentences explaining what the weather means for the chosen scenario.',
    'risks, actions, questions, and evidence must each be arrays of 1 to 6 non-empty plain-text strings.',
    'Keep risks and actions weather-related. Questions must identify unknowns without inventing answers.',
    'Every evidence item must be a real dot-delimited field path on the supplied signal and must start with WeatherSignal.',
    'Do not return Markdown, HTML, commentary, or fields outside this contract.'
  ].join(' ');

  async function requestReview(signal, scenario, settings, options) {
    const requestOptions = options || {};
    validateRequestInputs(signal, scenario, settings);
    const url = `${settings.baseUrl.trim().replace(/\/+$/, '')}/v1/chat/completions`;

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify({ signal: signal, scenario: scenario }) }
          ],
          stream: false,
          response_format: { type: 'json_object' },
          temperature: 0.2
        }),
        signal: requestOptions.signal
      });
    } catch (error) {
      if (error && error.name === 'AbortError') {
        throw error;
      }
      throw new Error('Model request could not be completed. Check the endpoint, network, and browser CORS access.');
    }

    if (!response.ok) {
      throw new Error(`Model request failed with status ${response.status}.`);
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error('Model returned an unreadable response.');
    }

    const content = payload && payload.choices && payload.choices[0] &&
      payload.choices[0].message && payload.choices[0].message.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Model returned no review content.');
    }

    let review;
    try {
      review = JSON.parse(content);
    } catch (error) {
      throw new Error('Model review was not valid JSON.');
    }

    return validateReview(review, signal);
  }

  function validateRequestInputs(signal, scenario, settings) {
    if (!isPlainObject(signal)) {
      throw new Error('Weather evidence is required before generating a review.');
    }
    if (typeof scenario !== 'string' || !scenario.trim()) {
      throw new Error('Choose a scenario before generating a review.');
    }
    if (!isPlainObject(settings) || typeof settings.baseUrl !== 'string' || !settings.baseUrl.trim()) {
      throw new Error('Groq endpoint is required.');
    }
    if (typeof settings.apiKey !== 'string' || !settings.apiKey) {
      throw new Error('Temporary demo credential is required.');
    }
  }

  function validateReview(review, signal) {
    if (!isPlainObject(review)) {
      throw new Error('Model review must be a JSON object.');
    }

    const fields = Object.keys(review).sort();
    const expectedFields = REQUIRED_FIELDS.slice().sort();
    if (fields.length !== expectedFields.length || fields.some(function differs(field, index) {
      return field !== expectedFields[index];
    })) {
      throw new Error('Model review must contain exactly summary, risks, actions, questions, and evidence.');
    }

    const summary = requireNonEmptyString(review.summary, 'summary');
    const sentenceCount = countSentences(summary);
    if (sentenceCount < 1 || sentenceCount > 3) {
      throw new Error('Model review summary must contain 1 to 3 sentences.');
    }

    const validated = { summary: summary };
    ['risks', 'actions', 'questions', 'evidence'].forEach(function validateList(field) {
      validated[field] = validateStringArray(review[field], field);
    });

    validated.evidence.forEach(function validateEvidencePath(path, index) {
      if (!resolvesWeatherSignalPath(path, signal)) {
        throw new Error(`Model review evidence item ${index + 1} contains a path that does not exist on the WeatherSignal.`);
      }
    });

    return validated;
  }

  function validateStringArray(value, field) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 6) {
      throw new Error(`Model review ${field} must contain 1 to 6 items.`);
    }
    return value.map(function validateItem(item, index) {
      return requireNonEmptyString(item, `${field}[${index}]`);
    });
  }

  function requireNonEmptyString(value, field) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Model review ${field} must be a non-empty string.`);
    }
    return value.trim();
  }

  function countSentences(value) {
    const parts = value.trim().split(/[.!?]+(?:\s+|$)/).filter(function hasText(part) {
      return part.trim().length > 0;
    });
    return parts.length || 1;
  }

  function resolvesWeatherSignalPath(path, signal) {
    const segments = path.split('.');
    if (segments.length < 2 || segments.shift() !== 'WeatherSignal') {
      return false;
    }

    let value = signal;
    return segments.every(function resolveSegment(segment) {
      if (!segment || value === null || (typeof value !== 'object' && typeof value !== 'function')) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(value, segment)) {
        return false;
      }
      value = value[segment];
      return value !== undefined;
    });
  }

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  return {
    SYSTEM_PROMPT: SYSTEM_PROMPT,
    requestReview: requestReview,
    validateReview: validateReview
  };
});