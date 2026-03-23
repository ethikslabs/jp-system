'use strict';

const { Router } = require('express');
const pool = require('../db/pool');
const { generateLayout, LayoutError } = require('../services/layout-engine');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const redis = req.app.get('redis');
    const { lens_id } = req.body;

    if (!lens_id) {
      return res.status(400).json({
        error: 'invalid_lens_id',
        valid: ['founder', 'ciso', 'investor', 'board', 'sarvesh', 'val'],
      });
    }

    const spec = await generateLayout(lens_id, { pool, redis });
    return res.status(200).json(spec);
  } catch (err) {
    if (err instanceof LayoutError) {
      if (err.reason === 'invalid_lens_id') {
        return res.status(400).json({
          error: 'invalid_lens_id',
          valid: ['founder', 'ciso', 'investor', 'board', 'sarvesh', 'val'],
        });
      }
      if (err.reason === 'invalid_response') {
        return res.status(502).json({
          error: 'layout_generation_failed',
          reason: 'invalid_response',
        });
      }
      return res.status(502).json({
        error: 'layout_generation_failed',
        reason: err.reason,
      });
    }
    return res.status(502).json({
      error: 'layout_generation_failed',
      reason: 'unexpected_error',
    });
  }
});

module.exports = router;
