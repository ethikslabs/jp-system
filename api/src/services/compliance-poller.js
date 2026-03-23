'use strict';

const { v4: uuidv4 } = require('uuid');
const { EC2Client, DescribeSecurityGroupsCommand, DescribeVolumesCommand } = require('@aws-sdk/client-ec2');
const { GuardDutyClient, ListFindingsCommand, GetFindingsCommand } = require('@aws-sdk/client-guardduty');
const { IAMClient, ListUsersCommand, ListMFADevicesCommand } = require('@aws-sdk/client-iam');
const { ingestPulse } = require('./pulse-ingester');

const REGION = 'ap-southeast-2';
const GUARDDUTY_DETECTOR = '3ece865a73c5267e2e8851328c68aa13';

function pulse(fields) {
  return { id: uuidv4(), timestamp: new Date().toISOString(), schema_version: '1.0', ...fields };
}

// --- Open security groups (every 10 minutes) ---

async function pollSecurityGroups({ pool, redis }) {
  const client = new EC2Client({ region: REGION });
  const { SecurityGroups = [] } = await client.send(new DescribeSecurityGroupsCommand({}));

  for (const group of SecurityGroups) {
    for (const rule of (group.IpPermissions ?? [])) {
      const openToWorld = (rule.IpRanges ?? []).some(r => r.CidrIp === '0.0.0.0/0') ||
                          (rule.Ipv6Ranges ?? []).some(r => r.CidrIpv6 === '::/0');
      if (!openToWorld) continue;
      const port = rule.FromPort ?? rule.ToPort ?? 0;
      const protocol = rule.IpProtocol ?? 'unknown';
      await ingestPulse(pulse({
        source: 'aws', type: 'alert', entity_type: 'system',
        entity_id: group.GroupId,
        severity: (port === 22 || port === 5432) ? 'critical' : 'warning',
        tags: ['security', 'open_port'],
        payload: { action: 'open_security_group', group_name: group.GroupName, group_id: group.GroupId, port, protocol },
      }), { pool, redis });
    }
  }
}

// --- Unencrypted EBS volumes (every 1 hour) ---

async function pollEBSEncryption({ pool, redis }) {
  const client = new EC2Client({ region: REGION });
  const { Volumes = [] } = await client.send(new DescribeVolumesCommand({}));

  for (const vol of Volumes.filter(v => !v.Encrypted)) {
    await ingestPulse(pulse({
      source: 'aws', type: 'alert', entity_type: 'system',
      entity_id: vol.VolumeId,
      severity: 'warning',
      tags: ['security', 'unencrypted'],
      payload: { action: 'unencrypted_volume', volume_id: vol.VolumeId, size: vol.Size, state: vol.State },
    }), { pool, redis });
  }
}

// --- GuardDuty findings (every 5 minutes) ---

async function pollGuardDuty({ pool, redis }) {
  const client = new GuardDutyClient({ region: REGION });
  const { FindingIds = [] } = await client.send(new ListFindingsCommand({
    DetectorId: GUARDDUTY_DETECTOR,
    FindingCriteria: { Criterion: { severity: { Gte: 4 } } },
  }));
  if (FindingIds.length === 0) return;

  const { Findings = [] } = await client.send(new GetFindingsCommand({
    DetectorId: GUARDDUTY_DETECTOR,
    FindingIds,
  }));

  for (const finding of Findings) {
    await ingestPulse(pulse({
      source: 'aws', type: 'alert', entity_type: 'system',
      entity_id: 'guardduty',
      severity: finding.Severity >= 7 ? 'critical' : 'warning',
      tags: ['guardduty', finding.Type],
      payload: { action: 'guardduty_finding', title: finding.Title, type: finding.Type, severity: finding.Severity, region: finding.Region },
    }), { pool, redis });
  }
}

// --- IAM users without MFA (every 1 hour) ---

async function pollIAMMFA({ pool, redis }) {
  const client = new IAMClient({ region: REGION });
  const { Users = [] } = await client.send(new ListUsersCommand({}));

  for (const user of Users) {
    const { MFADevices = [] } = await client.send(new ListMFADevicesCommand({ UserName: user.UserName }));
    if (MFADevices.length > 0) continue;
    await ingestPulse(pulse({
      source: 'aws', type: 'alert', entity_type: 'system',
      entity_id: user.UserName,
      severity: 'warning',
      tags: ['security', 'iam', 'mfa'],
      payload: { action: 'no_mfa', username: user.UserName, created: user.CreateDate },
    }), { pool, redis });
  }
}

// --- Poller runner ---

function makePoll(name, fn, deps) {
  return async () => {
    try {
      await fn(deps);
    } catch (err) {
      console.error(`[compliance-poller] ${name} error: ${err.message}`);
    }
  };
}

// --- Public API ---

function startCompliancePoller({ pool, redis }) {
  const deps = { pool, redis };
  const handles = [
    setInterval(makePoll('security-groups', pollSecurityGroups, deps), 10 * 60_000),
    setInterval(makePoll('ebs-encryption', pollEBSEncryption, deps), 60 * 60_000),
    setInterval(makePoll('guardduty', pollGuardDuty, deps), 5 * 60_000),
    setInterval(makePoll('iam-mfa', pollIAMMFA, deps), 60 * 60_000),
  ];

  // Run on start — don't wait an hour for first signal
  makePoll('security-groups', pollSecurityGroups, deps)();
  makePoll('ebs-encryption', pollEBSEncryption, deps)();
  makePoll('guardduty', pollGuardDuty, deps)();
  makePoll('iam-mfa', pollIAMMFA, deps)();

  console.log('[compliance-poller] Started — sec-groups/guardduty every 5-10m, ebs/iam every 1h');
  return { stop: () => handles.forEach(clearInterval) };
}

function stopCompliancePoller(handle) {
  if (handle) handle.stop();
}

module.exports = { startCompliancePoller, stopCompliancePoller };
