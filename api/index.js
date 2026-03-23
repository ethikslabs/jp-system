'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const pool = require('./src/db/pool');
const { setupBPMTicker } = require('./src/services/bpm-ticker');
const { startSimulator, stopSimulator } = require('./src/services/pulse-simulator');
const { startAWSPoller, stopAWSPoller } = require('./src/services/aws-poller');
const { startCompliancePoller, stopCompliancePoller } = require('./src/services/compliance-poller');
const { startCloudflarePoller, stopCloudflarePoller } = require('./src/services/cloudflare-poller');

// --- Express app ---

const app = express();
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

// --- Redis ---

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.set('redis', redis);

// --- Mount route modules ---

app.use('/pulses', require('./src/routes/pulses'));
app.use('/bpm', require('./src/routes/bpm'));
app.use('/layout', require('./src/routes/layout'));
app.use('/onboarding', require('./src/routes/onboarding'));
app.use('/webhooks', require('./src/routes/webhooks'));
app.use('/actions', require('./src/routes/actions'));

// --- Background services ---

const { queue: bpmQueue, worker: bpmWorker, connection: bpmRedis } = setupBPMTicker({ redis, pool });
const simHandle = process.env.ENABLE_SIMULATOR !== 'false' ? startSimulator({ pool, redis }) : null;
if (!simHandle) console.log('[simulator] Disabled via ENABLE_SIMULATOR=false');
const awsPollerHandle = startAWSPoller({ pool, redis });
const complianceHandle = startCompliancePoller({ pool, redis });
let cfHandle = { stop: () => {} };
startCloudflarePoller({ pool, redis }).then(h => { cfHandle = h; });

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
    stopAWSPoller(awsPollerHandle);
    stopCompliancePoller(complianceHandle);
    stopCloudflarePoller(cfHandle);
    await bpmWorker.close();
    await bpmQueue.close();
    bpmRedis.disconnect();
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
  const key = process.env.ANTHROPIC_API_KEY;
  console.log(`Dashboard API listening on port ${PORT}`);
  console.log(`[startup] ANTHROPIC_API_KEY: ${key ? `present, starts with "${key.slice(0, 10)}"` : 'MISSING'}`);
});

module.exports = app;
