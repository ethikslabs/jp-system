# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## North star

> EthiksLabs is open source infrastructure for trust.
> A safe place to break things, iterate fast, and only ship what survives.

> The dashboard is a Founder SIEM — real time, cross-system, business + technical signals in one view. What Splunk does for a CISO, this does for a founder. Without the $150k price tag.

Projects are built in public. Engines stay private. Nothing ships without John's authorisation. Collaborators are found through the work, not through interviews.

## What this repo is

This repository, `jp-system`, is John's master workspace.

It is not a product application repo by default and should not be treated like one unless the current task explicitly says otherwise.

Its purpose is to:
- act as the central operating workspace across projects
- hold stable context, current priorities, execution rules, and agent instructions
- reduce repeated explanation across chats and tools
- coordinate work across projects such as Proof360, Trust360, Research360, and related repos

What belongs here:
- project context and lifecycle state
- system-wide operational state
- agent role definitions
- people — collaborators, prospects, partners
- operating instructions
- lightweight documentation
- founder and system notes

What does not belong here by default:
- full product implementation code
- speculative architecture rewrites
- unnecessary framework or tooling layers

If code work is needed for a product, use this repo to define, align, and coordinate the work unless John explicitly switches into that product repo.

## Project lifecycle

Every project has a lifecycle state. Never assume — check the project file.

| State | Meaning |
|-------|---------|
| `lab` | Being built. John's eyes only. May break. |
| `public` | Visible to anyone. Clearly experimental. No guarantees. |
| `validated` | Working. Surviving real use. Under consideration for handoff. |
| `authorised` | John signed off. Cleared for production. |
| `live` | Running in production. Someone else operates it. |
| `archived` | Done. Not maintained. |

Nothing moves to `authorised` or `live` without John explicitly confirming it.

## People

- `people/collaborators.md` — invited inside the lab
- `people/prospects.md` — engaging publicly, worth watching
- `people/partners.md` — commercial and strategic relationships

## Project status

Live status for each project is tracked in `/projects/`:
- `projects/proof360.md`
- `projects/proof360-founder-experience.md` — locked founder experience principle (v1.0)
- `projects/proof360-principle.md` — locked product principle
- `projects/research360.md`
- `projects/signal360.md`
- `projects/civique.md`

Update these at the end of any session where meaningful progress was made.

**Project Room files** — `projects/*-room.md` (e.g. `proof360-room.md`, `research360-room.md`) are structured data files powering the "Project Room" views in the portal. They contain identity, problem, solution, stack, traction, and graduation criteria per project. Update when meaningful facts change. Do not confuse with the parent `projects/<name>.md` status files — both coexist.

## Startup — always do this first

`AGENTS.md` at the repo root governs agent operating rules, handoff protocol, and role responsibilities. CLAUDE.md is the detail layer.

Before any work, read in order:
1. `/projects/<relevant-project>.md` — current status and next actions
2. `/ai/SYSTEM_CONTEXT.md` — stable context for the current project focus
3. `/ai/CURRENT_TASK.md` — active execution delta, blockers, and acceptance criteria
4. The relevant role file from `/ai/roles/` (see Role Selection below)

If the task spans multiple phases, reread `/ai/CURRENT_TASK.md` before each phase.

## Role selection

| Role file | Use when |
|-----------|----------|
| `ai/roles/chatgpt-architecture.md` | Architecture or system trade-offs |
| `ai/roles/claude-refinement.md` | Refining flows, prompts, or product shape |
| `ai/roles/kiro-spec.md` | Writing specs, interfaces, or task decomposition |
| `ai/roles/claude-code-build.md` | Implementation work |
| `ai/roles/codex-review.md` | Review and execution-risk checking |

## Current Project Focus

The current focus is the **jp-system Founder SIEM dashboard** — John's personal operating dashboard showing real-time signals across all EthiksLabs projects.

- **Frontend:** React + Vite, localhost:5174, `dashboard/src/`
- **API:** Express + Postgres + Redis + BullMQ, localhost:3001, `api/`
- **Model:** pulse → BPM → lens → layout spec → component grid
- **Status:** v1.0 running locally. Smoke test passed 2026-03-20.
- **Active task:** See `/ai/CURRENT_TASK.md`

## Execution rules

- Assume architecture is already decided unless `/ai/CURRENT_TASK.md` explicitly says otherwise.
- Backend owns all business logic. Frontend renders state and collects input only.
- Each pipeline stage output is structured data — not loose prose.
- Validate at stage boundaries. Avoid hidden state between stages.
- Prefer minimal, scoped changes. No cosmetic refactors.
- Treat `/ai/CURRENT_TASK.md` as the execution delta.
- Keep outputs concise and task-focused.
- If the codebase and task files conflict, surface the conflict — do not invent a new direction.
- Capture new stable facts in `/ai/SYSTEM_CONTEXT.md` only when John explicitly confirms them.

## Working Mode

There may be little or no product code in this repo. By default, behave as if this is a control layer and execution workspace, not an app waiting for generic scaffolding.

When implementation begins for a specific product, follow that product's architecture and task files rather than inventing a new system here.

---

## What is actually in this repo

### `dashboard/` — Founder SIEM v1.0

Production React + Vite frontend. Pulse/BPM/lens model. Built against `docs/brief-dashboard-frontend.md`.

**To run:**
```bash
cd dashboard && npm run dev      # frontend on localhost:5174
# API must be running (api/ — requires Postgres + Redis, see below)
```

**Key files:**
```
dashboard/src/App.jsx                     — screen router (onboarding → dashboard)
dashboard/src/screens/Onboarding.jsx      — max heart rate input on first load
dashboard/src/screens/Dashboard.jsx       — heart + lens switcher + component grid
dashboard/src/components/Heart.jsx        — beating heart, zone colour, Framer Motion
dashboard/src/components/lens/            — LensSwitcher (Founder/CISO/Investor/Board)
dashboard/src/components/library/         — all 12 registered components
dashboard/src/hooks/useBPM.js             — polls GET /bpm every 1s
dashboard/src/hooks/useLayout.js          — fetches POST /layout on lens change
dashboard/src/services/api.js             — all API calls (base URL: VITE_API_URL)
```

**Registered component library (validated at both API and frontend):**
```
MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline,
PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation,
CostTracker, PipelineMetric
```

Unknown components returned by the layout API show an `ErrorCard` — never silently skipped. The canonical validation list lives in `api/src/config/components.js`; the frontend `COMPONENT_REGISTRY` in `dashboard/src/screens/Dashboard.jsx` must stay in sync.

### `api/` — Dashboard API v1.0

Node.js + Express backend. Stack: Postgres (pulse store), Redis (BPM snapshot + dedup), BullMQ (1s tick), Claude API (Sonnet).

**To run (full stack):**
```bash
# Terminal 1 — ngrok (required for GitHub webhooks)
ngrok http --url=higher-baculine-andree.ngrok-free.dev 3001

# Terminal 2 — API
cd api && node index.js

# Terminal 3 — Frontend
cd dashboard && npm run dev

# Terminal 4 — Proof360 (optional, for cross-product pulses)
cd ~/Library/CloudStorage/Dropbox/Projects/proof360/api && node server.js
```

**Test:**
```bash
cd api && npm test                                          # all tests (jest)
cd api && npx jest tests/path/to/file.js                  # single test file
cd api && npx jest tests/property/lens-config.property.js # property tests (fast-check)
```

**First-time setup:**
```bash
# 1. Create api/.env (see required vars below)
# 2. Apply schema:
psql $PGDATABASE -f api/src/db/schema.sql
# 3. Start Redis
# 4. node index.js
```

**Required `api/.env` vars:**
```
PORT=3001
DATABASE_URL=postgres://...
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_WEBHOOK_SECRET=...        # must match GitHub webhook config
ENABLE_SIMULATOR=true            # set false to disable synthetic pulses
```

**AWS credentials** — uses default SDK credential chain (IAM role / `~/.aws/credentials`). The Cloudflare API token is read from SSM at `/cloudflare/api-token` — no `.env` entry needed.

**API routes:**
```
POST /pulses           — ingest a pulse (300s dedup window by source+type+entity_id)
GET  /bpm              — current BPM snapshot from Redis
POST /layout           — { lens_id } → component grid JSON (30s Redis cache, 2 Claude attempts)
GET  /onboarding       — get max_bpm setting
POST /onboarding       — set max_bpm, writes to DB + Redis bpm:max
POST /webhooks/github  — GitHub events → pulses (HMAC-SHA256 verified; push, pull_request, deployment_status, issues)
GET  /actions          — recent pulses as human-readable action labels (used by CISO lens)
```

**Architecture — pulse/BPM/lens model:**
- **Pulses** — immutable structured events, schema defined in `api/src/db/schema.sql`
- **BPM** — BullMQ worker fires every 1s, counts pulses in 60s rolling window, writes snapshot to Redis hash `bpm:current`. Zone 1–5 based on `current/max` ratio (50/65/75/90% thresholds).
- **Layout** — `POST /layout` triggers `layout-engine.js`: checks pulse count, reads Redis cache, calls Claude API (model: `claude-sonnet-4-20250514`), validates response (3 steps: JSON parse → schema → component library check), caches 30s. Falls back to `AlertFeed` if zero pulses.
- **Simulator** — `pulse-simulator.js` runs in-process and fires synthetic pulses so BPM is never empty in dev. Disable with `ENABLE_SIMULATOR=false`.

**Background pollers (all start automatically with `node index.js`):**
- **AWS poller** (`aws-poller.js`) — EC2 instance health (60s), CloudWatch CPU (60s), Cost Explorer monthly (1hr); region `ap-southeast-2`
- **Compliance poller** (`compliance-poller.js`) — open security groups (10min), unencrypted EBS (1hr), GuardDuty findings (5min), IAM users without MFA (1hr)
- **Cloudflare poller** (`cloudflare-poller.js`) — zone analytics (5min), SSL certificate status (1hr); token from SSM `/cloudflare/api-token`

**Proof360 pulse emitter** — `proof360/api/src/services/pulse-emitter.js` fires pulses on assessment lifecycle events (started, submitted, report_generated, lead_captured, pipeline_timeout). Fire-and-forget — Proof360 is unaffected if the dashboard API is down. Requires `DASHBOARD_API_URL=http://localhost:3001` in proof360's `.env`.

### `.kiro/specs/dashboard-api/` — formal API spec (produced by Kiro)

| File | Purpose |
|------|---------|
| `requirements.md` | Full requirements list (numbered, traceable) |
| `design.md` | Design decisions and interface contracts |
| `tasks.md` | Task decomposition — implementation checklist |

These are the authoritative spec artefacts. Cross-reference against `docs/brief-dashboard-api.md` if anything conflicts.

### `docs/` — build briefs and session records

| File | Purpose |
|------|---------|
| `TASKS.md` | Session handoff queue — the build log across threads |
| `PROTOCOL.md` | Stage 0 Design Loop protocol (Claude ↔ ChatGPT convergence) |
| `PIPELINE.md` | Pipeline architecture reference |
| `pulse-schema.md` | Canonical pulse schema |
| `dashboard-ai-spec.md` | Dashboard AI layout spec contract |
| `brief-dashboard-api.md` | API build brief for Kiro |
| `brief-dashboard-frontend.md` | Frontend build brief for Claude Code |
| `requirements-dashboard-api.md` | Kiro's requirements doc (reviewed + approved) |
| `audience-views.md` | Lens/audience view definitions |
| `archive/` | Retired session records and superseded protocol files |

### `health/` — project health check state

JSON files per project: `proof360.json`, `research360.json`, `signal360.json`.
Shape: `{ "checks": [], "ssl": [] }`. Written by the dashboard backend.

### `secrets/` — secret rotation tracking

Markdown files per project tracking which secrets exist, rotation status, and storage location (e.g. AWS SSM paths). Not secrets themselves.

### `TASKS.md` — session handoff surface

The canonical build queue. Each session adds completed tasks and carry-forward items. Read this at the start of any session to understand what's in progress. Update it when meaningful progress is made.

### `THREAD_STARTER.md` — session bootstrapper

A copy-paste template for starting new Claude/ChatGPT threads. Paste project status + current task + role choice. One task per thread.

## Infrastructure

```
ethikslabs.com → Cloudflare (proxied) → AWS EC2 ap-southeast-2 (54.252.185.132)
                                        → Nginx → Node.js + Express backend
```

- DNS: Cloudflare (aida.ns / kyle.ns), SSL: Flexible, AI training bots blocked
- EC2 path: `/home/ec2-user/ethikslabs/ethikslabs-core`
- Repo: `github.com/ethikslabs/ethikslabs-core`
- Backend started manually: `node server.mjs`
- Voice pipeline: AWS Transcribe (STT) → AWS Bedrock Claude 3.5 Sonnet (LLM) → Amazon Polly (TTS)

**EC2 access: SSM only — not SSH. Port 22 is not open.**
```bash
aws ssm start-session --target <instance-id> --region ap-southeast-2
```
