'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Map a pulse payload to a human-readable action label
function pulseToAction(pulse) {
  const p = pulse.payload || {};
  switch (p.action) {
    case 'ec2_health':
      return {
        label: `Check EC2: ${p.name || p.instance_id}`,
        detail: `State: ${p.state}, status: ${p.status}`,
      };
    case 'cpu_utilization':
      return {
        label: `High CPU on ${p.name || p.instance_id}`,
        detail: `${p.value}% utilisation`,
      };
    case 'open_security_group':
      return {
        label: `Open security group rule: ${p.group_name || p.group_id}`,
        detail: `Port ${p.port === -1 ? 'all' : p.port} open to ${p.cidr}`,
      };
    case 'unencrypted_ebs':
      return {
        label: `Unencrypted EBS volume: ${p.volume_id}`,
        detail: `${p.size_gb}GB in ${p.az}`,
      };
    case 'guardduty_finding':
      return {
        label: `GuardDuty: ${p.title || p.finding_id}`,
        detail: `Severity ${p.severity}`,
      };
    case 'iam_no_mfa':
      return {
        label: `Enable MFA for IAM user: ${p.user}`,
        detail: 'No MFA device configured',
      };
    case 'ssl_cert_expiry':
    case 'ssl_status':
      return {
        label: `SSL issue on ${p.hostname || pulse.entity_id}`,
        detail: p.status || p.message || '',
      };
    case 'cf_threats':
      return {
        label: `Cloudflare threats detected`,
        detail: `${p.threats} threats in the last 24h`,
      };
    case 'pipeline_timeout':
      return {
        label: `Pipeline timeout in Proof360`,
        detail: `Stage: ${p.stage || 'unknown'}, elapsed: ${p.elapsed_ms ? Math.round(p.elapsed_ms / 1000) + 's' : 'unknown'}`,
      };
    default:
      return {
        label: pulse.type === 'alert' ? (p.message || pulse.entity_id) : `${pulse.source}: ${p.action || pulse.type}`,
        detail: pulse.entity_id,
      };
  }
}

// GET /actions — return actionable items derived from recent critical/warning pulses
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, source, type, entity_type, entity_id, severity, payload, timestamp
      FROM pulses
      WHERE severity IN ('critical', 'warning')
        AND timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY
        CASE severity WHEN 'critical' THEN 0 ELSE 1 END,
        timestamp DESC
      LIMIT 20
    `);

    // Deduplicate by (source, action/type, entity_id) — keep most recent
    const seen = new Set();
    const actions = [];
    for (const row of rows) {
      const p = row.payload || {};
      const key = `${row.source}:${p.action || row.type}:${row.entity_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { label, detail } = pulseToAction(row);
      actions.push({
        id: row.id,
        label,
        detail,
        severity: row.severity,
        source: row.source,
        timestamp: row.timestamp,
      });
    }

    res.json(actions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
