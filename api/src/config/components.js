/**
 * Component Library Registry
 *
 * The 12 registered UI components that Claude may reference in a Layout_Spec.
 * Heart is explicitly excluded — it is a system-level UI element rendered
 * unconditionally by the frontend, never referenced in layout specs.
 */

const COMPONENT_LIBRARY = [
  'MetricCard',
  'StatusGrid',
  'AlertFeed',
  'HealthBar',
  'ActivitySparkline',
  'PeopleCard',
  'GapCard',
  'LifecycleBoard',
  'BPMChart',
  'SecretRotation',
  'CostTracker',
  'PipelineMetric',
];

function isValidComponent(name) {
  return COMPONENT_LIBRARY.includes(name);
}

module.exports = { COMPONENT_LIBRARY, isValidComponent };
