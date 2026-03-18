'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { getLens } = require('../config/lenses');
const { COMPONENT_LIBRARY, isValidComponent } = require('../config/components');
const { getCurrentBPM } = require('./bpm-ticker');

// --- Custom Error ---

class LayoutError extends Error {
  constructor(reason) {
    super(`LayoutError: ${reason}`);
    this.name = 'LayoutError';
    this.reason = reason;
  }
}

// --- Lazy-init Anthropic client (created once at module level) ---

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

// --- 3-step validator (exported for testing) ---

/**
 * Validate a layout spec in 3 steps:
 * 1. JSON parse
 * 2. Structural schema check
 * 3. Component library check
 *
 * @param {string} responseText - Raw text from Claude API
 * @returns {{ valid: boolean, spec: object|null, step: number|null }}
 */
function validateLayoutSpec(responseText) {
  // Step 1: JSON parse
  let spec;
  try {
    spec = JSON.parse(responseText);
  } catch {
    return { valid: false, spec: null, step: 1 };
  }

  // Step 2: Structural schema check
  if (
    typeof spec.lens !== 'string' ||
    typeof spec.bpm_zone !== 'number' ||
    typeof spec.summary !== 'string' ||
    !Array.isArray(spec.layout)
  ) {
    return { valid: false, spec: null, step: 2 };
  }

  // Step 3: Component library check
  for (const item of spec.layout) {
    if (!item.component || !isValidComponent(item.component)) {
      return { valid: false, spec: null, step: 3 };
    }
  }

  return { valid: true, spec, step: null };
}

// --- System prompt (exact from design doc) ---

const SYSTEM_PROMPT =
  'You are a dashboard layout engine. You receive a pulse stream and a lens definition. ' +
  'You return a JSON layout spec selecting components from the provided library. ' +
  'You never invent new components. You never return HTML. You never return prose. ' +
  'The summary field is one sentence maximum. Select components that matter most for ' +
  'this lens and audience. Return valid JSON only.';

// --- Main layout generation ---

/**
 * Generate a layout spec for the given lens.
 *
 * @param {string} lensId - One of: founder, ciso, investor, board
 * @param {object} deps - { pool, redis }
 * @returns {Promise<object>} Layout spec
 * @throws {LayoutError}
 */
async function generateLayout(lensId, { pool, redis }) {
  // 1. Validate lensId
  const lens = getLens(lensId);
  if (!lens) {
    throw new LayoutError('invalid_lens_id');
  }

  // 2. Check pulse count in window — if zero, return empty-stream fallback (not cached)
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM pulses WHERE timestamp >= NOW() - interval '60 seconds'`
  );
  const pulseCount = countResult.rows[0].count;

  if (pulseCount === 0) {
    return {
      lens: lensId,
      bpm_zone: 1,
      summary: 'No recent activity',
      layout: [
        { component: 'AlertFeed', title: 'Activity', message: 'No recent activity' },
      ],
    };
  }

  // 3. Check Redis cache
  const cacheKey = `layout:${lensId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 4. Lens definition already loaded in step 1

  // 5. Fetch recent pulses
  const pulsesResult = await pool.query(
    `SELECT * FROM pulses WHERE timestamp >= NOW() - interval '60 seconds' ORDER BY timestamp ASC, id ASC`
  );
  const recentPulses = pulsesResult.rows;

  // 6. Fetch current BPM snapshot
  const bpmSnapshot = await getCurrentBPM(redis);
  const currentBpm = bpmSnapshot ? bpmSnapshot.current : 1;
  const bpmZone = bpmSnapshot ? bpmSnapshot.zone : 1;

  // 7. Build Claude API payload
  const payload = {
    lens,
    recent_pulses: recentPulses,
    current_bpm: currentBpm,
    bpm_zone: bpmZone,
    system_baseline_bpm: 20,
    available_components: COMPONENT_LIBRARY,
  };

  // 8 & 9. Call Claude API with retry logic
  const client = getClient();
  let lastStep = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    });

    const responseText =
      response.content && response.content[0] && response.content[0].text
        ? response.content[0].text
        : '';

    const result = validateLayoutSpec(responseText);

    if (result.valid) {
      // 10. Cache and return
      await redis.set(cacheKey, JSON.stringify(result.spec), 'EX', 30);
      return result.spec;
    }

    lastStep = result.step;

    // First attempt failed — retry once
    if (attempt === 0) {
      continue;
    }
  }

  // Both attempts failed
  throw new LayoutError('invalid_response');
}

module.exports = { generateLayout, LayoutError, validateLayoutSpec };
