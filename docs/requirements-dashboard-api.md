# Requirements Document — jp-system Dashboard API v1.0

**Status:** Locked  
**Version:** 1.0  
**Owner:** John Coates — do not change without explicit confirmation  
**Date:** 2026-03-19

---

## Introduction

The jp-system Dashboard API v1.0 is the backend data and computation layer for the Founder SIEM dashboard. It receives pulses (immutable facts from external sources), computes a real-time BPM (beats per minute) metric on a fixed tick, generates AI-driven layout specs via Claude API, manages audience lenses, and handles founder onboarding. The API serves a separate frontend build — no UI is rendered by this layer. For v1.0, all pulse sources are simulated; real webhook integrations are post-v1.0.

---

## Glossary

- **Pulse**: A single immutable fact that something happened in the system, conforming to the canonical pulse schema defined in `pulse-schema.md`.
- **BPM**: Beats per minute — the aggregate count of pulses over a rolling time window, normalized to a per-minute rate.
- **Zone**: A 1–5 intensity classification derived from the ratio of current BPM to the founder's configured max BPM.
- **Lens**: An audience context definition that tells Claude how to interpret the pulse stream and which components to prioritize.
- **Layout_Spec**: A JSON object returned by Claude API that selects and configures components from the registered Component_Library for a given lens.
- **Component_Library**: The fixed set of 12 registered UI component types that Claude may reference in a Layout_Spec.
- **Rolling_Window**: A configurable time window (default 60 seconds) used to compute BPM from the pulse stream.
- **Dedup_Window**: A 300-second rolling window used to detect and reject duplicate (id, source) pairs.
- **Max_BPM**: The founder-configured ceiling heart rate, set at onboarding, used to calibrate all zone thresholds.
- **Baseline_BPM**: Static default resting BPM for v1.0, fixed at 20. Learned baseline is a post-v1.0 feature.
- **Pulse_Ingester**: The service responsible for validating, deduplicating, and storing incoming pulses.
- **BPM_Ticker**: The BullMQ-based service that computes BPM on a fixed 1-second interval tick.
- **Layout_Engine**: The service that calls Claude API with pulse context and lens definition, then validates the returned Layout_Spec.
- **Dashboard_API**: The Express-based HTTP server exposing all endpoints.
- **Founder**: The primary user of the jp-system dashboard who configures onboarding and views the dashboard.
- **Heart**: A system-level UI element always rendered by the frontend. Not a Component_Library member. Claude never references it in a Layout_Spec.

---

## Requirements

### Requirement 1: Pulse Ingestion

**User Story:** As a Founder, I want the system to receive, validate, deduplicate, and store pulses from all registered sources, so that the dashboard has an accurate, immutable record of system activity.

#### Acceptance Criteria

1. WHEN a pulse is submitted to `POST /pulses`, THE Pulse_Ingester SHALL enforce validation in this exact order: schema version check → canonical schema enforcement → deduplication check → storage. Any failure at any step returns an error and halts processing.
2. WHEN a pulse is submitted, THE Pulse_Ingester SHALL validate that the `schema_version` field is in the supported versions list (currently `["1.0"]`) and reject the pulse with an error response if the version is not supported.
3. WHEN a pulse is submitted, THE Pulse_Ingester SHALL validate the payload against the canonical pulse schema at runtime — confirming all required fields (`id`, `timestamp`, `source`, `type`, `entity_type`, `entity_id`, `severity`, `payload`, `tags`, `schema_version`) are present and conform to their defined types and allowed values. Referencing `pulse-schema.md` as documentation is not sufficient; schema enforcement is a runtime boundary.
4. WHEN a pulse is submitted with an (`id`, `source`) pair that already exists within the Dedup_Window (300 seconds), THE Pulse_Ingester SHALL reject the pulse with a duplicate error response. Deduplication is scoped to the (`id`, `source`) pair — two different sources emitting the same `id` are treated as distinct valid pulses.
5. WHEN a pulse passes all validation checks, THE Pulse_Ingester SHALL write the pulse as an immutable record to Postgres with `severity`, `tags`, `entity_type`, and `entity_id` set exactly once. These fields SHALL NOT be mutated after write under any circumstances, including by internal services.
6. WHEN a pulse arrives with a `timestamp` earlier than the latest stored pulse within the Rolling_Window, THE Pulse_Ingester SHALL accept and store the pulse. Out-of-order pulses are valid. Deterministic ordering (`timestamp` ascending, `id` ascending as tie-breaker) is applied at BPM read time, not at ingest.
7. THE Dashboard_API SHALL expose a `POST /pulses` endpoint accepting a JSON body conforming to the canonical pulse schema.

---

### Requirement 2: BPM Computation

**User Story:** As a Founder, I want the system to compute a real-time BPM metric on a fixed interval, so that the dashboard heart reflects the current rhythm of my business.

#### Acceptance Criteria

1. THE BPM_Ticker SHALL execute on a fixed 1-second interval tick using BullMQ, independent of pulse arrival events. BPM is never recomputed on pulse ingest.
2. WHEN the BPM_Ticker executes, it SHALL compute BPM using the formula: `count of pulses with timestamp within Rolling_Window / window_seconds * 60`.
3. THE BPM_Ticker SHALL use a configurable Rolling_Window with a default value of 60 seconds.
4. WHEN zero pulses exist within the Rolling_Window, THE BPM_Ticker SHALL return a minimum BPM of 1 (Zone 1 floor). BPM never returns zero.
5. WHEN ordering pulses within the Rolling_Window, THE BPM_Ticker SHALL sort by `timestamp` ascending, then by `id` ascending as a deterministic tie-breaker.
6. THE Dashboard_API SHALL expose a `GET /bpm` endpoint returning: `current` (integer), `baseline` (integer, static 20 for v1.0), `max` (integer), `zone` (integer 1–5), `window_seconds` (integer).

---

### Requirement 3: Zone Calculation

**User Story:** As a Founder, I want BPM zones calibrated to my personal max heart rate, so that the dashboard intensity reflects my system's own ceiling.

#### Acceptance Criteria

1. WHEN computing zone, THE BPM_Ticker SHALL derive zone from `(current_bpm / Max_BPM) * 100` using these thresholds:
   - Zone 1: 0–50%
   - Zone 2: 50–65%
   - Zone 3: 65–75%
   - Zone 4: 75–90%
   - Zone 5: 90–100%
2. WHILE Max_BPM has not been set by the Founder, THE BPM_Ticker SHALL use a default Max_BPM of 60.
3. WHEN the Founder sets Max_BPM via onboarding, THE BPM_Ticker SHALL recalibrate all zone thresholds immediately using the new value.

---

### Requirement 4: Layout Spec Generation

**User Story:** As a Founder, I want the dashboard to generate an AI-driven layout tailored to my current lens, so that I see the components that matter most for my audience context.

#### Acceptance Criteria

1. THE Dashboard_API SHALL expose a `POST /layout` endpoint accepting a JSON body containing `lens_id` (one of: `founder`, `ciso`, `investor`, `board`).
2. WHEN a layout request is received, THE Layout_Engine SHALL load the Lens definition for the requested `lens_id`, fetch the last N pulses within the Rolling_Window sorted by `timestamp` ascending then `id` ascending, and fetch the current BPM and zone.
3. WHEN zero pulses exist within the Rolling_Window, THE Layout_Engine SHALL return a deterministic fallback Layout_Spec containing a single `AlertFeed` component with message `"No recent activity"` without calling Claude API. This fallback SHALL NOT be cached — each empty-stream request re-evaluates the pulse count.
4. WHEN calling Claude API, THE Layout_Engine SHALL send a JSON payload containing: lens definition, recent pulses, current BPM, current zone, system baseline BPM (20), and the available component list from the Component_Library.
5. THE Layout_Engine SHALL use this exact Claude system prompt (do not modify):
   > "You are a dashboard layout engine. You receive a pulse stream and a lens definition. You return a JSON layout spec selecting components from the provided library. You never invent new components. You never return HTML. You never return prose. The summary field is one sentence maximum. Select components that matter most for this lens and audience. Return valid JSON only."
6. WHEN Claude returns a response, THE Layout_Engine SHALL first validate that the response is well-formed, parseable JSON. IF malformed, retry the Claude API call exactly once. IF the retry is also malformed, return an explicit error response.
7. WHEN the response is valid JSON, THE Layout_Engine SHALL validate the structural schema of the Layout_Spec — required fields: `lens`, `bpm_zone`, `summary`, `layout` (array). IF structural validation fails, retry the Claude API call exactly once. IF the retry also fails structural validation, return an explicit error response.
8. WHEN the Layout_Spec structure is valid, THE Layout_Engine SHALL validate that every component in the `layout` array exists in the Component_Library: `MetricCard`, `StatusGrid`, `AlertFeed`, `HealthBar`, `ActivitySparkline`, `PeopleCard`, `GapCard`, `LifecycleBoard`, `BPMChart`, `SecretRotation`, `CostTracker`, `PipelineMetric`. IF an invalid component is found, retry the Claude API call exactly once. IF the retry also contains an invalid component, return an explicit error response.
9. THE Layout_Engine SHALL never return a partial Layout_Spec. A Layout_Spec is either fully valid (parseable JSON + valid structure + all components in library) or an explicit error object is returned. There is no middle state.
10. THE Heart is a system-level UI element rendered unconditionally by the frontend on every view. It is NOT a member of the Component_Library. Claude SHALL never reference it in a Layout_Spec. The frontend renders the Heart outside and independent of the layout spec.

---

### Requirement 5: Lens Management

**User Story:** As a Founder, I want to switch between audience lenses, so that the same pulse stream is interpreted differently for different contexts.

#### Acceptance Criteria

1. THE Dashboard_API SHALL serve lens definitions for the built-in lenses: `founder`, `ciso`, `investor`, `board`.
2. WHEN the frontend requests a Layout_Spec with a `lens_id` different from the currently cached lens, THE Layout_Engine SHALL invalidate the prior cached Layout_Spec and make a fresh Claude API call. Prior specs are never reused across lens changes.
3. WHILE the same `lens_id` is active, THE Layout_Engine SHALL cache the Layout_Spec with a TTL of 30 seconds.
4. Each lens definition SHALL contain the fields: `id`, `label`, `prompt_context`, `severity_weights`, `source_weights`, `max_components`.

---

### Requirement 6: Onboarding

**User Story:** As a Founder, I want to set my max heart rate at first load, so that the dashboard zones are calibrated to my system's ceiling.

#### Acceptance Criteria

1. THE Dashboard_API SHALL expose a `POST /onboarding` endpoint accepting `{ max_bpm: integer }`.
2. WHEN `POST /onboarding` is received, THE Dashboard_API SHALL store Max_BPM and recalibrate all zone thresholds immediately.
3. THE Dashboard_API SHALL expose a `GET /onboarding` endpoint returning current onboarding state including whether Max_BPM has been set.
4. WHILE Max_BPM has not been set, THE BPM_Ticker SHALL use the default Max_BPM of 60.

---

### Requirement 7: Pulse Source Simulation

**User Story:** As a Founder, I want simulated pulse generation for all registered sources in v1.0, so that the dashboard can be demonstrated and tested before real webhook integrations are built.

#### Acceptance Criteria

1. THE Dashboard_API SHALL register simulated ingest handlers for: `github`, `stripe`, `auth0`, `hubspot`, `proof360`, `system`, `aws`.
2. ALL simulated pulses SHALL conform to the canonical pulse schema with valid values for all required fields.
3. THE pulse simulator SHALL emit one pulse every 3 seconds across all sources combined, with each pulse randomly assigned to one of the 7 source types. With default Max_BPM of 60, this yields an approximate resting BPM of 20 (Zone 1).
4. THE pulse simulation rate SHALL be configurable via environment variable, enabling higher zones to be tested deterministically by increasing frequency.
5. Simulated pulse types per source:
   - `github`: commits, PRs, deployments, issues
   - `stripe`: payments, subscriptions, failed charges
   - `auth0`: logins, new accounts, access events
   - `hubspot`: contacts, lifecycle changes, deals
   - `proof360`: assessments, trust scores, gap completions
   - `system`: health checks, SSL expiry, PM2 restarts
   - `aws`: EC2 health, cost alerts

---

### Requirement 8: File Structure and Stack

**User Story:** As a developer, I want the API organized into the specified file structure using the defined stack, so that the codebase is predictable and maintainable.

#### Acceptance Criteria

1. Stack: Node.js + Express (HTTP), Postgres (pulse store), Redis (BPM tick state + Dedup_Window), BullMQ (1s tick job), Claude API Sonnet (layout spec generation).
2. THE `api/` directory SHALL be created at the jp-system repository root if it does not already exist. The full directory tree SHALL be scaffolded before any source files are written.
3. ALL file paths SHALL be repo-root-relative. No current working directory assumptions.
4. Source structure:
   ```
   api/src/routes/     — pulses.js, bpm.js, layout.js, onboarding.js
   api/src/services/   — bpm-ticker.js, pulse-ingester.js, layout-engine.js
   api/src/config/     — lenses.js, components.js
   ```

---

*Locked: 2026-03-19*  
*Convergence: 8 rounds (Claude ↔ ChatGPT Stage 0 loop)*  
*Do not modify without explicit John Coates confirmation*
