'use strict';

const { Router } = require('express');
const { getCurrentBPM } = require('../services/bpm-ticker');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const redis = req.app.get('redis');
    const snapshot = await getCurrentBPM(redis);

    if (!snapshot) {
      return res.status(503).json({ error: 'bpm_unavailable' });
    }

    return res.status(200).json(snapshot);
  } catch (err) {
    return res.status(503).json({ error: 'bpm_unavailable' });
  }
});

module.exports = router;
