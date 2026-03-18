# Requirements Document

## Introduction

The jp-system Dashboard API v1.0 is the backend data and computation layer for the Founder SIEM dashboard. It receives pulses (immutable facts from external sources), computes a real-time BPM (beats per minute) metric on a fixed tick, generates AI-driven layout specs via Claude API, manages audience lenses, and handles founder onboarding. The API serves a separate frontend build — no UI is rendered by this layer. For v1.0, all pulse sources are simulated; real webhook integrations are post-v1.0.

## Glossary

- **Pulse**: A single immutable fact that something happened in the system, conforming to the canonical pulse schema defined in `pulse-schema.md`.
- **BPM**: Beats per minute — the aggregate count of pulses over a rolling time window, normalized to a per-minute rate.
- **Zone**: A 1–5 intensity classification derived from the ratio of current BPM to the founder's configured max BPM.
- **Lens**: An audience context definition that tells Claude how to interpret the pulse stream and which components to prioritize.
- **Layout_Spec**: A JSON object returned by Claude API that selects and configures components from the registered Component_Library for a given lens.
- **Component_Library**: The fixed set of 12 registered UI component types that Claude may reference in a Layout_Spec.
- **Rolling_Window**: A configurable time window (default 60 seconds) used to compute BPM from the pulse stream.
- **Dedup_Window**: A 300-second rolling window used to detect and reject duplicate pulse IDs.
- **Max_BPM**: The founder-configured ceiling heart rate, set at onboarding, used to calibrate all zone thresholds.
- **Baseline_BPM**: The static default resting BPM for v1.0, set to 20. Learned baseline is a post-v1.0 feature.
- **Pulse_Ingester**: The service responsible for validating, deduplicating, and storing incoming pulses.
- **BPM_Ticker**: The BullMQ-based service that computes BPM on a fixed 1-second interval tick.
- **Layout_Engine**: The service that calls Claude API with pulse context and lens definition, then validates the returned Layout_Spec.
- **Dashboard_API**: The Express-based HTTP server exposing all endpoints.
- **Founder**: The primary user of the jp-system dashboard who configures onboarding and views the dashboard.

## Requirements

### Requirement 1: Pulse Ingestion

**User Story:** As a Founder, I want the system to receive, validate, deduplicate, and store pulses from all registered sources, so that the dashboard has an accurate, immutable record of system activity.

#### Acceptance Criteria

1. WHEN a pulse is submitted to `POST /pulses`, THE Pulse_Ingester SHALL validate that the `schema_version` field is in the supported versions list (currently `["1.0"]`) and reject the pulse with an error response if the version is not supported.
2. WHEN a pulse is submitted with an (`id`, `source`) pair that already exists within the Dedup_Window (300 seconds), THE Pulse_Ingester SHALL reject the pulse with a duplicate error response. Deduplication is scoped to the (`id`, `source`) pair — two different sources emitting the same `id` are treated as distinct pulses.
3. WHEN a pulse passes schema version validation and deduplication checks, THE Pulse_Ingester SHALL write the pulse as an immutable record to Postgres with `severity`, `tags`, `entity_type`, and `entity_id` set exactly once.
4. WHEN a pulse has been stored, THE Pulse_Ingester SHALL prevent any mutation of the `severity`, `tags`, `entity_type`, and `entity_id` fields on that record.
5. WHEN a pulse is submitted, THE Pulse_Ingester SHALL enforce validation in this order: schema version check, then canonical schema enforcement, then deduplication check, then storage.
6. THE Dashboard_API SHALL expose a `POST /pulses` endpoint that accepts a JSON body conforming to the canonical pulse schema.
7. WHEN a pulse is submitted, THE Pulse_Ingester SHALL enforce the canonical pulse schema at runtime — validating that all required fields (`id`, `timestamp`, `source`, `type`, `entity_type`, `entity_id`, `severity`, `payload`, `tags`, `schema_version`) are present and conform to their defined types and allowed values. Referencing `pulse-schema.md` as documentation is not sufficient; the schema must be enforced as a runtime validation boundary.
8. WHEN a pulse has a `timestamp` that falls outside the current Rolling_Window but is within the Dedup_Window, THE Pulse_Ingester SHALL accept and store the pulse. Out-of-order pulses are valid — the BPM_Ticker sorts by `timestamp` ascending at read time.

### Requirement 2: BPM Computation

**User Story:** As a Founder, I want the system to compute a real-time BPM metric on a fixed interval, so that the dashboard heart reflects the current rhythm of my business.

#### Acceptance Criteria

1. THE BPM_Ticker SHALL execute on a fixed 1-second interval tick using BullMQ, independent of pulse arrival events.
2. WHEN the BPM_Ticker executes, THE BPM_Ticker SHALL compute BPM using the formula: `count of pulses with timestamp within Rolling_Window / window_seconds * 60`.
3. THE BPM_Ticker SHALL use a configurable Rolling_Window with a default value of 60 seconds.
4. WHEN zero pulses exist within the Rolling_Window, THE BPM_Ticker SHALL return a minimum BPM of 1 (Zone 1 floor).
5. WHEN ordering pulses within the Rolling_Window, THE BPM_Ticker SHALL sort by `timestamp` ascending, then by `id` ascending as a tie-breaker.
6. THE Dashboard_API SHALL expose a `GET /bpm` endpoint that returns a JSON object containing `current` (integer), `baseline` (integer, static default 20 for v1.0), `max` (integer), `zone` (integer 1–5), and `window_seconds` (integer).

### Requirement 3: Zone Calculation

**User Story:** As a Founder, I want BPM zones calibrated to my personal max heart rate, so that the dashboard intensity reflects my system's own ceiling.

#### Acceptance Criteria

1. WHEN computing the zone, THE BPM_Ticker SHALL derive the zone from `(current_bpm / Max_BPM) * 100` using these thresholds: Zone 1 = 0–50%, Zone 2 = 50–65%, Zone 3 = 65–75%, Zone 4 = 75–90%, Zone 5 = 90–100%.
2. WHILE Max_BPM has not been set by the Founder, THE BPM_Ticker SHALL use a default Max_BPM of 60.
3. WHEN the Founder updates Max_BPM via onboarding, THE BPM_Ticker SHALL recalibrate all zone thresholds immediately using the new Max_BPM value.

### Requirement 4: Layout Spec Generation

**User Story:** As a Founder, I want the dashboard to generate an AI-driven layout tailored to my current lens, so that I see the components that matter most for my audience context.

#### Acceptance Criteria

1. THE Dashboard_API SHALL expose a `POST /layout` endpoint that accepts a JSON body containing `lens_id` (one of `founder`, `ciso`, `investor`, `board`).
2. WHEN a layout request is received, THE Layout_Engine SHALL load the Lens definition for the requested `lens_id`, fetch the last N pulses within the Rolling_Window sorted by `timestamp` ascending then `id` ascending, and fetch the current BPM and zone.
3. WHEN calling Claude API, THE Layout_Engine SHALL send a JSON payload containing the lens definition, recent pulses, current BPM, BPM zone, system baseline BPM, and the list of available components from the Component_Library.
4. THE Layout_Engine SHALL use the exact Claude system prompt: "You are a dashboard layout engine. You receive a pulse stream and a lens definition. You return a JSON layout spec selecting components from the provided library. You never invent new components. You never return HTML. You never return prose. The summary field is one sentence maximum. Select components that matter most for this lens and audience. Return valid JSON only."
5. WHEN Claude returns a response, THE Layout_Engine SHALL first validate that the response is well-formed JSON. IF the response is not valid JSON, THE Layout_Engine SHALL retry the Claude API call exactly once. IF the retry also returns malformed JSON, THE Layout_Engine SHALL return an error response.
6. WHEN the Layout_Spec JSON is valid, THE Layout_Engine SHALL validate the structural schema of the Layout_Spec (required fields: `lens`, `bpm_zone`, `summary`, `layout` array) before checking individual components.
7. WHEN the Layout_Spec structure is valid, THE Layout_Engine SHALL validate that every component referenced exists in the Component_Library (MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline, PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation, CostTracker, PipelineMetric).
8. IF Claude returns a Layout_Spec containing a component not in the Component_Library, THEN THE Layout_Engine SHALL retry the Claude API call exactly once.
9. IF the retry also returns an invalid component, THEN THE Layout_Engine SHALL return an error response to the caller without substituting components.
10. THE Layout_Engine SHALL never return a partial Layout_Spec. A Layout_Spec is either fully valid (well-formed JSON, valid structure, all components in library) or an explicit error is returned.
11. WHEN zero pulses exist within the Rolling_Window, THE Layout_Engine SHALL return a Layout_Spec containing a single AlertFeed component with the message "No recent activity" without calling Claude API. This empty-stream fallback SHALL NOT be cached — each request during an empty stream re-evaluates the pulse count.
12. THE Heart is a system-level UI element, always present on every dashboard view. It is NOT a component in the Component_Library. Claude never references it in a Layout_Spec. The Heart is rendered unconditionally by the frontend, outside the layout spec.

### Requirement 5: Lens Management

**User Story:** As a Founder, I want to switch between audience lenses, so that the same pulse stream is interpreted differently for different contexts.

#### Acceptance Criteria

1. THE Dashboard_API SHALL serve lens definitions for the built-in lenses: `founder`, `ciso`, `investor`, and `board`.
2. WHEN the frontend requests a Layout_Spec with a `lens_id` different from the previously cached lens, THE Layout_Engine SHALL invalidate the prior cached Layout_Spec and make a fresh Claude API call.
3. WHILE the same `lens_id` is active, THE Layout_Engine SHALL cache the Layout_Spec with a TTL of 30 seconds.
4. THE Dashboard_API SHALL store each lens definition with the fields: `id`, `label`, `prompt_context`, `severity_weights`, `source_weights`, and `max_components`.

### Requirement 6: Onboarding

**User Story:** As a Founder, I want to set my max heart rate at first load, so that the dashboard zones are calibrated to my system's ceiling.

#### Acceptance Criteria

1. THE Dashboard_API SHALL expose a `POST /onboarding` endpoint that accepts a JSON body containing `max_bpm` (integer).
2. WHEN a `POST /onboarding` request is received, THE Dashboard_API SHALL store the Founder's Max_BPM and recalibrate all zone thresholds immediately.
3. THE Dashboard_API SHALL expose a `GET /onboarding` endpoint that returns the current onboarding state, including whether Max_BPM has been set.
4. WHILE Max_BPM has not been set via onboarding, THE BPM_Ticker SHALL use the default Max_BPM of 60.

### Requirement 7: Pulse Source Simulation

**User Story:** As a Founder, I want simulated pulse generation for all registered sources in v1.0, so that the dashboard can be demonstrated and tested before real webhook integrations are built.

#### Acceptance Criteria

1. THE Dashboard_API SHALL register simulated ingest handlers for the following sources: `github`, `stripe`, `auth0`, `hubspot`, `proof360`, `system`, and `aws`.
2. WHEN simulating pulses, THE Dashboard_API SHALL generate pulses that conform to the canonical pulse schema with valid `source`, `type`, `entity_type`, `entity_id`, `severity`, `payload`, `tags`, and `schema_version` fields.
3. WHEN simulating pulses for `github`, THE Dashboard_API SHALL generate pulse types including commits, PRs, deployments, and issues.
4. WHEN simulating pulses for `stripe`, THE Dashboard_API SHALL generate pulse types including payments, subscriptions, and failed charges.
5. WHEN simulating pulses for `auth0`, THE Dashboard_API SHALL generate pulse types including logins, new accounts, and access events.
6. WHEN simulating pulses for `hubspot`, THE Dashboard_API SHALL generate pulse types including contacts, lifecycle changes, and deals.
7. WHEN simulating pulses for `proof360`, THE Dashboard_API SHALL generate pulse types including assessments, trust scores, and gap completions.
8. WHEN simulating pulses for `system`, THE Dashboard_API SHALL generate pulse types including health checks, SSL expiry, and PM2 restarts.
9. WHEN simulating pulses for `aws`, THE Dashboard_API SHALL generate pulse types including EC2 health and cost alerts.
10. THE pulse simulator SHALL emit one pulse every 3 seconds across all sources combined, with each pulse randomly assigned to one of the 7 registered source types. With default Max_BPM of 60, this yields an approximate resting BPM of 20 (Zone 1).
11. THE pulse simulation rate SHALL be configurable so that higher zones can be tested deterministically by increasing pulse frequency.

### Requirement 8: File Structure and Stack

**User Story:** As a developer, I want the API organized into the specified file structure using the defined stack, so that the codebase is predictable and maintainable.

#### Acceptance Criteria

1. THE Dashboard_API SHALL be implemented using Node.js with Express as the HTTP framework.
2. THE Dashboard_API SHALL use Postgres as the pulse store for immutable pulse records.
3. THE Dashboard_API SHALL use Redis for BPM tick state and the Dedup_Window.
4. THE Dashboard_API SHALL use BullMQ for the 1-second interval BPM tick job.
5. THE Dashboard_API SHALL use Claude API (Sonnet model) for Layout_Spec generation.
6. THE Dashboard_API SHALL organize source code under `api/src/` with routes in `api/src/routes/`, services in `api/src/services/`, and config in `api/src/config/`.
7. THE Dashboard_API SHALL deliver the following route files: `pulses.js`, `bpm.js`, `layout.js`, `onboarding.js`.
8. THE Dashboard_API SHALL deliver the following service files: `bpm-ticker.js`, `pulse-ingester.js`, `layout-engine.js`.
9. THE Dashboard_API SHALL deliver the following config files: `lenses.js`, `components.js`.
10. THE Dashboard_API SHALL create the `api/` directory at the jp-system repository root if it does not already exist, and scaffold the full required directory tree (`api/src/routes/`, `api/src/services/`, `api/src/config/`) before writing any source files.
11. ALL file creation SHALL use repo-root-relative paths, not current working directory assumptions.
