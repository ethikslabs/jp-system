'use strict';

const crypto = require('crypto');
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { ingestPulse } = require('../services/pulse-ingester');

const router = Router();

// --- Signature verification ---

function verifySignature(rawBody, signature, secret) {
  if (!signature || !rawBody) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// --- Event timestamp extraction ---

function eventTimestamp(body) {
  return (
    body.head_commit?.timestamp ||
    body.pull_request?.updated_at ||
    body.deployment_status?.updated_at ||
    body.issue?.updated_at ||
    new Date().toISOString()
  );
}

// --- Event normalizers ---

function normalizePush(body) {
  return {
    source: 'github', type: 'event', entity_type: 'project',
    entity_id: body.repository.full_name,
    severity: 'info', tags: ['push', 'commit'],
    timestamp: eventTimestamp(body),
    payload: { action: 'push', ref: body.ref, commits_count: (body.commits || []).length, pusher: body.pusher?.name, repo: body.repository.full_name },
  };
}

function normalizePullRequest(body) {
  return {
    source: 'github', type: 'event', entity_type: 'project',
    entity_id: body.repository.full_name,
    severity: 'info', tags: ['pull_request', body.action],
    timestamp: eventTimestamp(body),
    payload: { action: body.action, number: body.pull_request.number, title: body.pull_request.title, user: body.pull_request.user.login, repo: body.repository.full_name },
  };
}

function normalizeDeploymentStatus(body) {
  return {
    source: 'github', type: 'event', entity_type: 'project',
    entity_id: body.repository.full_name,
    severity: body.deployment_status.state === 'failure' ? 'critical' : 'info',
    tags: ['deployment', body.deployment_status.state],
    timestamp: eventTimestamp(body),
    payload: { action: 'deployment', state: body.deployment_status.state, environment: body.deployment.environment, repo: body.repository.full_name },
  };
}

function normalizeIssue(body) {
  return {
    source: 'github', type: 'event', entity_type: 'project',
    entity_id: body.repository.full_name,
    severity: 'info', tags: ['issue', body.action],
    timestamp: eventTimestamp(body),
    payload: { action: body.action, number: body.issue.number, title: body.issue.title, user: body.issue.user.login, repo: body.repository.full_name },
  };
}

const NORMALIZERS = {
  push: normalizePush,
  pull_request: normalizePullRequest,
  deployment_status: normalizeDeploymentStatus,
  issues: normalizeIssue,
};

// --- Route ---

router.post('/github', async (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers['x-hub-signature-256'];

  if (!secret || !verifySignature(req.rawBody, signature, secret)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  const eventType = req.headers['x-github-event'];
  const normalize = NORMALIZERS[eventType];

  if (!normalize) {
    console.log(`[webhooks/github] Skipping unrecognised event: ${eventType}`);
    return res.status(200).json({ received: true, skipped: true });
  }

  const pulse = {
    id: uuidv4(),
    schema_version: '1.0',
    ...normalize(req.body),
  };

  try {
    await ingestPulse(pulse, { redis: req.app.get('redis') });
  } catch (err) {
    console.error(`[webhooks/github] ingestPulse failed: ${err.message}`);
  }

  return res.status(200).json({ received: true });
});

module.exports = router;
