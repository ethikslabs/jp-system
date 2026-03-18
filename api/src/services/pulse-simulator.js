'use strict';

const { v4: uuidv4 } = require('uuid');
const { ingestPulse } = require('./pulse-ingester');

// --- Source templates ---

const SOURCES = ['github', 'stripe', 'auth0', 'hubspot', 'proof360', 'system', 'aws'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function githubPulse() {
  const templates = [
    {
      entity_type: 'project',
      payload: { action: 'commit', sha: uuidv4().slice(0, 8), message: pick(['fix typo', 'add feature', 'refactor module', 'update deps']), branch: pick(['main', 'develop', 'feature/auth']) },
      tags: ['commit'],
    },
    {
      entity_type: 'project',
      payload: { action: 'pull_request', number: randomInt(1, 500), title: pick(['Add login flow', 'Fix dashboard bug', 'Update README']), pr_action: pick(['opened', 'merged', 'closed']) },
      tags: ['pr'],
    },
    {
      entity_type: 'project',
      payload: { action: 'deployment', environment: pick(['production', 'staging', 'preview']), status: pick(['success', 'pending', 'failure']) },
      tags: ['deployment'],
    },
    {
      entity_type: 'project',
      payload: { action: 'issue', number: randomInt(1, 300), title: pick(['Bug in auth', 'Feature request', 'Performance issue']), issue_action: pick(['opened', 'closed', 'reopened']) },
      tags: ['issue'],
    },
  ];
  const t = pick(templates);
  return { source: 'github', type: 'event', entity_type: t.entity_type, payload: t.payload, tags: t.tags, severity: 'info' };
}

function stripePulse() {
  const templates = [
    {
      payload: { action: 'payment', amount: randomInt(10, 5000), currency: 'usd', status: pick(['succeeded', 'pending']) },
      tags: ['payment'],
      severity: 'info',
    },
    {
      payload: { action: 'subscription', plan: pick(['starter', 'pro', 'enterprise']), status: pick(['active', 'trialing', 'canceled']) },
      tags: ['subscription'],
      severity: 'info',
    },
    {
      payload: { action: 'failed_charge', amount: randomInt(10, 2000), reason: pick(['card_declined', 'insufficient_funds', 'expired_card']) },
      tags: ['failed_charge'],
      severity: 'warning',
    },
  ];
  const t = pick(templates);
  return { source: 'stripe', type: 'event', entity_type: 'system', payload: t.payload, tags: t.tags, severity: t.severity };
}

function auth0Pulse() {
  const templates = [
    {
      payload: { action: 'login', user_id: `user_${randomInt(1, 200)}`, method: pick(['password', 'google', 'github', 'sso']) },
      tags: ['login'],
    },
    {
      payload: { action: 'new_account', user_id: `user_${randomInt(200, 500)}`, email_domain: pick(['gmail.com', 'company.co', 'outlook.com']) },
      tags: ['new_account'],
    },
    {
      payload: { action: 'access_event', resource: pick(['/api/data', '/admin', '/dashboard']), access_action: pick(['read', 'write', 'delete']) },
      tags: ['access'],
    },
  ];
  const t = pick(templates);
  return { source: 'auth0', type: 'event', entity_type: 'user', payload: t.payload, tags: t.tags, severity: 'info' };
}

function hubspotPulse() {
  const templates = [
    {
      payload: { action: 'contact', name: pick(['Alice', 'Bob', 'Carol', 'Dave']), source: pick(['organic', 'referral', 'paid']) },
      tags: ['contact'],
    },
    {
      payload: { action: 'lifecycle_change', stage: pick(['lead', 'mql', 'sql', 'customer']), previous_stage: pick(['subscriber', 'lead', 'mql']) },
      tags: ['lifecycle'],
    },
    {
      payload: { action: 'deal', name: pick(['Enterprise deal', 'Startup package', 'Renewal']), amount: randomInt(1000, 50000), stage: pick(['discovery', 'proposal', 'closed_won', 'closed_lost']) },
      tags: ['deal'],
    },
  ];
  const t = pick(templates);
  return { source: 'hubspot', type: 'event', entity_type: 'user', payload: t.payload, tags: t.tags, severity: 'info' };
}

function proof360Pulse() {
  const templates = [
    {
      payload: { action: 'assessment', assessment_id: `assess_${randomInt(1, 100)}`, status: pick(['started', 'in_progress', 'completed']) },
      tags: ['assessment'],
    },
    {
      payload: { action: 'trust_score', score: randomInt(50, 100), previous_score: randomInt(40, 95) },
      tags: ['trust_score'],
    },
    {
      payload: { action: 'gap_completion', gap_id: `gap_${randomInt(1, 50)}`, vendor: pick(['AWS', 'Azure', 'GCP', 'Cloudflare']) },
      tags: ['gap_completion'],
    },
  ];
  const t = pick(templates);
  return { source: 'proof360', type: 'event', entity_type: 'project', payload: t.payload, tags: t.tags, severity: 'info' };
}

function systemPulse() {
  const templates = [
    {
      type: 'metric',
      payload: { action: 'health_check', service: pick(['api', 'db', 'redis', 'worker']), status: pick(['healthy', 'degraded']), latency_ms: randomInt(5, 500) },
      tags: ['health_check'],
      severity: 'info',
    },
    {
      type: 'alert',
      payload: { action: 'ssl_expiry', domain: pick(['app.example.com', 'api.example.com', 'cdn.example.com']), days_remaining: randomInt(1, 90) },
      tags: ['ssl_expiry'],
      severity: 'warning',
    },
    {
      type: 'alert',
      payload: { action: 'pm2_restart', process: pick(['api-server', 'worker', 'scheduler']), restart_count: randomInt(1, 20) },
      tags: ['pm2_restart'],
      severity: 'info', // overridden below for high counts
    },
  ];
  const t = pick(templates);
  let severity = t.severity;
  // PM2 restarts with high count → critical
  if (t.payload.action === 'pm2_restart' && t.payload.restart_count > 10) {
    severity = 'critical';
  }
  return { source: 'system', type: t.type, entity_type: 'system', payload: t.payload, tags: t.tags, severity };
}

function awsPulse() {
  const templates = [
    {
      type: 'metric',
      payload: { action: 'ec2_health', instance_id: `i-${uuidv4().slice(0, 8)}`, status: pick(['running', 'stopped', 'impaired']) },
      tags: ['ec2_health'],
      severity: 'info',
    },
    {
      type: 'alert',
      payload: { action: 'cost_alert', service: pick(['EC2', 'S3', 'RDS', 'Lambda']), amount: randomInt(50, 2000), threshold: randomInt(100, 1500) },
      tags: ['cost_alert'],
      severity: 'warning',
    },
  ];
  const t = pick(templates);
  return { source: 'aws', type: t.type, entity_type: 'system', payload: t.payload, tags: t.tags, severity: t.severity };
}

// --- Source generator map ---

const SOURCE_GENERATORS = {
  github: githubPulse,
  stripe: stripePulse,
  auth0: auth0Pulse,
  hubspot: hubspotPulse,
  proof360: proof360Pulse,
  system: systemPulse,
  aws: awsPulse,
};

// --- Public API ---

/**
 * Generate a single random pulse conforming to the canonical schema.
 * Exported for testing.
 */
function generatePulse() {
  const source = pick(SOURCES);
  const generator = SOURCE_GENERATORS[source];
  const partial = generator();

  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    source: partial.source,
    type: partial.type,
    entity_type: partial.entity_type,
    entity_id: `${partial.source}_${Date.now()}_${randomInt(1, 9999)}`,
    severity: partial.severity,
    payload: partial.payload,
    tags: partial.tags,
    schema_version: '1.0',
  };
}

const DEFAULT_INTERVAL_MS = 3000;

/**
 * Start the pulse simulator. Emits one pulse every intervalMs milliseconds
 * through the pulse-ingester validation pipeline.
 *
 * @param {object} opts
 * @param {object} opts.pool - Postgres pool
 * @param {object} opts.redis - Redis client
 * @param {number} [opts.intervalMs] - Emission interval in ms (default: SIM_INTERVAL_MS env or 3000)
 * @returns {NodeJS.Timeout} interval handle
 */
function startSimulator({ pool, redis, intervalMs } = {}) {
  const interval = intervalMs || parseInt(process.env.SIM_INTERVAL_MS, 10) || DEFAULT_INTERVAL_MS;

  const handle = setInterval(async () => {
    try {
      const pulse = generatePulse();
      await ingestPulse(pulse, { pool, redis });
    } catch (err) {
      // Simulator errors are logged but never surface as HTTP errors
      console.error('[pulse-simulator] Error emitting pulse:', err.message);
    }
  }, interval);

  console.log(`[pulse-simulator] Started — emitting every ${interval}ms`);
  return handle;
}

/**
 * Stop the pulse simulator.
 * @param {NodeJS.Timeout} handle - The interval handle returned by startSimulator
 */
function stopSimulator(handle) {
  if (handle) {
    clearInterval(handle);
    console.log('[pulse-simulator] Stopped');
  }
}

module.exports = {
  startSimulator,
  stopSimulator,
  generatePulse,
  // Exported for testing
  SOURCES,
  SOURCE_GENERATORS,
};
