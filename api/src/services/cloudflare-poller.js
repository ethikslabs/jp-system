'use strict';

const { v4: uuidv4 } = require('uuid');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { ingestPulse } = require('./pulse-ingester');

const CF_API = 'https://api.cloudflare.com/client/v4';

function pulse(fields) {
  return { id: uuidv4(), timestamp: new Date().toISOString(), schema_version: '1.0', ...fields };
}

// --- Startup: resolve token + zone ID ---

async function resolveCredentials() {
  const ssm = new SSMClient({ region: 'ap-southeast-2' });
  const { Parameter } = await ssm.send(new GetParameterCommand({
    Name: '/cloudflare/api-token',
    WithDecryption: true,
  }));
  const token = Parameter.Value;

  const res = await fetch(`${CF_API}/zones?name=ethikslabs.com`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!body.success || !body.result?.length) {
    throw new Error(`zone lookup failed: ${JSON.stringify(body.errors)}`);
  }
  return { token, zoneId: body.result[0].id };
}

// --- Zone analytics (every 5 minutes) ---

async function pollAnalytics(token, zoneId, { pool, redis }) {
  const res = await fetch(`${CF_API}/zones/${zoneId}/analytics/dashboard?since=-30&until=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { success, result } = await res.json();
  if (!success || !result?.totals) return;

  const { totals } = result;
  await ingestPulse(pulse({
    source: 'cloudflare', type: 'metric', entity_type: 'system',
    entity_id: 'ethikslabs.com',
    severity: totals.threats?.all > 50 ? 'warning' : 'info',
    tags: ['analytics', 'traffic'],
    payload: {
      action: 'zone_analytics',
      requests: totals.requests?.all,
      threats: totals.threats?.all,
      bandwidth_gb: ((totals.bandwidth?.all ?? 0) / 1e9).toFixed(2),
    },
  }), { pool, redis });
}

// --- SSL certificate status (every 1 hour) ---

async function pollSSL(token, zoneId, { pool, redis }) {
  const res = await fetch(`${CF_API}/zones/${zoneId}/ssl/certificate_packs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { success, result = [] } = await res.json();
  if (!success) return;

  for (const cert of result) {
    const { status, type, hosts } = cert;
    await ingestPulse(pulse({
      source: 'cloudflare', type: 'metric', entity_type: 'system',
      entity_id: 'ethikslabs.com',
      severity: status !== 'active' ? 'critical' : 'info',
      tags: ['ssl', status],
      payload: { action: 'ssl_status', status, type, hosts },
    }), { pool, redis });
  }
}

// --- Poller runner ---

function makePoll(name, fn) {
  return async () => {
    try {
      await fn();
    } catch (err) {
      console.error(`[cloudflare-poller] ${name} error: ${err.message}`);
    }
  };
}

// --- Public API ---

async function startCloudflarePoller({ pool, redis }) {
  let token, zoneId;
  try {
    ({ token, zoneId } = await resolveCredentials());
  } catch (err) {
    console.error(`[cloudflare-poller] startup failed — not starting: ${err.message}`);
    return { stop: () => {} };
  }

  const deps = { pool, redis };
  const handles = [
    setInterval(makePoll('analytics', () => pollAnalytics(token, zoneId, deps)), 5 * 60_000),
    setInterval(makePoll('ssl', () => pollSSL(token, zoneId, deps)), 60 * 60_000),
  ];

  // Run immediately on start
  makePoll('analytics', () => pollAnalytics(token, zoneId, deps))();
  makePoll('ssl', () => pollSSL(token, zoneId, deps))();

  console.log(`[cloudflare-poller] Started — analytics every 5m, ssl every 1h (zone: ${zoneId})`);
  return { stop: () => handles.forEach(clearInterval) };
}

function stopCloudflarePoller(handle) {
  if (handle) handle.stop();
}

module.exports = { startCloudflarePoller, stopCloudflarePoller };
