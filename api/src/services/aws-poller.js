'use strict';

const { v4: uuidv4 } = require('uuid');
const { EC2Client, DescribeInstanceStatusCommand, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const { ingestPulse } = require('./pulse-ingester');

const REGION = 'ap-southeast-2';

function pulse(fields) {
  return { id: uuidv4(), timestamp: new Date().toISOString(), schema_version: '1.0', ...fields };
}

// --- Fetch instance name tags ---

async function getInstanceInfo(client, instanceIds) {
  if (!instanceIds.length) return {};
  const { Reservations = [] } = await client.send(new DescribeInstancesCommand({ InstanceIds: instanceIds }));
  const info = {};
  for (const r of Reservations) {
    for (const i of (r.Instances ?? [])) {
      const nameTag = i.Tags?.find(t => t.Key === 'Name');
      info[i.InstanceId] = { name: nameTag?.Value || null, instanceType: i.InstanceType || 'ec2' };
    }
  }
  return info;
}

function displayName(info, state) {
  if (info?.name) return info.name;
  return `${info?.instanceType || 'ec2'} · ${state}`;
}

// --- EC2 instance health (every 60s) ---

async function pollEC2Health({ pool, redis }) {
  const client = new EC2Client({ region: REGION });
  const { InstanceStatuses = [] } = await client.send(new DescribeInstanceStatusCommand({ IncludeAllInstances: true }));
  const names = await getInstanceInfo(client, InstanceStatuses.map(s => s.InstanceId));

  for (const s of InstanceStatuses) {
    const instance_id = s.InstanceId;
    const state = s.InstanceState?.Name ?? 'unknown';
    const status = s.InstanceStatus?.Status ?? 'unknown';
    const system_status = s.SystemStatus?.Status ?? 'unknown';
    const info = names[instance_id];
    const name = displayName(info, state);
    let severity = 'info';
    const tags = ['ec2_health'];
    if (state === 'stopped' || state === 'terminated') {
      tags.push('stopped');
    } else if (status === 'impaired' || system_status === 'impaired') {
      severity = 'critical';
    } else if (status !== 'ok' && status !== 'not-applicable' && status !== 'initializing') {
      severity = 'warning';
    }
    await ingestPulse(pulse({
      source: 'aws', type: 'metric', entity_type: 'system',
      entity_id: instance_id,
      severity,
      tags,
      payload: { action: 'ec2_health', instance_id, name, instance_type: info?.instanceType, state, status, system_status },
    }), { pool, redis });
  }
}

// --- EC2 CPU utilisation (every 60s) ---

async function pollEC2CPU({ pool, redis }) {
  const ec2 = new EC2Client({ region: REGION });
  const { InstanceStatuses = [] } = await ec2.send(new DescribeInstanceStatusCommand({ IncludeAllInstances: true }));
  const names = await getInstanceInfo(ec2, InstanceStatuses.map(s => s.InstanceId));
  const cw = new CloudWatchClient({ region: REGION });
  const now = new Date();
  const start = new Date(now.getTime() - 5 * 60 * 1000);

  for (const s of InstanceStatuses) {
    const instance_id = s.InstanceId;
    const { Datapoints = [] } = await cw.send(new GetMetricStatisticsCommand({
      Namespace: 'AWS/EC2', MetricName: 'CPUUtilization',
      Dimensions: [{ Name: 'InstanceId', Value: instance_id }],
      StartTime: start, EndTime: now, Period: 300, Statistics: ['Average'],
    }));
    for (const dp of Datapoints) {
      const value = dp.Average ?? 0;
      await ingestPulse(pulse({
        source: 'aws', type: 'metric', entity_type: 'system',
        entity_id: instance_id,
        severity: value > 80 ? 'critical' : value > 60 ? 'warning' : 'info',
        tags: ['cpu', 'ec2'],
        payload: { action: 'cpu_utilization', instance_id, name: displayName(names[instance_id], 'running'), value: Math.round(value), unit: 'percent' },
      }), { pool, redis });
    }
  }
}

// --- Monthly cost to date (every 1 hour) ---

async function pollCost({ pool, redis }) {
  const client = new CostExplorerClient({ region: 'us-east-1' });
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  if (start === end) return; // Cost Explorer requires start < end

  const { ResultsByTime = [] } = await client.send(new GetCostAndUsageCommand({
    TimePeriod: { Start: start, End: end },
    Granularity: 'MONTHLY',
    Metrics: ['UnblendedCost'],
    GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
  }));

  const period = `${start}/${end}`;
  for (const result of ResultsByTime) {
    for (const group of (result.Groups ?? [])) {
      const service = group.Keys?.[0] ?? 'unknown';
      const { Amount: amount, Unit: unit } = group.Metrics?.UnblendedCost ?? {};
      if (!amount || parseFloat(amount) === 0) continue;
      await ingestPulse(pulse({
        source: 'aws', type: 'metric', entity_type: 'system',
        entity_id: service,
        severity: 'info',
        tags: ['cost', 'aws'],
        payload: { action: 'cost', service, amount: parseFloat(amount), unit, period },
      }), { pool, redis });
    }
  }
}

// --- Poller runner ---

function makePoll(name, fn, deps) {
  return async () => {
    try {
      await fn(deps);
    } catch (err) {
      console.error(`[aws-poller] ${name} error: ${err.message}`);
    }
  };
}

// --- Public API ---

function startAWSPoller({ pool, redis }) {
  const deps = { pool, redis };
  const handles = [
    setInterval(makePoll('ec2-health', pollEC2Health, deps), 60_000),
    setInterval(makePoll('ec2-cpu', pollEC2CPU, deps), 60_000),
    setInterval(makePoll('cost', pollCost, deps), 60 * 60_000),
  ];

  // Run immediately on start so fresh data appears without waiting for the interval
  makePoll('ec2-health', pollEC2Health, deps)();
  makePoll('ec2-cpu', pollEC2CPU, deps)();
  makePoll('cost', pollCost, deps)();

  console.log('[aws-poller] Started — ec2-health/ec2-cpu every 60s, cost every 1h');
  return { stop: () => handles.forEach(clearInterval) };
}

function stopAWSPoller(handle) {
  if (handle) handle.stop();
}

module.exports = { startAWSPoller, stopAWSPoller };
