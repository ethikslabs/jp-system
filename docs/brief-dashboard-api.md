# jp-system Dashboard — API Brief
> Build target: v1.0

**Status:** Ready for build  
**Assigned:** Kiro  
**Depends on:** `pulse-schema.md`, `dashboard-ai-spec.md`

---

## What you are building

The backend for the jp-system Founder SIEM dashboard. This is the data and computation layer only — no UI. The frontend (Claude Code) consumes everything through the API.

---

## Core responsibilities

1. **Pulse ingestion** — receive, validate, deduplicate, and store pulses
2. **BPM computation** — compute current BPM on a fixed 1s tick
3. **Layout spec generation** — call Claude API with pulse context and lens, return JSON layout spec
4. **Lens management** — serve lens definitions, handle lens switch
5. **Onboarding** — store founder's max BPM, calibrate zones

---

## Pulse ingestion endpoint

`POST /pulses`

Validation rules (enforce in this order):
1. Reject if `schema_version` is not in the supported versions list (currently: `["1.0"]`)
2. Reject if `id` already exists in the rolling window (deduplication — rolling window = 300s)
3. Write `severity`, `tags`, `entity_type`, `entity_id` exactly once — never allow mutation of these fields after write
4. Store pulse as immutable record

Pulse schema (canonical — from `pulse-schema.md`):
```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "source": "string",
  "type": "event | metric | state | alert",
  "entity_type": "project | user | vendor | system",
  "entity_id": "string",
  "severity": "info | warning | critical",
  "payload": {},
  "tags": [],
  "schema_version": "1.0"
}
```

---

## BPM computation

- Runs on a **fixed 1-second interval tick** — never triggered by pulse arrival
- Rolling window: configurable, default 60s
- Formula: `count of pulses with timestamp within window / window_seconds * 60`
- Minimum BPM: Zone 1 floor (1 BPM) — never zero, never flatline
- BPM is never stored per pulse — computed at read time from the pulse stream
- Tie-breaker for ordering within window: `timestamp` ascending, then `id` ascending

**Zone calculation:**
```
zone = derived from (current_bpm / max_bpm) * 100

Zone 1: 0–50%
Zone 2: 50–65%
Zone 3: 65–75%
Zone 4: 75–90%
Zone 5: 90–100%
```

`max_bpm` is set by the founder at onboarding. Default until set: 60.

---

## BPM endpoint

`GET /bpm`

Returns:
```json
{
  "current": 42,
  "baseline": 28,
  "max": 80,
  "zone": 2,
  "window_seconds": 60
}
```

---

## Layout spec endpoint

`POST /layout`

Request body:
```json
{
  "lens_id": "founder | ciso | investor | board"
}
```

This endpoint:
1. Loads the lens definition for `lens_id`
2. Fetches last N pulses within rolling window, sorted by `timestamp` asc, `id` asc
3. Fetches current BPM + zone
4. Calls Claude API with the prompt contract from `dashboard-ai-spec.md`
5. Validates the returned layout spec — rejects any component not in the registered library
6. If Claude returns an invalid component, retry once. If retry fails, return error — do not substitute
7. Returns the validated layout spec JSON

Claude system prompt (exact — do not modify):
> You are a dashboard layout engine. You receive a pulse stream and a lens definition. You return a JSON layout spec selecting components from the provided library. You never invent new components. You never return HTML. You never return prose. The summary field is one sentence maximum. Select components that matter most for this lens and audience. Return valid JSON only.

Registered component library (validation list):
```
MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline,
PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation,
CostTracker, PipelineMetric
```

---

## Lens switch behaviour

When the frontend requests a layout spec with a new `lens_id`:
- The prior layout spec is invalidated server-side
- A fresh Claude API call is made — no caching of layout specs across lens changes
- Layout spec cache TTL (same lens): 30s

---

## Empty stream behaviour

When zero pulses exist within the rolling window:
- BPM returns Zone 1 minimum (1 BPM)
- Layout spec endpoint returns a single `AlertFeed` component with message: `"No recent activity"`
- Do not return an error — empty stream is a valid system state

---

## Onboarding endpoint

`POST /onboarding`
```json
{ "max_bpm": 80 }
```

Stores founder max BPM. Recalibrates all zones immediately. Called once at first load.

`GET /onboarding`

Returns current onboarding state — whether max BPM has been set.

---

## Pulse sources (initial)

Register ingest handlers for:
- `github` — commits, PRs, deployments, issues
- `stripe` — payments, subscriptions, failed charges
- `auth0` — logins, new accounts, access events
- `hubspot` — contacts, lifecycle changes, deals
- `proof360` — assessments, trust scores, gap completions
- `system` — health checks, SSL expiry, PM2 restarts
- `aws` — EC2 health, cost alerts

For v1.0: simulate pulse generation for all sources (real webhooks are post-v1.0).

---

## Stack

- Node.js + Express
- Postgres (pulse store)
- Redis (BPM tick, deduplication window)
- Claude API (Sonnet — layout spec generation)
- BullMQ (BPM tick job, 1s interval)

---

## Deliver

- `api/src/routes/pulses.js`
- `api/src/routes/bpm.js`
- `api/src/routes/layout.js`
- `api/src/routes/onboarding.js`
- `api/src/services/bpm-ticker.js` — 1s tick, BullMQ
- `api/src/services/pulse-ingester.js` — validation, dedup, write
- `api/src/services/layout-engine.js` — Claude call, spec validation
- `api/src/config/lenses.js` — lens definitions
- `api/src/config/components.js` — registered component library

---

*Defined: 2026-03-19*  
*Owner: John Coates — do not change without explicit confirmation*
