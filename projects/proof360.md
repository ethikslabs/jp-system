# Proof360

**Status:** In active build — Fastify API + React/Vite frontend running, live at proof360.au
**Target:** Demo-ready for vendor partners (not full MVP)
**Launch goal:** 1 July 2026

## What it is
Founder-facing trust assessment workflow. Converts messy operating evidence into structured trust output reviewable by vendors and partners.

## Pipeline
`input → signals → inference → corrections → context → gaps → Trust360 → score → vendors → report`

## Stack
- API: Fastify
- Frontend: Vite + React
- External reasoning: Trust360 (integration boundary — do not cross implicitly)

## Repos
- Execution layer / context: `~/Dropbox/Projects/jp-system`
- Product repo: `~/Dropbox/Projects/proof360`
- Live URL: https://proof360.au

## Current state

### API (`~/Projects/proof360/api/src/`)
- 9 endpoints live
- Services: `signal-extractor.js` (Firecrawl + Claude Haiku), `vendor-intelligence-builder.js`, `vendor-selector.js`, `gap-mapper.js`, `inference-builder.js`, `context-normalizer.js`, `session-store.js`, `trust-client.js`
- Config: `vendors.js` (full vendor catalog — see below), `gaps.js`, `frameworks.js`
- Ingram MCP mock built at `api/src/services/ingram-mcp-mock.js` — not yet wired in

### Docs (`~/Projects/proof360/docs/`)
- `architecture.md` ✓
- `brief-api.md` ✓
- `brief-frontend.md` ✓
- `brief-vendors.md` ✓ — vendor intelligence spec (quadrant, pick card, vendor grid, disclosure)
- `brief-strategy.md` ✓ — product strategy + moat argument
- `brief-firecrawl-addendum.md` ✓ — parallel scraping, footer/heading extraction
- `brief-vendor-graph.md` ✓ — capability abstraction, vendor graph, distributor routing, 5-factor scoring, explainability schema
- `brief-ingram.md` — written, NOT YET COMMITTED to docs/

### vendors.js (~/Projects/proof360/api/src/config/vendors.js)
Full catalog with distributor routing. Categories:
- GRC & compliance automation: vanta, vanta_msp, drata, secureframe, apollo_secure, trustwave, docusign
- Founder trust: reachlx (NEW — closes `founder_trust` gap, free 10-question teaser + paid 95-question full profile)
- AI governance: cognitiveview (closes ai_governance, ai_risk, ai_compliance)
- Identity & IAM: okta, cisco_duo, microsoft, rsa, keeper, jamf
- Network security: cloudflare, fortinet, palo_alto, sonicwall, juniper
- Endpoint protection: crowdstrike, trellix, trendmicro, sophos
- Data resilience: veeam, cohesity, netapp, nutanix, veritas
- Security operations: opentext, proofpoint, blancco
- Cyber insurance: austbrokers

### gaps.js (~/Projects/proof360/api/src/config/gaps.js)
- `founder_trust` gap added (NEW) — severity: high, category: human
- Triggers when `founder_profile_completed !== true` — fires for every founder by default
- Note: `founder_profile_completed` field needs to be added to context-normalizer.js

### Frontend
- React/Vite, live at proof360.au
- Animated SVG logo (teal, three-node triangle in progress ring) — approved, not yet wired into header
- Founder trust gap card mockup designed — shows ReachLX 10-question teaser as CTA, upsell to full 95-question profile
- Deal room founder trust panel mockup designed — shows full profile data for investor view

### Vendor graph
- Architecture complete. Capability-first model: capability tiles → vendor resolution → distributor routing (Dicker AU / Ingram global)
- `brief-vendor-graph.md` defines: 5 capability tiles, vendor-to-capability mappings, distributor routing rules, 5-factor scoring algorithm, explainability schema per gap
- Backend owns all vendor resolution logic. Frontend is a pure renderer.

### Key partnerships (personal relationships — not just catalog entries)
- ReachLX: Paul Findlay (mate, ex-coach). Lunch scheduled. Customisation conversation: 10-question investor-framed version of REACH survey as free teaser in Proof360 report.
- CognitiveView: Dilip Mohapatra (CEO, known). Conversation pending. AI governance gap — closes `ai_governance` for AI-product founders.

## The founder trust USP
Proof360 is the only trust assessment that includes the founder in the trust picture. Every other tool assesses the stack. Proof360 assesses the person running it. This surfaces in the report as a `founder_trust` gap card with a ReachLX 10-question teaser, and in the deal room as a structured leadership profile visible to investors. Nobody else has this.

## Next actions (in order)
1. JP commits `brief-ingram.md` to `docs/` — unblocks Ingram wiring
2. Kiro builds vendor graph engine + distributor logic from `brief-vendor-graph.md` + `brief-ingram.md`
3. Claude Code builds capability tile UI + "Why this pick?" explainability panel
4. JP has lunch with Paul Findlay (ReachLX) — agree on 10-question investor-framed teaser design
5. Add `founder_profile_completed` field to `context-normalizer.js` (Kiro)
6. Build founder trust gap card in frontend (Claude Code) — mockup complete, ready to build
7. Resend email integration (Kiro / Claude Code)
8. Slack lead alerts (Kiro / Claude Code)
9. Wire animated SVG logo into frontend header (Claude Code)

## Blockers
- `brief-ingram.md` not committed — blocks Ingram wiring
- Ingram MCP real token pending (mock in place)
- ReachLX 10-question design not yet agreed (lunch pending)
