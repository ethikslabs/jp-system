'use strict';

require('dotenv').config();

const express = require('express');
const Redis = require('ioredis');
const pool = require('./src/db/pool');
const { setupBPMTicker } = require('./src/services/bpm-ticker');
const { startSimulator, stopSimulator } = require('./src/services/pulse-simulator');

// --- Express app ---

const app = express();
app.use(express.json());

// --- Redis ---

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.set('redis', redis);

// --- Mount route modules ---

app.use('/pulses', require('./src/routes/pulses'));
app.use('/bpm', require('./src/routes/bpm'));
app.use('/layout', require('./src/routes/layout'));
app.use('/onboarding', require('./src/routes/onboarding'));

// --- Background services ---

const { queue: bpmQueue, worker: bpmWorker } = setupBPMTicker({ redis, pool });
const simHandle = startSimulator({ pool, redis });

// --- Global error handler (JSON only, no HTML) ---

app.use((err, _req, res, _next) => {
  console.error('[global-error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'internal_error' });
});

// --- Graceful shutdown ---

async function shutdown(signal) {
  console.log(`\n[shutdown] Received ${signal}, shutting down…`);
  try {
    stopSimulator(simHandle);
    await bpmWorker.close();
    await bpmQueue.close();
    redis.disconnect();
    await pool.end();
    console.log('[shutdown] Cleanup complete');
  } catch (err) {
    console.error('[shutdown] Error during cleanup:', err);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// --- Start server ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dashboard API listening on port ${PORT}`);
});

module.exports = app;
