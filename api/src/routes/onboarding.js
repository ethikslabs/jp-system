'use strict';

const { Router } = require('express');
const pool = require('../db/pool');

const router = Router();

router.post('/', async (req, res) => {
  const { max_bpm } = req.body;

  if (max_bpm === undefined || max_bpm === null) {
    return res.status(400).json({ error: 'invalid_max_bpm' });
  }

  if (!Number.isInteger(max_bpm) || max_bpm <= 0) {
    return res.status(400).json({ error: 'invalid_max_bpm', reason: 'must be positive integer' });
  }

  try {
    await pool.query(
      'UPDATE onboarding SET max_bpm = $1, configured = TRUE, updated_at = NOW() WHERE id = 1',
      [max_bpm]
    );

    const redis = req.app.get('redis');
    await redis.set('bpm:max', String(max_bpm));

    return res.status(200).json({ max_bpm, status: 'configured' });
  } catch (err) {
    return res.status(500).json({ error: 'storage_error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT max_bpm, configured FROM onboarding WHERE id = 1'
    );

    if (rows.length === 0) {
      return res.status(200).json({ max_bpm: 60, configured: false });
    }

    return res.status(200).json({
      max_bpm: rows[0].max_bpm,
      configured: rows[0].configured,
    });
  } catch (err) {
    return res.status(500).json({ error: 'storage_error' });
  }
});

module.exports = router;
