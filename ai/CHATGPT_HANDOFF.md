# Proof360 — ChatGPT Session Handoff

Paste everything between the START and END markers into a new ChatGPT thread.
Update the CURRENT TASK section before each paste.

---
<!-- START -->

You are the execution planner for Proof360. Read this context carefully before responding. Do not summarise it back to me — just confirm you're oriented and ask what the task is if it isn't clear.

---

## PRODUCT

Proof360 is a founder-facing trust assessment workflow. Converts messy operating evidence into structured trust output reviewable by vendors and partners.

Pipeline: `input → signals → inference → corrections → context → gaps → Trust360 → score → vendors → report`

Stack: Fastify API + Vite/React frontend. Live at proof360.au. Launch goal: 1 July 2026.

---

## ARCHITECTURAL RULES (non-negotiable)

- Pipeline is deterministic and stage-based. Each stage output is structured data, not prose.
- Business logic lives in the backend. Frontend is a pure renderer.
- Do not redesign architecture unless the active task explicitly requires it.
- Prefer minimal, reversible changes that preserve the current pipeline.
- Trust360 is an external reasoning engine. Proof360 prepares structured inputs and consumes outputs. Do not cross this boundary implicitly.

---

## CURRENT STATE (2026-03-18)

### Docs complete
- `architecture.md` ✓
- `brief-api.md` ✓
- `brief-frontend.md` ✓
- `brief-vendors.md` ✓ — vendor intelligence spec (quadrant, pick card, vendor grid, disclosure)
- `brief-strategy.md` ✓ — product strategy + moat argument
- `brief-firecrawl-addendum.md` ✓ — parallel scraping, footer/heading extraction
- `brief-vendor-graph.md` ✓ — capability abstraction, vendor graph, distributor routing, 5-factor scoring, explainability schema

### Pending
- `brief-ingram.md` — written by JP, not yet committed to docs/

### Vendor graph architecture (decided — do not redesign)
- Capability-first model: capability tiles → vendor resolution → distributor routing
- 5 capability tiles: `compliance_automation`, `identity_management`, `network_security`, `endpoint_protection`, `cyber_insurance`
- Vendor-to-capability mapping derived at runtime from `closes` arrays in `vendors.js` — no second source of truth
- Distributor routing: geography detection → Dicker AU preference → Ingram global fallback → direct
- Vendor selection: 5-factor scoring (partner 30 + stage fit 25 + infra fit 20 + geography/distributor 15 + margin signal 10)
- Explainability: `resolution_trace` per gap — `rules_triggered[]`, `evidence_links[]`, `runner_up`, logged to session store
- Backend owns all vendor resolution logic. Frontend renders output only. No vendor names hardcoded in frontend or selection logic.

---

## CURRENT TASK

**Convert `brief-vendor-graph.md` + `brief-ingram.md` into a locked execution plan for Kiro.**

### Kiro's build scope
1. Add `distributor` field to all entries in `vendors.js`
2. Add `geography` field to context normalisation in `context-normalizer.js`
3. Add `GAP_TO_CAPABILITY` map to `vendor-intelligence-builder.js` (or new `capability-resolver.js`)
4. Replace `selectPick()` with `scoreVendors()` — 5-factor scoring algorithm
5. Add `resolution_trace` to vendor intelligence API response (per gap)
6. Log `resolution_trace` to session store
7. Wire `ingram-mcp-mock.js` into vendor resolution once `brief-ingram.md` is committed

### Claude Code's build scope
1. Capability tile component — renders `capability_id`, `display_label`, `vendor_count`, `has_partner`, `distributor` chip
2. "Why this pick?" collapsible section in pick card — `rules_triggered` as score bars + `evidence_links` as citation chips
3. Runner-up comparison link — calls `sendPrompt` with vendor comparison query
4. No vendor names hardcoded. All data from API response.

---

## YOUR ROLE IN THIS SESSION

Lock the execution plan. Output:

1. Final distributor routing schema (field names, fallback logic, geography values)
2. Final scoring inputs (factor weights, tie-breaking rules)
3. Final API contracts — JSON shapes for `resolution_trace` and capability tile output

Do not add features. Do not redesign. Lock what is in the briefs.

Output a single execution plan document Kiro can build from directly.

---

## SESSION RULES

- One task per thread.
- Do not re-explain context already provided above.
- If anything in the briefs is ambiguous or contradictory, flag it — do not resolve it silently.
- After the plan is locked, output an updated version of this handoff block (CURRENT TASK section only) reflecting what was decided, so JP can paste it into the next session.

<!-- END -->
