# jp-system Dashboard — Frontend Brief
> Build target: v1.0

**Status:** Ready for build  
**Assigned:** Claude Code  
**Depends on:** `pulse-schema.md`, `dashboard-ai-spec.md`, `brief-dashboard-api.md`

---

## What you are building

The frontend for the jp-system Founder SIEM dashboard. React. The beating heart is the product. Everything else assembles around it.

---

## Tech stack

- React (Vite)
- Tailwind CSS
- Framer Motion (heart animation)
- Recharts (BPMChart, ActivitySparkline)
- Fetch API (no additional HTTP client needed)

---

## Application structure

```
src/
  components/
    Heart.jsx               — primary UI, always visible
    lens/
      LensSwitcher.jsx      — lens selector UI
    library/
      MetricCard.jsx
      StatusGrid.jsx
      AlertFeed.jsx
      HealthBar.jsx
      ActivitySparkline.jsx
      PeopleCard.jsx
      GapCard.jsx
      LifecycleBoard.jsx
      BPMChart.jsx
      SecretRotation.jsx
      CostTracker.jsx
      PipelineMetric.jsx
  screens/
    Onboarding.jsx          — max heart rate input
    Dashboard.jsx           — main view
  services/
    api.js                  — all API calls
  hooks/
    useBPM.js               — polls GET /bpm every 1s
    useLayout.js            — fetches layout spec, triggers on lens change
  App.jsx
```

---

## The heart — primary UI element

The heart is never hidden. It occupies the top-centre of every dashboard view.

**Behaviour:**
- Beats at current BPM — animation speed = `60000 / bpm` ms per beat
- Zone colour applied to heart fill and glow:
  - Zone 1 — `#60A5FA` (cool blue)
  - Zone 2 — `#2DD4BF` (teal)
  - Zone 3 — `#FBBF24` (amber)
  - Zone 4 — `#F97316` (orange)
  - Zone 5 — `#EF4444` (red)
- Founder's max BPM number pulses inside the heart (opacity oscillates with beat)
- Current BPM displayed beneath the heart
- Zone label displayed beneath current BPM

**Flatline rule:** The heart never flatlines or goes blank. Empty stream = Zone 1 minimum beat. Flatline is reserved for explicit system death signal (not in v1.0).

**Animation:** Use Framer Motion `animate` with `scale` keyframes. Fast at Zone 5, slow and steady at Zone 1.

---

## Onboarding screen

Shown on first load if `GET /onboarding` returns `{ max_bpm_set: false }`.

```
[ jp-system ]

What is your max heart rate?

[ ________ ]   ← number input

[ Begin ]
```

- Single input, single button
- On submit: `POST /onboarding` with `{ max_bpm: value }`
- On success: transition to Dashboard
- Store nothing client-side — server is the source of truth

---

## Dashboard screen

Layout:

```
[ LensSwitcher ]          ← top bar, lens tabs

[ Heart ]                 ← always centre-top
[ Current BPM ]
[ Zone label ]

[ Dynamic component grid ]  ← assembled from layout spec
```

### Lens switcher

Tabs: Founder | CISO | Investor | Board

On tab change:
1. Set active lens
2. Call `POST /layout` with new `lens_id`
3. Flush current component grid
4. Render new layout spec when response arrives
5. Do not cache layout specs across lens changes

### Dynamic component grid

The layout spec from `POST /layout` drives everything:

```json
{
  "lens": "founder",
  "bpm_zone": 2,
  "summary": "Build velocity is normal. Two new contacts this week.",
  "layout": [
    { "component": "MetricCard", "title": "Trust Score", "signal": "proof360.score.latest", "trend": "up" },
    { "component": "AlertFeed", "title": "Recent Activity", "filter": { "severity": "warning" } }
  ]
}
```

Renderer rules:
1. Read `layout` array from spec
2. For each entry, look up component in the registered library
3. If component not found — show error card, do not substitute or skip silently
4. Render components in order
5. Display `summary` as a single line above the grid

### Component props pattern

Each component receives its spec entry as props:
```jsx
<MetricCard title="Trust Score" signal="proof360.score.latest" trend="up" />
```

Components fetch their own data from the API using the `filter` or `signal` field if needed, or render from pulse data passed down.

---

## BPM polling

`useBPM` hook:
- Polls `GET /bpm` every 1000ms
- Returns `{ current, baseline, max, zone, window_seconds }`
- Heart and zone colour update on every poll

---

## Component library — v1.0 implementations

Build all 12. Placeholder data is fine for sources not yet live.

| Component | Minimum viable v1.0 |
|---|---|
| `MetricCard` | Number, label, up/down/flat trend arrow |
| `StatusGrid` | Grid of coloured dots with labels — green/amber/red |
| `AlertFeed` | Chronological list — source icon, severity badge, timestamp |
| `HealthBar` | Progress bar, zone threshold markers |
| `ActivitySparkline` | Lightweight line chart, last 24h pulse count |
| `PeopleCard` | Name, lifecycle state badge, last activity timestamp |
| `GapCard` | Gap title, severity, vendor name + CTA button |
| `LifecycleBoard` | Three columns: Design / Build / Live — cards per project |
| `BPMChart` | Line chart — BPM over last 60 minutes |
| `SecretRotation` | Table — secret name, status, days until expiry |
| `CostTracker` | Bar chart — spend per source (Claude, Firecrawl, AWS) |
| `PipelineMetric` | Funnel — sessions → completions, drop-off rate |

---

## Pulse simulation (v1.0)

Since real webhooks are post-v1.0, wire the frontend to simulated pulse data from the API. The API generates synthetic pulses across all sources. The frontend treats them as real.

---

## Colour and style

- Background: near-black (`#0A0A0F`)
- Surface: dark card (`#13131A`)
- Text primary: `#F8F8F2`
- Text secondary: `#6B7280`
- Zone colours as defined in Heart section
- Font: Inter or system-ui
- No gradients except heart glow
- Cards: 1px border `#1F1F2E`, 8px border-radius

---

## Deliver

- Complete React app in `dashboard/src/`
- `npm run dev` starts on port 5173
- API base URL: `http://localhost:3001` (env var: `VITE_API_URL`)

---

*Defined: 2026-03-19*  
*Owner: John Coates — do not change without explicit confirmation*
