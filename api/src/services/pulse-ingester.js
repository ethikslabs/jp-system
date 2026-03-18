'use strict';

// --- Custom Error Classes ---

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class DuplicateError extends Error {
  constructor(id, source) {
    super(`Duplicate pulse: ${id} from ${source}`);
    this.name = 'DuplicateError';
    this.id = id;
    this.source = source;
  }
}

// --- Constants ---

const SUPPORTED_VERSIONS = ['1.0'];
const VALID_TYPES = ['event', 'metric', 'state', 'alert'];
const VALID_ENTITY_TYPES = ['project', 'user', 'vendor', 'system'];
const VALID_SEVERITIES = ['info', 'warning', 'critical'];
const DEDUP_TTL = 300; // seconds

// UUID v4 pattern (loose — accepts any hex in the right shape)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// --- Validation helpers ---

function validateSchemaVersion(pulse) {
  if (!SUPPORTED_VERSIONS.includes(pulse.schema_version)) {
    throw new ValidationError('unsupported_schema_version', {
      supported: SUPPORTED_VERSIONS,
    });
  }
}

function validateCanonicalSchema(pulse) {
  // id — non-empty string, UUID format
  if (typeof pulse.id !== 'string' || !UUID_RE.test(pulse.id)) {
    throw new ValidationError('schema_validation_failed', {
      field: 'id',
      reason: 'must be a non-empty string in UUID format',
    });
  }

  // timestamp — valid ISO8601 string
  if (typeof pulse.timestamp !== 'string' || isNaN(Date.parse(pulse.timestamp))) {
    throw new ValidationError('schema_validation_failed', {
      field: 'timestamp',
      reason: 'must be a valid ISO8601 string',
    });
  }

  // source — non-empty string
  if (typeof pulse.source !== 'string' || pulse.source.length === 0) {
    throw new ValidationError('schema_validation_failed', {
      field: 'source',
      reason: 'must be a non-empty string',
    });
  }

  // type — enum
  if (!VALID_TYPES.includes(pulse.type)) {
    throw new ValidationError('schema_validation_failed', {
      field: 'type',
      reason: `must be one of: ${VALID_TYPES.join(', ')}`,
    });
  }

  // entity_type — enum
  if (!VALID_ENTITY_TYPES.includes(pulse.entity_type)) {
    throw new ValidationError('schema_validation_failed', {
      field: 'entity_type',
      reason: `must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
    });
  }

  // entity_id — non-empty string
  if (typeof pulse.entity_id !== 'string' || pulse.entity_id.length === 0) {
    throw new ValidationError('schema_validation_failed', {
      field: 'entity_id',
      reason: 'must be a non-empty string',
    });
  }

  // severity — enum
  if (!VALID_SEVERITIES.includes(pulse.severity)) {
    throw new ValidationError('schema_validation_failed', {
      field: 'severity',
      reason: `must be one of: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  // payload — object (not null, not array)
  if (
    typeof pulse.payload !== 'object' ||
    pulse.payload === null ||
    Array.isArray(pulse.payload)
  ) {
    throw new ValidationError('schema_validation_failed', {
      field: 'payload',
      reason: 'must be a plain object (not null, not array)',
    });
  }

  // tags — array of strings
  if (
    !Array.isArray(pulse.tags) ||
    !pulse.tags.every((t) => typeof t === 'string')
  ) {
    throw new ValidationError('schema_validation_failed', {
      field: 'tags',
      reason: 'must be an array of strings',
    });
  }

  // schema_version — string (already checked value in step 1, just type-check here)
  if (typeof pulse.schema_version !== 'string') {
    throw new ValidationError('schema_validation_failed', {
      field: 'schema_version',
      reason: 'must be a string',
    });
  }
}

// --- Dedup ---

async function checkDedup(pulse, redis) {
  const key = `dedup:${pulse.id}:${pulse.source}`;
  // SET key "1" NX EX 300 — returns "OK" if set, null if already exists
  const result = await redis.set(key, '1', 'EX', DEDUP_TTL, 'NX');
  if (result === null) {
    throw new DuplicateError(pulse.id, pulse.source);
  }
}

// --- Store ---

const INSERT_SQL = `
  INSERT INTO pulses (id, timestamp, source, type, entity_type, entity_id, severity, payload, tags, schema_version)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

async function storePulse(pulse, pool) {
  await pool.query(INSERT_SQL, [
    pulse.id,
    pulse.timestamp,
    pulse.source,
    pulse.type,
    pulse.entity_type,
    pulse.entity_id,
    pulse.severity,
    JSON.stringify(pulse.payload),
    pulse.tags,
    pulse.schema_version,
  ]);
}

// --- Main entry point ---

/**
 * Ingest a pulse through the strict validation pipeline.
 *
 * @param {object} pulseBody - The raw pulse object to ingest
 * @param {object} deps - Injected dependencies
 * @param {object} [deps.pool] - Postgres pool (defaults to require('../db/pool'))
 * @param {object} deps.redis - Redis client (required)
 * @returns {Promise<{stored: true, pulse: object}>}
 * @throws {ValidationError} on schema version or canonical schema failure
 * @throws {DuplicateError} on duplicate (id, source) within dedup window
 */
async function ingestPulse(pulseBody, { pool, redis } = {}) {
  const pg = pool || require('../db/pool');

  // 1. Schema version check
  validateSchemaVersion(pulseBody);

  // 2. Canonical schema enforcement
  validateCanonicalSchema(pulseBody);

  // 3. Dedup check
  await checkDedup(pulseBody, redis);

  // 4. Store
  await storePulse(pulseBody, pg);

  return { stored: true, pulse: pulseBody };
}

module.exports = {
  ingestPulse,
  ValidationError,
  DuplicateError,
  // Exported for testing
  SUPPORTED_VERSIONS,
  VALID_TYPES,
  VALID_ENTITY_TYPES,
  VALID_SEVERITIES,
};
