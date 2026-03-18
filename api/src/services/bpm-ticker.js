'use strict';

const { Queue, Worker } = require('bullmq');

// --- Constants ---

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_BASELINE = 20;
const BPM_CURRENT_KEY = 'bpm:current';
const BPM_MAX_KEY = 'bpm:max';
const DEFAULT_MAX_BPM = 60;

// --- Zone Calculation (pure function) ---

/**
 * Compute zone from current BPM and max BPM.
 * percentage = (currentBpm / maxBpm) * 100
 * Zone 1: 0–50%, Zone 2: 50–65%, Zone 3: 65–75%, Zone 4: 75–90%, Zone 5: 90–100%
 *
 * @param {number} currentBpm
 * @param {number} maxBpm
 * @returns {number} zone 1–5
 */
function computeZone(currentBpm, maxBpm) {
  const percentage = (currentBpm / maxBpm) * 100;
  if (percentage >= 90) return 5;
  if (percentage >= 75) return 4;
  if (percentage >= 65) return 3;
  if (percentage >= 50) return 2;
  return 1;
}

// --- Tick (called by BullMQ every 1s) ---

/**
 * Compute BPM from pulse count in the rolling window and write snapshot to Redis.
 *
 * @param {object} params
 * @param {object} [params.pool] - Postgres pool (defaults to require('../db/pool'))
 * @param {object} params.redis - Redis client
 * @param {number} [params.windowSeconds=60] - Rolling window size
 */
async function tick({ pool, redis, windowSeconds = DEFAULT_WINDOW_SECONDS } = {}) {
  const pg = pool || require('../db/pool');

  // 1. Count pulses in the rolling window
  const countResult = await pg.query(
    `SELECT COUNT(*)::int AS count FROM pulses WHERE timestamp >= NOW() - interval '${windowSeconds} seconds'`
  );
  const count = countResult.rows[0].count;

  // 2. Compute current BPM — floor of 1, never zero
  const currentBpm = Math.max(1, Math.round(count / windowSeconds * 60));

  // 3. Read max_bpm from Redis (default 60 if not set)
  const maxRaw = await redis.get(BPM_MAX_KEY);
  const maxBpm = maxRaw ? parseInt(maxRaw, 10) : DEFAULT_MAX_BPM;

  // 4. Compute zone
  const zone = computeZone(currentBpm, maxBpm);

  // 5. Write snapshot to Redis hash
  await redis.hmset(BPM_CURRENT_KEY, {
    current: currentBpm,
    baseline: DEFAULT_BASELINE,
    max: maxBpm,
    zone: zone,
    window_seconds: windowSeconds,
  });
}

// --- Read latest BPM snapshot ---

/**
 * Read the latest BPM snapshot from Redis.
 *
 * @param {object} redis - Redis client
 * @returns {Promise<{current: number, baseline: number, max: number, zone: number, window_seconds: number}|null>}
 */
async function getCurrentBPM(redis) {
  const data = await redis.hgetall(BPM_CURRENT_KEY);

  // hgetall returns {} when key doesn't exist
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return {
    current: parseInt(data.current, 10),
    baseline: parseInt(data.baseline, 10),
    max: parseInt(data.max, 10),
    zone: parseInt(data.zone, 10),
    window_seconds: parseInt(data.window_seconds, 10),
  };
}

// --- BullMQ Setup ---

/**
 * Create BullMQ Queue and Worker for the BPM tick job.
 *
 * @param {object} params
 * @param {object} params.redis - Redis client (ioredis instance or connection config)
 * @param {object} [params.pool] - Postgres pool
 * @param {number} [params.windowSeconds=60] - Rolling window size
 * @returns {{ queue: Queue, worker: Worker }}
 */
function setupBPMTicker({ redis, pool, windowSeconds = DEFAULT_WINDOW_SECONDS } = {}) {
  const connection = redis;

  const queue = new Queue('bpm-tick', { connection });

  // Add repeatable job — every 1000ms
  queue.add('compute-bpm', {}, {
    repeat: { every: 1000 },
  });

  const worker = new Worker(
    'bpm-tick',
    async () => {
      await tick({ pool, redis, windowSeconds });
    },
    { connection, concurrency: 1 }
  );

  return { queue, worker };
}

module.exports = {
  tick,
  getCurrentBPM,
  computeZone,
  setupBPMTicker,
  // Exported for testing
  DEFAULT_WINDOW_SECONDS,
  DEFAULT_BASELINE,
  DEFAULT_MAX_BPM,
  BPM_CURRENT_KEY,
  BPM_MAX_KEY,
};
