# Implementation Plan: Dashboard API

## Overview

Build the jp-system Founder SIEM dashboard backend in logical dependency order: scaffold → config → services → routes → wiring → tests. All paths are repo-root-relative under `api/`. Stack: Node.js + Express, Postgres, Redis, BullMQ, Claude API (Sonnet). Tests use Jest + fast-check.

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - [x] 1.1 Create `api/` directory tree and `api/package.json`
    - Create directories: `api/src/routes/`, `api/src/services/`, `api/src/config/`, `api/tests/unit/`, `api/tests/property/`, `api/tests/integration/`
    - Create `api/package.json` with dependencies: `express`, `pg`, `ioredis`, `bullmq`, `@anthropic-ai/sdk`, `uuid`, `dotenv`
    - Dev dependencies: `jest`, `fast-check`, `pg-mem`, `ioredis-mock`
    - _Requirements: 8.6, 8.10, 8.11_

  - [x] 1.2 Create `api/index.js` — Express app bootstrap
    - Import and mount route modules at `/pulses`, `/bpm`, `/layout`, `/onboarding`
    - Configure JSON body parsing
    - Initialize Postgres pool, Redis client, and BullMQ worker
    - Start BPM ticker repeatable job (1s interval)
    - Start pulse simulator
    - _Requirements: 8.1, 8.4_

- [x] 2. Implement config modules
  - [x] 2.1 Create `api/src/config/components.js` — Component Library registry
    - Export `COMPONENT_LIBRARY` array with all 12 registered components: MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline, PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation, CostTracker, PipelineMetric
    - Export `isValidComponent(name)` helper function
    - Heart is explicitly excluded — it is a system-level UI element
    - _Requirements: 4.7, 4.12_

  - [x] 2.2 Create `api/src/config/lenses.js` — Lens definitions
    - Export lens definitions object keyed by lens ID for `founder`, `ciso`, `investor`, `board`
    - Each lens includes: `id`, `label`, `prompt_context`, `severity_weights`, `source_weights`, `max_components`
    - Export `getLens(lensId)` helper that returns the definition or null
    - _Requirements: 5.1, 5.4_

  - [ ]* 2.3 Write property test for lens config — Property 14
    - **Property 14: Lens definitions contain all required fields**
    - Test file: `api/tests/property/lens-config.property.js`
    - For each lens in config, verify all required fields are present and correctly typed
    - **Validates: Requirements 5.4**

- [x] 3. Implement Postgres schemas
  - [x] 3.1 Create `api/src/db/schema.sql` — Database schema
    - Define `pulses` table with all fields, CHECK constraints on `type`, `entity_type`, `severity`
    - Define indexes: `idx_pulses_timestamp` (timestamp DESC), `idx_pulses_id_source` (id, source)
    - Define `onboarding` table with single-row upsert pattern
    - Seed row: `INSERT INTO onboarding (id, max_bpm, configured) VALUES (1, 60, FALSE) ON CONFLICT (id) DO NOTHING`
    - _Requirements: 1.3, 1.4, 6.4, 8.2_

  - [x] 3.2 Create `api/src/db/pool.js` — Postgres connection pool
    - Export a shared `pg.Pool` instance configured from environment variables
    - _Requirements: 8.2_

- [x] 4. Implement pulse ingestion service and route
  - [x] 4.1 Create `api/src/services/pulse-ingester.js`
    - Implement `ingestPulse(pulseBody)` with strict validation pipeline:
      1. Schema version check — reject if not in `["1.0"]`
      2. Canonical schema enforcement — validate all required fields present and typed correctly (`id` UUID, `timestamp` ISO8601, `source` non-empty string, `type` enum, `entity_type` enum, `entity_id` non-empty string, `severity` enum, `payload` object, `tags` array of strings, `schema_version` string)
      3. Dedup check — Redis `SET` key `dedup:{id}:{source}` with 300s TTL, reject if exists
      4. Store — Postgres INSERT into `pulses` table
    - Return `{ stored: true, pulse }` on success
    - Throw `ValidationError` or `DuplicateError` with appropriate details
    - Accept out-of-order timestamps — no window check at ingest
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8_

  - [x] 4.2 Create `api/src/routes/pulses.js`
    - `POST /pulses` — delegate to `pulse-ingester.ingestPulse()`
    - Map `ValidationError` → 400, `DuplicateError` → 409, storage error → 500
    - Return JSON error bodies with `error` field and details
    - _Requirements: 1.6_

  - [ ]* 4.3 Write property tests for pulse validation — Properties 1, 2, 3, 4
    - **Property 1: Schema validation rejects invalid pulses**
    - **Property 2: Validation order is enforced**
    - **Property 3: Pulse storage round trip**
    - **Property 4: Dedup rejects duplicate (id, source) pairs**
    - Test file: `api/tests/property/pulse-validation.property.js`
    - Use fast-check to generate random pulse objects with missing/invalid fields, unsupported schema versions, duplicate (id, source) pairs, and valid pulses for round-trip verification
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.7**

  - [ ]* 4.4 Write unit tests for pulse ingester
    - Test file: `api/tests/unit/pulse-ingester.test.js`
    - Test specific examples: valid pulse stored, duplicate rejected, invalid schema version rejected, missing fields rejected, out-of-order timestamp accepted
    - Mock Postgres with `pg-mem`, mock Redis with `ioredis-mock`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7, 1.8_

- [x] 5. Checkpoint — Pulse ingestion complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement BPM ticker service and route
  - [x] 6.1 Create `api/src/services/bpm-ticker.js`
    - Implement `tick()` — called by BullMQ every 1 second:
      1. Query Postgres for pulses where `timestamp >= now - window_seconds`, ordered by `timestamp ASC, id ASC`
      2. Compute `current_bpm = Math.max(1, Math.round(count / window_seconds * 60))` — floor of 1, never zero
      3. Read `max_bpm` from Redis key `bpm:max` (default 60)
      4. Compute zone from `(current_bpm / max_bpm) * 100` using thresholds: 0–50% → 1, 50–65% → 2, 65–75% → 3, 75–90% → 4, 90–100% → 5
      5. Write `{ current, baseline: 20, max, zone, window_seconds }` to Redis hash `bpm:current`
    - Implement `getCurrentBPM()` — reads latest snapshot from Redis `bpm:current`
    - Implement `computeZone(currentBpm, maxBpm)` as a pure exported function for testability
    - Configure BullMQ repeatable job: queue `bpm-tick`, job `compute-bpm`, every 1000ms, concurrency 1
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3_

  - [x] 6.2 Create `api/src/routes/bpm.js`
    - `GET /bpm` — call `bpm-ticker.getCurrentBPM()`, return JSON response
    - Return 503 with `{ "error": "bpm_unavailable" }` if Redis has no BPM data
    - _Requirements: 2.6_

  - [ ]* 6.3 Write property tests for BPM computation — Properties 5, 6, 7
    - **Property 5: BPM formula correctness**
    - **Property 6: Pulse ordering within window**
    - **Property 7: Zone calculation from BPM percentage**
    - Test file: `api/tests/property/bpm-computation.property.js` and `api/tests/property/zone-calculation.property.js`
    - Use fast-check to generate random pulse sets with random timestamps, random (current_bpm, max_bpm) pairs
    - Verify BPM formula, sort order, and zone threshold mapping
    - **Validates: Requirements 2.2, 2.4, 2.5, 3.1**

  - [ ]* 6.4 Write unit tests for BPM ticker and zone calculation
    - Test files: `api/tests/unit/bpm-ticker.test.js`, `api/tests/unit/zone-calculation.test.js`
    - Test edge cases: zero pulses returns BPM 1, zone boundaries (exact 50%, 65%, 75%, 90%), default max_bpm 60
    - Mock Postgres and Redis
    - _Requirements: 2.2, 2.4, 3.1, 3.2_

- [x] 7. Implement onboarding route and service
  - [x] 7.1 Create `api/src/routes/onboarding.js`
    - `POST /onboarding` — validate `max_bpm` is a positive integer, upsert into `onboarding` table, write `max_bpm` to Redis key `bpm:max`, return `{ max_bpm, status: "configured" }`
    - `GET /onboarding` — read from `onboarding` table, return `{ max_bpm, configured }` (default: `{ max_bpm: 60, configured: false }`)
    - Map validation errors → 400, storage errors → 500
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.2 Write property test for onboarding — Property 8
    - **Property 8: Onboarding max_bpm round trip and zone recalibration**
    - Test file: `api/tests/property/onboarding.property.js`
    - Use fast-check to generate random positive integers, post then verify GET returns same value and zone recalculation uses new max_bpm
    - **Validates: Requirements 3.3, 6.2**

  - [ ]* 7.3 Write unit tests for onboarding
    - Test file: `api/tests/unit/onboarding.test.js`
    - Test: valid max_bpm stored, invalid max_bpm rejected (zero, negative, non-integer, missing), GET returns default when not configured
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement layout engine service and route
  - [x] 8.1 Create `api/src/services/layout-engine.js`
    - Implement `generateLayout(lensId)`:
      1. Validate `lensId` against known lenses — throw if invalid
      2. Check pulse count in window — if zero, return empty-stream fallback (AlertFeed with "No recent activity"), do not cache
      3. Check Redis cache key `layout:{lensId}` — if hit and TTL valid, return cached spec
      4. Load lens definition from `lenses.js`
      5. Fetch recent pulses from Postgres (within rolling window, sorted `timestamp ASC, id ASC`)
      6. Fetch current BPM snapshot from Redis
      7. Build Claude API payload per prompt contract (lens, recent_pulses, current_bpm, bpm_zone, system_baseline_bpm: 20, available_components)
      8. Call Claude API with exact system prompt from design doc
      9. Validate response — 3-step: JSON parse → structural schema → component library check
      10. On any validation failure → retry once. On retry failure → throw LayoutError (maps to 502)
      11. On success → cache in Redis `layout:{lensId}` with 30s TTL, return spec
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 5.2, 5.3_

  - [x] 8.2 Create `api/src/routes/layout.js`
    - `POST /layout` — validate `lens_id` in body, delegate to `layout-engine.generateLayout()`
    - Map invalid lens → 400, LayoutError → 502
    - _Requirements: 4.1_

  - [ ]* 8.3 Write property tests for layout validation — Properties 9, 10, 11
    - **Property 9: Layout validation rejects invalid specs**
    - **Property 10: Layout validation retries once then errors**
    - **Property 11: Claude API payload contains all required fields**
    - Test file: `api/tests/property/layout-validation.property.js`
    - Use fast-check to generate random invalid JSON, missing fields, unknown components; mock Claude API
    - **Validates: Requirements 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.2, 4.3**

  - [ ]* 8.4 Write property tests for layout caching — Properties 12, 13
    - **Property 12: Lens cache invalidation on switch**
    - **Property 13: Same-lens cache TTL**
    - Test file: `api/tests/property/layout-caching.property.js`
    - Use fast-check to generate random lens_id sequences, verify cache miss on lens change and cache hit within 30s
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 8.5 Write unit tests for layout engine
    - Test file: `api/tests/unit/layout-engine.test.js`
    - Test: valid layout returned, empty stream returns AlertFeed fallback, invalid Claude response triggers retry, retry failure returns 502, cache hit skips Claude call, lens switch invalidates cache
    - Mock Claude API, Postgres, Redis
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 5.2, 5.3_

- [x] 9. Checkpoint — All services and routes complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement pulse simulator
  - [x] 10.1 Create `api/src/services/pulse-simulator.js`
    - Emit one pulse every 3 seconds across all sources combined
    - Randomly assign each pulse to one of 7 sources: `github`, `stripe`, `auth0`, `hubspot`, `proof360`, `system`, `aws`
    - Generate source-appropriate `type` and `payload` for each source:
      - `github`: commits, PRs, deployments, issues
      - `stripe`: payments, subscriptions, failed charges
      - `auth0`: logins, new accounts, access events
      - `hubspot`: contacts, lifecycle changes, deals
      - `proof360`: assessments, trust scores, gap completions
      - `system`: health checks, SSL expiry, PM2 restarts
      - `aws`: EC2 health, cost alerts
    - All generated pulses must conform to canonical pulse schema
    - Simulation rate must be configurable (env var or constructor param) for zone testing
    - Route generated pulses through `pulse-ingester.ingestPulse()` so they pass the same validation pipeline
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_

  - [ ]* 10.2 Write property test for simulator — Property 15
    - **Property 15: Simulated pulses conform to canonical schema and source types**
    - Test file: `api/tests/property/simulator.property.js`
    - Use fast-check to generate many simulated pulses, validate each against canonical schema and verify source-appropriate types
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9**

- [x] 11. Wire everything together in `api/index.js`
  - [x] 11.1 Finalize `api/index.js` — full integration wiring
    - Mount all route modules: `/pulses`, `/bpm`, `/layout`, `/onboarding`
    - Initialize Postgres pool and run schema if needed
    - Initialize Redis client
    - Start BullMQ BPM ticker (1s repeatable job, concurrency 1)
    - Start pulse simulator with configurable rate
    - Add graceful shutdown (close pool, Redis, BullMQ)
    - Add global error handler returning JSON errors
    - _Requirements: 8.1, 8.4, 8.6, 8.7, 8.8, 8.9_

  - [ ]* 11.2 Write integration tests
    - Test files: `api/tests/integration/pulse-flow.test.js`, `api/tests/integration/onboarding-flow.test.js`
    - `pulse-flow.test.js`: End-to-end ingest → BPM computation → layout generation
    - `onboarding-flow.test.js`: Onboarding → zone recalibration → BPM reflects new max
    - Use `pg-mem` and `ioredis-mock`, mock Claude API
    - _Requirements: 1.1, 1.2, 2.2, 3.1, 3.3, 4.2, 6.2_

- [x] 12. Final checkpoint — All tests pass, full integration verified
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate the 15 correctness properties from the design document
- All file paths are repo-root-relative under `api/`
- Checkpoints at tasks 5, 9, and 12 ensure incremental validation
- The pulse simulator routes through the same ingestion pipeline as real pulses
