# TASKS.md — ethikslabs Build Queue

---

## How This Works

Each thread produces tasks. Completed tasks get marked and dated.
This file is the handoff between sessions.

---

## Status Key

- `[ ]` — Not started
- `[~]` — In progress
- `[x]` — Done

---

## Thread: 2026-03-19 — Protocol + Orchestrator

### Completed
- [x] Design and lock PROTOCOL.md (Stage 0 Design Loop v1.1) via Claude ↔ ChatGPT convergence loop
- [x] Save PROTOCOL.md to jp-system/docs/
- [x] Save jp-system note to Apple Notes
- [x] Build orchestrator.py — Python automation for the Claude ↔ ChatGPT loop
- [x] Build orchestrator UI (React) — visual control room for the loop

---

## Thread: 2026-03-19 — jp-system + Dashboard v0 (Claude Code)

### Completed
- [x] jp-system restructured as control layer — CLAUDE.md, NORTH_STAR.md, THREAD_STARTER.md
- [x] /projects/, /secrets/, /health/, /people/, /docs/ folders created
- [x] Dashboard v0 built (Vite + React + Fastify) — localhost:5199
- [x] Dashboard — project cards, health checks, secrets rotation, git changelog, drill-down
- [x] ethikslabs.com DNS updated → 13.237.68.89
- [x] Cloudflare token rotated + stored in SSM /cloudflare/api-token
- [x] proof360 repo moved to ~/Dropbox/Projects/proof360
- [x] PROTOCOL.md split from PIPELINE.md
- [x] pulse-schema.md + dashboard-ai-spec.md read and understood
- [x] Dashboard v0 superseded by dashboard-ai-spec.md (pulse/BPM/heart model)

### Note
Dashboard v0 in jp-system/dashboard/ is a working prototype.
The real dashboard is being built by Kiro against brief-dashboard-api.md.
Dashboard v0 can be referenced for health check and SSE patterns.

---

## Thread: 2026-03-19 — Dashboard v1.0 Design

### Completed
- [x] Run Stage 0 protocol loop (Claude ↔ ChatGPT) — 8 rounds, converged
- [x] Lock 8 architectural constraints from loop
- [x] Write brief-dashboard-api.md — Kiro build brief
- [x] Write brief-dashboard-frontend.md — Claude Code build brief
- [x] Kiro requirements doc reviewed and approved
- [x] Addendum added: simulation rate (1 pulse/3s, configurable) + repo scaffolding rule

### In Progress
- [~] Kiro building dashboard API v1.0

### Carry Forward
- [ ] Kiro delivers api/ — verify against brief-dashboard-api.md
- [ ] Claude Code builds dashboard frontend — brief-dashboard-frontend.md
- [ ] Wire frontend to API (VITE_API_URL=http://localhost:3001)
- [ ] Smoke test: onboarding → heart beats → lens switch → component grid
- [ ] Commit PROTOCOL.md to jp-system repo (git add + push)
- [ ] Run orchestrator.py live against both APIs (requires ANTHROPIC_API_KEY + OPENAI_API_KEY env vars)
- [ ] Wire orchestrator UI to live websocket output from orchestrator.py
- [ ] Proof360 Firecrawl signal extractor rewrite (replace MVP simulation with real extraction)
- [ ] Ingram Micro reseller API integration + MCP emulation layer (pending token approval)

---

## Next Thread Prompt

> "Read jp-system/docs/TASKS.md. Dashboard API build is in progress with Kiro. Next: verify Kiro output against brief-dashboard-api.md, then dispatch Claude Code with brief-dashboard-frontend.md."

---

*Last updated: 2026-03-19*
