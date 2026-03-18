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
- `projects/research360.md`
- `projects/signal360.md`
- `projects/civique.md`

Update these at the end of any session where meaningful progress was made.

## Startup — always do this first

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

The current setup in this repo is tailored to **Proof360**.

- **Product:** Proof360 converts messy operating evidence into structured trust output for vendors and partners.
- **Pipeline:** `input → signals → inference → corrections → context → gaps → Trust360 → score → vendors → report`
- **Stack:** Fastify API + Vite/React frontend + Trust360 (external reasoning engine)
- **Key boundary:** Trust360 is external. Proof360 prepares structured inputs for it and consumes outputs. Never cross that boundary implicitly.

Treat this as the current project context, not a statement that `jp-system` is itself the Proof360 product repo.

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

### `dashboard/` — Founder SIEM v0 prototype

Working React/Vite prototype. Uses SSE for real-time updates.

```
dashboard/src/App.jsx           — main app, SSE client, project grid
dashboard/src/components/       — ProjectCard, ProjectDetail
dashboard/vite.config.js        — proxies /api to http://localhost:3333
```

**To run:**
```bash
cd dashboard && npm run dev      # frontend on localhost:5199 (or Vite default)
# Fastify backend must be running on port 3333 (not in this repo)
```

**Note:** Dashboard v0 is a working prototype. The production Founder SIEM (v1.0) is being built against `docs/brief-dashboard-api.md` with a different stack (Node.js + Express + Postgres + Redis + BullMQ). Dashboard v0 can be referenced for health check polling and SSE patterns.

### Dashboard v1.0 architecture (from `docs/brief-dashboard-api.md`)

The production dashboard uses a **pulse/BPM/lens model**:

- **Pulses** — immutable structured events (`POST /pulses`), 300s deduplication window
- **BPM** — computed on a 1s tick from pulse count in a rolling window; 5 zones based on `current/max` ratio
- **Layout spec** — Claude API (Sonnet) generates a component grid JSON for the active lens (`POST /layout`)
- **Lenses** — `founder | ciso | investor | board` — each produces a different component selection

Registered component library (validation list — Claude must only return these):
```
MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline,
PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation,
CostTracker, PipelineMetric
```

Stack: Node.js + Express, Postgres (pulse store), Redis (BPM tick + dedup), BullMQ (1s tick), Claude API (Sonnet).

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
| `session-2026-03-18.md` | Session record |

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
