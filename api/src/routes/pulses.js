'use strict';

const { Router } = require('express');
const { ingestPulse, ValidationError, DuplicateError } = require('../services/pulse-ingester');
const pool = require('../db/pool');

const router = Router();

// GET /pulses?entity_id=X&source=Y&limit=5 — recent pulses, filtered by entity_id or source
router.get('/', async (req, res) => {
  const { entity_id, source, limit = 10 } = req.query;
  if (!entity_id && !source) return res.status(400).json({ error: 'entity_id or source required' });
  const cap = Math.min(parseInt(limit, 10) || 10, 50);
  try {
    let query, params;
    if (entity_id && source) {
      query = `SELECT id, source, type, entity_type, entity_id, severity, payload, timestamp
               FROM pulses WHERE entity_id = $1 AND source = $2 ORDER BY timestamp DESC LIMIT $3`;
      params = [entity_id, source, cap];
    } else if (entity_id) {
      query = `SELECT id, source, type, entity_type, entity_id, severity, payload, timestamp
               FROM pulses WHERE entity_id = $1 ORDER BY timestamp DESC LIMIT $2`;
      params = [entity_id, cap];
    } else {
      query = `SELECT id, source, type, entity_type, entity_id, severity, payload, timestamp
               FROM pulses WHERE source = $1 ORDER BY timestamp DESC LIMIT $2`;
      params = [source, cap];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'storage_error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const redis = req.app.get('redis');
    const result = await ingestPulse(req.body, { redis });
    return res.status(201).json({ stored: true, id: result.pulse.id });
  } catch (err) {
    if (err instanceof ValidationError) {
      if (err.message === 'unsupported_schema_version') {
        return res.status(400).json({
          error: 'unsupported_schema_version',
          supported: err.details.supported,
        });
      }
      // schema_validation_failed
      return res.status(400).json({
        error: 'schema_validation_failed',
        details: `${err.details.field}: ${err.details.reason}`,
      });
    }
    if (err instanceof DuplicateError) {
      return res.status(409).json({
        error: 'duplicate_pulse',
        id: err.id,
        source: err.source,
      });
    }
    // Storage or unexpected error
    return res.status(500).json({ error: 'storage_error' });
  }
});

module.exports = router;
