# brief-portal.md
## jp-system · EthiksLabs Portal
### Build brief for Claude Code

---

## Overview

Build the jp-system portal — the operational interface for EthiksLabs and the 360 stack. This is a React SPA deployed at `dashboard.ethikslabs.com`. It is not a marketing site. It is mission control.

Two top-level modes:
1. **Dashboard** — status, personas, signals, pipeline
2. **Engine views** — full-screen interfaces into Research360 and Trust360

Auth via Auth0. Role determines default persona. All users can switch manually.

---

## Tech stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Auth**: `@auth0/auth0-react`
- **Styling**: plain CSS with CSS custom properties — no Tailwind, no component libraries
- **Fonts**: DM Mono, Instrument Serif, DM Sans (Google Fonts, loaded in index.html)
- **State**: React context + useState — no Redux
- **API calls**: fetch with Auth0 JWT bearer token
- **Deploy**: Nginx on EC2 `13.237.68.89`, PM2, Cloudflare DNS
- **Repo**: commit completed build to `apps/portal/` in jp-system repo

---

## Design system

### Colour tokens

```css
:root {
  --bg: #0e0e0e;
  --bg2: #151515;
  --bg3: #1c1c1c;
  --bg4: #222;
  --bg5: #282828;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.13);
  --text: #e8e6e0;
  --muted: #6b6b6b;
  --faint: #2a2a2a;
  --accent-e: #c8a96e;   /* Edison */
  --accent-s: #8fb8a0;   /* Sophia */
  --accent-l: #7ba3c4;   /* Leonardo */
  --accent-r: #b08ad4;   /* Research360 engine */
  --accent-t: #c47a7a;   /* Trust360 engine */
  --green: #5a9e6f;
}
```

### Typography

| Use | Font | Size | Weight |
|-----|------|------|--------|
| View titles | Instrument Serif | 24–28px | 400 |
| Card names | Instrument Serif | 18–20px | 400 |
| Body | DM Sans | 13px | 400 |
| Descriptions | DM Sans | 11–12px | 400 |
| Mono / badges / labels | DM Mono | 9–11px | 400–500 |

### Rules
- Dark surface only. No light mode.
- No gradients (except one subtle on Proof360 hero card).
- No drop shadows. Borders: `1px solid var(--border)` or `var(--border2)`.
- Border radius: 10px cards, 6–8px smaller elements.
- Hover: `background: var(--bg3)`, `border-color: var(--border2)`, `transform: translateY(-1px)` on platform cards.
- Transitions: `all 0.2s ease`.
- Scrollbars: 4px wide, `var(--faint)` thumb, transparent track.

---

## Component structure

```
src/
  components/
    TopBar/
    LeftNav/
    RightPanel/
    PersonaSwitcher/
    dashboard/
      PlatformGrid/
      PlatformCard/
      EngineEntryRow/
      PipelineStrip/
      views/
        EdisonView/
        SophiaView/
        LeonardoView/
    engines/
      Research360/
        CorpusBrowser/
        DocList/
        QueryPanel/
      Trust360/
        ConfigPanel/
        FlowPanel/
        FlowStep/
  contexts/
    PersonaContext.jsx
  hooks/
    useApi.js
  pages/
    Dashboard.jsx
    EngineView.jsx
  App.jsx
  main.jsx
```

---

## Top bar

Always visible. Height 46px. `border-bottom: 1px solid var(--border)`.

**Left**: `jp-system · ethikslabs` in DM Mono 11px muted. In engine mode, prepend `← dashboard` back button (DM Mono 10px, small outlined button).

**Centre (dashboard mode)**: Persona switcher — three buttons: Edison · Sophia · Leonardo. Each has a 6px coloured dot. Active: tinted background matching persona accent.

**Centre (engine mode)**: Engine tabs — Research360 (dot `--accent-r`) · Trust360 (dot `--accent-t`). Same button treatment.

**Right**: 5px pulsing green dot + `21 Mar 2026 · Coledale` in DM Mono 10px muted. Pulse: opacity 1→0.35→1, scale 1→0.75→1, 2s ease-in-out infinite.

---

## Dashboard screen

Layout: `220px left nav | 1fr main | 260px right panel`. Full viewport height minus top bar.

### Left nav

Sections labelled in DM Mono 9px uppercase muted. Nav items 36px tall. Active: `border-left: 2px solid var(--accent-e)`, `background: rgba(200,169,110,0.04)`.

Items:
- **Stack**: Proof360 `[primary]`, Research360, Voice360, Fund360, Raise360, Ethiks360, Civique
- **Engines**: Research360 engine (→ engine view), Trust360 engine (→ engine view)
- **System**: Pipeline · PIPELINE.md, Kiro queue `[3]`, Convergence loop
- **Relationships**: Ingram ANZ `[↗]`, ReachLX · Paul, Partners

Badges: DM Mono 9px. `primary` and `↗` and `3` use `--accent-e` tint. Blocker badges use `--accent-t` tint.

### Main — persona views

One active at a time. Switched by top bar persona switcher.

---

#### Edison view (default)

Eyebrow: `Edison · operational` (`--accent-e`, DM Mono 9px uppercase)
Title: `What's actually shipping.` (Instrument Serif 26px)
Subtitle: `Build velocity, pipeline state, blockers. The unvarnished read.` (DM Sans 13px muted)

**Platform grid**: 3-column, gap 10px.

**Proof360 hero card** (spans full width):
- `grid-column: 1 / -1`
- Background: `linear-gradient(135deg, var(--bg2), rgba(200,169,110,0.04))`
- Border: `rgba(200,169,110,0.18)`
- Top accent bar always visible (not just hover): `background: var(--accent-e); height: 2px`
- Two columns inside: left = eyebrow + name + desc + status, right = Ingram badge
- Ingram badge: pill `INGRAM ANZ MD` in DM Mono 9px `--accent-e` tint, sub-label `Scarcity strategy active` muted 10px

**Other platform cards** (2 per row after Proof360):

| Card | Eyebrow | Name | Description | Status |
|------|---------|------|-------------|--------|
| Research360 | Knowledge layer | Research360 | pgvector, BullMQ, Unstructured.io. Running locally end-to-end. | Deploy pending (amber pulse) |
| Voice360 | Voice layer | Voice360 | Softswitch architecture. WebSocket, AudioWorklet, Cartesia. Brief docs locked. | Brief → Kiro (blue-grey) |
| Fund360 | Hypothesis engine | Fund360 | ASX announcements. pgvector + TimescaleDB. Analyst personas locked. Paper trading only. | Architecture locked (blue-grey) |
| Raise360 | Capital layer | Raise360 | SAFEs, pre-seed → Series A. Tokenisation internal only. No AFSL exposure. | Scoped · not started (muted) |
| Ethiks360 | Platform · via Ethiks361 | Ethiks360 | Sarvesh (CTO), Val (COO). Staged through Ethiks361 pre-sandbox. | Staged (muted) |

Status row: 5px dot (colour matches text) + status text in DM Mono 10px.

**Engine entry row**: Two cards side by side below platform grid.
- Left: Research360 engine — eyebrow `Engine` in `--accent-r`, name `Research360`, desc `Corpus browser · semantic query · six-layer architecture`, `→` arrow right-aligned
- Right: Trust360 engine — eyebrow `Engine` in `--accent-t`, name `Trust360`, desc `Live report generation · step-by-step · gap analysis`
- Arrow shifts `translateX(3px)` on hover. Click navigates to engine view.

**Pipeline strip**: Full-width card. Label `Pipeline · PIPELINE.md · convergence max 10 rounds`. Five phase nodes in a row on a horizontal line.

Phase nodes (26px circles, positioned above the line with z-index):
- Phase 0: done — `border-color: rgba(90,158,111,0.5)`, `background: rgba(90,158,111,0.1)`, `color: var(--green)`
- Phase 1–2: current — `border-color: var(--accent-e)`, tint bg, `box-shadow: 0 0 12px rgba(200,169,110,0.25)`
- Phases 3–5: pending — muted

Labels below each node: 2 lines, 10px DM Sans muted, centred.

---

#### Sophia view

Eyebrow: `Sophia · narrative` (`--accent-s`)
Title: `The story so far.`
Subtitle: `What's being built, why it matters, and where the momentum is.`

Four stacked narrative cards. Each: eyebrow (DM Mono 9px `--accent-s` uppercase), headline (Instrument Serif 17px), body (DM Sans 12px muted 1.65 line-height). Hover: `border-color: rgba(143,184,160,0.2)`.

1. **Primary · in market** | Proof360 is live — and Ingram's ANZ MD wants a meeting. | A trust intelligence report every founder needs before their first enterprise deal. Live, generating interest. Scarcity deliberate. We're not chasing Ingram — they came to us.
2. **The bigger picture** | Six platforms. One thesis: trust is the operating system for company growth. | Research360 is the knowledge layer. Voice360 is the interface. Fund360 validates the AI analyst model. Raise360 connects founders to capital. Ethiks360 is the platform that ties it together — Sarvesh (CTO) and Val (COO) run it.
3. **Needs your attention** | Ethiks360 is staged and waiting. Ethiks361 is the proving ground. | Before anything escalates to Ethiks360, it runs through Ethiks361 — a pre-staging sandbox. By design. When you're ready to engage, the architecture will be solid enough to hand over cleanly.
4. **Upcoming** | Lunch with Paul Findlay — ReachLX. Designing the investor teaser. | The REACH Leading Profile surfaces in every Proof360 report with a founder_trust gap. Paul and John are designing the investor-framed version together. EthiksLabs dogfoods what it recommends.

---

#### Leonardo view

Eyebrow: `Leonardo · macro` (`--accent-l`)
Title: `The strategic position.`
Subtitle: `Where EthiksLabs sits. What the thesis is. Where this goes.`

2×2 metric grid + one full-width thesis card below.

Metric cards: large number (Instrument Serif ~38px), descriptor (DM Sans 11px muted), trend line (DM Mono 10px `--accent-l`).

| Number | Label | Trend |
|--------|-------|-------|
| 6 | Platforms in the 360 stack | ↗ Trust · Research · Voice · Fund · Raise · Ethiks |
| ANZ | Ingram MD engagement — inbound | Scarcity strategy · not chasing |
| 5 | Active strategic partnerships | AWS · Microsoft · Cloudflare · Vanta · Cisco |
| WL | White-label licensing thesis | Proof360 → partner portals → Ingram channel |

Full-width thesis card: quote in Instrument Serif 20px: `The moat is the dataset, not the UI.` Body below in DM Sans 12px muted (max-width 600px): The gap schema (why → risk → control → closure → vendors) and the signals object must be treated as sacred from session one. Every Proof360 report adds a structured, comparable record to the corpus. That's what makes the trust score meaningful rather than just computed — and what no competitor can clone in 3 months.

---

### Right panel (always visible in dashboard)

Fixed 260px. Three sections, 20px gap.

**Signals**: Four items. Each: 26px icon square (`var(--bg4)` bg, `var(--border)` border), title (12px), meta (DM Mono 9px muted).
1. `↗` | Ingram ANZ MD wants a meeting | Proof360 · scarcity active
2. `☕` | Lunch with Paul Findlay · ReachLX | Investor teaser design
3. `!` in `--accent-t` | brief-ingram.md not committed | Blocks Kiro vendor graph build
4. `!` in `--accent-t` | Dashboard deploy pending | Auth0 · Nginx · PM2 · DNS

**Convergence meter**: `var(--bg3)` box, 13px padding. Label `CONVERGENCE LOOP` (DM Mono 9px) + count `3 / 10` in `--accent-e`. 2px progress bar at 30% fill. Sub-label: `Active · Phase 1–2 · Proof360 portal`.

**Personas**: Four rows. Icon square (26px, tinted per persona), name (12px), role (DM Mono 9px muted).
- B — Bob — Meta-cognition · deadlock only (grey)
- L — Leonardo — Macro · investor lens (`--accent-l`)
- E — Edison — Quant · build velocity (`--accent-e`)
- S — Sophia — Narrative · strategic story (`--accent-s`)

---

## Engine views

When engine opens: dashboard unmounts, full-screen engine renders. Top bar shows engine tabs + back button.

### Research360 engine

Layout: `240px | 1fr | 270px`. Full height minus top bar.

#### Left — Corpus browser

Header: eyebrow `Corpus browser` (`--accent-r`), title `Six-layer architecture` (Instrument Serif 15px).

Six layers. Each item: L-number badge (DM Mono 8px, `--accent-r` tint), name, doc count right, 1-line description, 2px fill bar. Active: `border-left: 2px solid var(--accent-r)`, tint bg.

| L# | Name | Count | Description |
|----|------|-------|-------------|
| L1 | Core corpus | 1,240 | Frameworks, standards, governance. Static reference. |
| L2 | Customer corpus | 38 | Company-specific docs per session. |
| L3 | Real-time signals | live | Continuous crawl. ASX, ASIC, GitHub, web. |
| L4 | LLM working memory | session | Ephemeral. Claude Sonnet reasoning context per run. |
| L5 | External layer | API | Vanta, GitHub, Xero, HubSpot integrations. |
| L6 | Decision log | 412 | Every gap assessment, vendor pick, closure action. |

L3 bar pulses. L3 count in `--green`. Fill widths: L1=100%, L2=15%, L3=60%, L4=30%, L5=45%, L6=55%.

#### Centre — Document browser

Toolbar: search input (flex 1) + filter chips (Framework · Vendor · Signal). Active chip: `--accent-r` border + tint.

Doc list rows: 26px type icon (DM Mono 8px), doc name (12px), meta row. Selected: `rgba(176,138,212,0.06)` bg.

Documents:
```
SOC 2 Type II — AICPA 2017 | PDF | L1 | framework | 48 chunks · 0.94 density
ISO 27001:2022 Controls Annex A | PDF | L1 | framework | 112 chunks · 0.97 density
Vanta — Product capability map | WEB | L1 | vendor | 22 chunks · 0.88 density
NIST CSF 2.0 — Core Functions | PDF | L1 | framework | 67 chunks · 0.92 density
Ingram Micro AU — Catalog snapshot | API | L5 | signal | Live · updated 4h ago
ASIC — Disclosure obligations (Aus) | WEB | L3 | signal | Crawl: daily
REACH Leading Profile — ReachLX | API | L5 | vendor | founder_trust gap · teaser integration
Dicker Data AU — Distributor map | API | L5 | signal | Live · updated 2h ago
Privacy Act 1988 — APPs (Aus) | PDF | L1 | framework | 31 chunks · 0.91 density
GitHub — Security advisory feed | WEB | L3 | signal | Crawl: hourly
```

Type chip colours: framework = `--accent-r` tint, vendor = `--accent-s` tint, signal = `--accent-e` tint.

#### Right — Query panel

Header: eyebrow `Corpus query` (`--accent-r`), title `Semantic search`.

Empty state: centred muted text. On run: show `RETRIEVING · embedding-3-large...` (DM Mono, ~900ms), then result cards.

Result card: score value (DM Mono `--accent-r`) + score bar + source (DM Mono 9px muted) + excerpt (11px 85% opacity).

Input row: text input + `↵ Run` button (`--accent-r` tint). Hint below: `Searching L1 · L2 · L5 · embedding-3-large`. Enter key triggers query.

Production endpoint: `POST /api/research/query` with `{ query, layers }`.

Dev mock results:
```js
[
  { score: 0.94, source: 'SOC 2 Type II — L1', text: 'Access control requirements mandate that logical access is restricted to authorized individuals, with periodic access reviews conducted at least annually.' },
  { score: 0.89, source: 'ISO 27001:2022 — L1', text: 'A.9.1.1: An access control policy shall be established, documented and reviewed based on business and information security requirements.' },
  { score: 0.81, source: 'NIST CSF 2.0 — L1', text: 'PR.AC-1: Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes.' },
]
```

---

### Trust360 engine

Layout: `270px | 1fr`.

#### Left — Config panel

Header: eyebrow `Trust360 · engine` (`--accent-t`), title `Configure assessment`.

Scrollable form body:
- Company name: text input, default `EthiksLabs`
- Website / deck URL: text input
- Stage: select (Pre-seed · Seed · **Series A** · Series B+)
- Industry: select (SaaS / B2B · **AI / ML** · Fintech · Healthtech)
- Signal sources: toggle list

Toggle style: 28×15px pill. Off: `var(--bg5)`. On: `var(--accent-t)`. Thumb: 11px circle, `left: 1px` off → `left: 14px` on. Transition 0.2s.

Defaults: Web presence ON, GitHub ON, ASIC ON, Vanta OFF, Xero OFF.

Run button (fixed at bottom, outside scroll area): `▶ Run assessment`. `--accent-t` tint bg + border. DM Mono 11px. Disabled while running (0.5 opacity, pointer-events none).

#### Right — Flow panel

Header: `Report generation flow` (Instrument Serif 16px) + company tag pill (DM Mono 10px `--accent-t` tint, updates live from company name input).

Six flow steps with vertical connecting line on left. Line colour: done = `rgba(196,122,122,0.15)`, pending = `var(--border)`.

Step node states:
- **Pending**: `border: 1px solid var(--border2)`, `background: var(--bg3)`, muted number
- **Running**: `border-color: var(--accent-t)`, tint bg, glow animation 1.8s ease-in-out infinite (`box-shadow: 0 0 12px–22px rgba(196,122,122,0.2–0.5)`)
- **Done**: faded `--accent-t` border + tint bg, coloured number

Output cards: visible only when step is running or done.

**Steps and timing** (delays from run button press):

| Step | Delay | Title | Output |
|------|-------|-------|--------|
| 1 | 0ms | Signal ingestion | Web: proof360.au + ethikslabs.com ✓, GitHub: 14 repos · active 2d ago ✓, ASIC: Registered · ACN confirmed ✓, Signals: 47 normalised |
| 2 | 1100ms | Corpus retrieval | Source chips: SOC 2 · ISO 27001 · NIST CSF · ASIC · Vanta · REACH, Chunks: 183, Avg similarity: 0.847 |
| 3 | 2200ms | Gap analysis | SOC 2 not started (critical), Privacy policy missing (critical), DORA partial (medium), Founder trust assessed (medium), GitHub security present (low) |
| 4 | 3400ms | Vendor resolution | Vanta 0.91 → Ingram AU, Didomi 0.84 → direct, REACH Profile → teaser (warn), 8 vendors across 5 gaps |
| 5 | 4700ms | Trust score computation | Overall: 61/100 (warn), Security: 58 (warn), Governance: 44 (bad), Operational: 79 (good), Founder trust: 68 (warn) |
| 6 | 6100ms | Report rendered | ID: PR-2026-0321-001, L6: written ✓, Email gate: pending capture (warn), Status: ready ✓ |

Step 6 completes (running → done) 1400ms after it starts. Button re-enables.

Value colours: ≥75 → `--green`, 50–74 → `--accent-e`, <50 → `--accent-t`. Source chips use `--accent-r` tint (Research360 corpus origin).

Production endpoint: `POST /api/trust/run` with `{ company, url, stage, industry, signals }`.

---

## Auth0

```env
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_API_URL=http://localhost:3000
```

Role → default persona (from `user.app_metadata.role`):
- `founder` → Edison
- `cto` → Edison (Sarvesh)
- `coo` → Sophia (Val)
- `partner` → Sophia
- `investor` → Leonardo
- default → Edison

All routes protected. Unauthenticated → Auth0 login redirect. JWT attached to all API calls as `Authorization: Bearer <token>`.

---

## Deployment

1. `npm run build` → `dist/`
2. Nginx serves `dist/` as static. SPA fallback: `try_files $uri /index.html`.
3. Cloudflare DNS: A record `dashboard.ethikslabs.com` → `13.237.68.89`
4. SSL via Cloudflare proxy (orange cloud on)
5. PM2 ecosystem file manages both Nginx and Fastify API

---

## Acceptance criteria

- [ ] Auth0 login/logout works. Unauthenticated → redirect.
- [ ] Role-based default persona on login.
- [ ] Persona switcher changes view with no flash.
- [ ] All three persona views render correctly (Edison · Sophia · Leonardo).
- [ ] Platform cards: hover lift + colour top border.
- [ ] Proof360 hero card spans full width with accent bar always visible.
- [ ] Engine entry cards navigate to engine full-screen.
- [ ] Back button returns to dashboard. Top bar swaps correctly.
- [ ] Research360: layer selection highlights correctly.
- [ ] Research360: query shows loading state then results.
- [ ] Research360: filter chips toggle filtering.
- [ ] Trust360: run button triggers step sequence.
- [ ] Trust360: steps activate/complete in correct order and timing.
- [ ] Trust360: company name field updates header tag live.
- [ ] Pipeline strip phase nodes show correct states.
- [ ] Right panel signals, convergence meter, persona list render.
- [ ] Deployed to `dashboard.ethikslabs.com`. Auth0 callback URL set.
- [ ] JWT auth working on protected API endpoints.
- [ ] PM2 ecosystem file starts and restarts correctly.
- [ ] Committed to `apps/portal/` in jp-system repo.
