'use strict';

const { Router } = require('express');
const { ingestPulse, ValidationError, DuplicateError } = require('../services/pulse-ingester');

const router = Router();

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
