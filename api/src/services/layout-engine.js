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
  // Step 1: JSON parse — strip markdown fences if present
  let spec;
  try {
    const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    spec = JSON.parse(cleaned);
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
  'You are a dashboard layout engine for a Founder SIEM — a real-time operating dashboard. ' +
  'You receive a pulse stream and a lens definition. ' +
  'You return a JSON layout spec using ALL components from the provided library. ' +
  'IMPORTANT: You must include every single component in available_components in the layout array. ' +
  'All 12 components must appear. Order them by relevance to the lens and pulse data — most important first. ' +
  'Populate each component with real data extracted from the pulse stream. ' +
  'Use specific numbers, names, and values from the pulses — never use placeholder text. ' +

  // Language rules
  'LANGUAGE: Write for a founder, not an AWS console. ' +
  'Say "servers" not "fleet" or "EC2 instances". ' +
  'Say "your servers" not "EC2 Instance Health Overview". ' +
  'Say "CPU" not "EC2 CPU Utilisation — Active Instances". ' +
  'Say "Server Alerts" not "Critical EC2 Health Alerts". ' +
  'Say "Infrastructure Gap" not "Fleet Coverage Gap". ' +
  'Never use the word "fleet" or "Fleet". ' +

  // EC2 naming
  'For EC2 pulses, use payload.name (the human-readable name) not payload.instance_id. ' +
  'When summarising multiple similar items, group them: "7 servers stopped" not individual IDs. ' +

  // AlertFeed format
  'AlertFeed alerts must include: source, severity, message, timestamp, and entity_id fields. ' +
  'entity_id is the repo name for github pulses, instance name for aws pulses. ' +

  // CostTracker
  'CostTracker: ONLY use pulses with source="aws" and tags including "cost". ' +
  'If no aws/cost pulses exist, omit the data field entirely — do not invent cost figures. ' +
  'When cost data exists, data must be an array of { source: string, spend: number } objects. ' +
  'ActivitySparkline for CPU: include current (latest value), unit="%", threshold=80, showYAxis=true, ' +
  'and points as array of {hour, value} from cpu_utilization pulses. ' +

  'You never invent new components. You never return HTML. You never return prose. ' +
  'You never wrap your response in markdown fences or backticks. ' +
  'The summary field is one sentence, max 80 characters — name specific signals, not generalities. ' +
  'You must return ONLY a raw JSON object with exactly these fields: ' +
  '"lens" (string), "bpm_zone" (number), "summary" (string), "layout" (array of 12 items). ' +
  'Each layout item must have a "component" field matching one of the available_components, ' +
  'plus a "title" field and any data fields the component uses. ' +
  'No other top-level fields. No prose. No markdown. Raw JSON only.';

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

  // 5. Fetch recent pulses — cap at 50 most recent to keep payload manageable
  const pulsesResult = await pool.query(
    `SELECT id, timestamp, source, type, entity_type, entity_id, severity, payload, tags
     FROM pulses WHERE timestamp >= NOW() - interval '60 seconds'
     ORDER BY timestamp DESC, id DESC LIMIT 50`
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
    let response;
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new LayoutError('timeout')), 60000)
      );
      response = await Promise.race([
        client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: JSON.stringify(payload) }],
        }),
        timeout,
      ]);
    } catch (err) {
      console.error(`[layout-engine] Claude API error (attempt ${attempt + 1}): ${err.message}${err.status ? ` | status: ${err.status}` : ''}`);
      throw err;
    }

    const responseText =
      response.content && response.content[0] && response.content[0].text
        ? response.content[0].text
        : '';

    console.log(`[layout-engine] Claude response (attempt ${attempt + 1}):`, responseText);
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
