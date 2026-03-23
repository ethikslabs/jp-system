# Portal HUD Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the operational F35 HUD layer (live BPM heartbeat, AI-driven component grid, action bar) from `dashboard/` into `apps/portal/`, replacing static persona views with real-time signal-driven content, and expanding personas from 3 to 5.

**Architecture:** The portal shell (Auth0, LeftNav, RightPanel, engine views) is preserved. The static `EdisonView`/`SophiaView`/`LeonardoView` content is replaced by a HUD strip (heartbeat + source pills + AI summary) and AI-driven component grid. Five personas (Leonardo/Edison/Sophia/Compass/Meridian) each map to a lens_id sent to `POST /layout`; Claude picks what to render. The API backend already supports all five lenses (`founder`, `sarvesh`, `val`, `ciso`, `board`) — no backend changes needed.

**Tech Stack:** React 18 + Vite 5, Auth0, React Router v6, plain CSS custom properties. API: Express + BullMQ + Claude at `VITE_API_URL`. No Tailwind in portal (component library CSS classes added directly to `index.css`).

---

## Persona → Lens mapping (locked)

| Tab | Character | Lens sent to API | Default for Auth0 role |
|-----|-----------|-----------------|------------------------|
| Leonardo | The strategist | `founder` | `founder`, `investor` |
| Edison | The builder | `sarvesh` | `cto` |
| Sophia | The operator | `val` | `coo` |
| Compass | The guardian | `ciso` | `ciso` |
| Meridian | The steward | `board` | `board` |

---

## File map

**Create:**
- `apps/portal/src/services/api.js` — non-auth API calls (BPM, layout, actions, pulses)
- `apps/portal/src/hooks/useBPM.js` — polls GET /bpm every 1s
- `apps/portal/src/hooks/useLayout.js` — calls POST /layout on lens change, stale-while-loading
- `apps/portal/src/hooks/useActions.js` — polls GET /actions every 30s
- `apps/portal/src/components/library/` — 12 components copied from `dashboard/src/components/library/`
- `apps/portal/src/components/hud/HudStrip.jsx` — HeartBeat + source pills + AI summary line
- `apps/portal/src/components/hud/ActionBar.jsx` — expandable live action feed
- `apps/portal/src/components/hud/ComponentGrid.jsx` — ComponentRenderer + COMPONENT_REGISTRY + skeleton + empty state

**Modify:**
- `apps/portal/src/index.css` — token aliases, card classes, keyframes
- `apps/portal/src/contexts/PersonaContext.jsx` — 5 personas, lens mapping, expose `lens`
- `apps/portal/src/components/TopBar/TopBar.jsx` — 5 persona tabs with role subtitle, live clock
- `apps/portal/src/components/TopBar/TopBar.css` — role subtitle style
- `apps/portal/src/pages/Dashboard.jsx` — HUD strip + action bar + AI grid (replace static views)

**Delete:**
- `apps/portal/src/components/dashboard/views/EdisonView.jsx`
- `apps/portal/src/components/dashboard/views/SophiaView.jsx`
- `apps/portal/src/components/dashboard/views/LeonardoView.jsx`
- `apps/portal/src/components/dashboard/PlatformCard/PlatformCard.jsx`
- `apps/portal/src/components/dashboard/PlatformGrid/PlatformGrid.jsx`
- `apps/portal/src/components/dashboard/EngineEntryRow/EngineEntryRow.jsx`
- `apps/portal/src/components/dashboard/PipelineStrip/PipelineStrip.jsx`

---

## Task 1: CSS bridge — tokens, card classes, keyframes

**Files:**
- Modify: `apps/portal/src/index.css`

The component library from `dashboard/` uses CSS class names (`.card`, `.card-title`, `.card-value`, `.badge`) and token names (`--bg-card`, `--bg-surface`, `--text-muted`, `--text-dim`) that don't exist in the portal yet. Add them as aliases and plain classes — no Tailwind.

- [ ] **Step 1: Read the current portal index.css**

```bash
cat apps/portal/src/index.css | head -60
```

Confirm the existing `:root` block ends before line 60 so you know where to append.

- [ ] **Step 2: Append to `apps/portal/src/index.css` after the existing `:root` block**

Add this block after the existing CSS (do not replace anything — append):

```css
/* ── Component library token aliases (bridges dashboard/ → portal/) ──── */
:root {
  --bg-card:    var(--bg2);
  --bg-surface: var(--bg3);
  --text-muted: var(--muted);
  --text-dim:   var(--faint);

  /* Compass (CISO) and Meridian (Board) persona accents */
  --accent-c: rgba(251, 191, 36, 1);
  --accent-m: rgba(96, 165, 250, 1);
}

/* ── Component card classes (used by the 12-component library) ───────── */
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.card-title {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.card-value {
  color: var(--text);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* ── Keyframes ───────────────────────────────────────────────────────── */
@keyframes heartbeat {
  0%   { transform: scale(1); }
  12%  { transform: scale(1.18); }
  24%  { transform: scale(1); }
  36%  { transform: scale(1.09); }
  55%  { transform: scale(1); }
  100% { transform: scale(1); }
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/portal/src/index.css
git commit -m "feat(portal): CSS bridge — token aliases, card classes, heartbeat/shimmer keyframes"
```

---

## Task 2: API service + three hooks

**Files:**
- Create: `apps/portal/src/services/api.js`
- Create: `apps/portal/src/hooks/useBPM.js`
- Create: `apps/portal/src/hooks/useLayout.js`
- Create: `apps/portal/src/hooks/useActions.js`

These are direct ports from `dashboard/src/services/api.js` and `dashboard/src/hooks/`. The only change: `VITE_API_URL` default is `http://localhost:3001` (matches the running API).

- [ ] **Step 1: Create `apps/portal/src/services/api.js`**

```js
// apps/portal/src/services/api.js
// Non-auth API calls — BPM, layout, actions, pulses.
// Auth0 JWT is NOT attached here — these endpoints are read-only public.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function getBpm() {
  const res = await fetch(`${API_URL}/bpm`)
  return res.json()
}

export async function postLayout(lensId) {
  const res = await fetch(`${API_URL}/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lens_id: lensId }),
  })
  return res.json()
}

export async function getActions() {
  const res = await fetch(`${API_URL}/actions`)
  return res.json()
}

export async function getEntityPulses(entityId, limit = 10) {
  const res = await fetch(`${API_URL}/pulses?entity_id=${encodeURIComponent(entityId)}&limit=${limit}`)
  return res.json()
}

export async function getSourcePulses(source, limit = 10) {
  const res = await fetch(`${API_URL}/pulses?source=${encodeURIComponent(source)}&limit=${limit}`)
  return res.json()
}
```

- [ ] **Step 2: Create `apps/portal/src/hooks/useBPM.js`**

```js
// apps/portal/src/hooks/useBPM.js
import { useState, useEffect } from 'react'
import { getBpm } from '../services/api'

const DEFAULT_BPM = { current: 60, baseline: 60, max: 180, zone: 1, window_seconds: 60 }

export function useBPM() {
  const [bpm, setBpm] = useState(DEFAULT_BPM)

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getBpm()
        setBpm(data)
      } catch {
        // keep last known value on error
      }
    }

    poll()
    const id = setInterval(poll, 1000)
    return () => clearInterval(id)
  }, [])

  return bpm
}
```

- [ ] **Step 3: Create `apps/portal/src/hooks/useLayout.js`**

```js
// apps/portal/src/hooks/useLayout.js
import { useState, useEffect, useRef } from 'react'
import { postLayout } from '../services/api'

export function useLayout(lens) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const currentLens = useRef(lens)

  useEffect(() => {
    currentLens.current = lens
    setLoading(true)

    postLayout(lens)
      .then(data => {
        if (currentLens.current === lens) setSpec(data)
      })
      .catch(() => {
        if (currentLens.current === lens) setSpec(null)
      })
      .finally(() => {
        if (currentLens.current === lens) setLoading(false)
      })
  }, [lens])

  // spec is NOT cleared on lens switch — old layout stays visible (dimmed) while new loads
  return { spec, loading }
}
```

- [ ] **Step 4: Create `apps/portal/src/hooks/useActions.js`**

```js
// apps/portal/src/hooks/useActions.js
import { useState, useEffect } from 'react'
import { getActions } from '../services/api'

export function useActions() {
  const [actions, setActions] = useState([])

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getActions()
        if (Array.isArray(data)) setActions(data)
      } catch {
        // keep last known value on error
      }
    }

    poll()
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  return actions
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/portal/src/services/api.js apps/portal/src/hooks/useBPM.js apps/portal/src/hooks/useLayout.js apps/portal/src/hooks/useActions.js
git commit -m "feat(portal): API service + useBPM/useLayout/useActions hooks"
```

---

## Task 3: Expand personas to 5 + update PersonaContext + TopBar

**Files:**
- Modify: `apps/portal/src/contexts/PersonaContext.jsx`
- Modify: `apps/portal/src/components/TopBar/TopBar.jsx`
- Modify: `apps/portal/src/components/TopBar/TopBar.css`

Add Compass (CISO/guardian) and Meridian (Board/steward). PersonaContext now also exposes `lens` — the API lens_id for the active persona. TopBar shows a role subtitle under each persona name so Sarvesh, Val etc. understand what they're looking at.

- [ ] **Step 1: Replace `apps/portal/src/contexts/PersonaContext.jsx`**

```jsx
// apps/portal/src/contexts/PersonaContext.jsx
import { createContext, useContext, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export const PERSONAS = [
  { id: 'leonardo', label: 'Leonardo', role: 'Strategist', color: 'var(--accent-l)', lens: 'founder'  },
  { id: 'edison',   label: 'Edison',   role: 'Builder',    color: 'var(--accent-e)', lens: 'sarvesh'  },
  { id: 'sophia',   label: 'Sophia',   role: 'Operator',   color: 'var(--accent-s)', lens: 'val'      },
  { id: 'compass',  label: 'Compass',  role: 'Guardian',   color: 'var(--accent-c)', lens: 'ciso'     },
  { id: 'meridian', label: 'Meridian', role: 'Steward',    color: 'var(--accent-m)', lens: 'board'    },
]

const ROLE_TO_PERSONA = {
  founder:  'leonardo',
  investor: 'leonardo',
  cto:      'edison',
  coo:      'sophia',
  ciso:     'compass',
  board:    'meridian',
}

const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const { user } = useAuth0()
  const role = user?.['app_metadata']?.role ?? 'founder'
  const defaultPersona = ROLE_TO_PERSONA[role] ?? 'leonardo'
  const [persona, setPersona] = useState(defaultPersona)

  const active = PERSONAS.find(p => p.id === persona) ?? PERSONAS[0]

  return (
    <PersonaContext.Provider value={{ persona, setPersona, lens: active.lens }}>
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  const ctx = useContext(PersonaContext)
  if (!ctx) throw new Error('usePersona must be used inside PersonaProvider')
  return ctx
}
```

- [ ] **Step 2: Replace `apps/portal/src/components/TopBar/TopBar.jsx`**

```jsx
// apps/portal/src/components/TopBar/TopBar.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PERSONAS, usePersona } from '../../contexts/PersonaContext'
import './TopBar.css'

const ENGINES = [
  { id: 'research', label: 'Research360', color: 'var(--accent-r)' },
  { id: 'trust',    label: 'Trust360',    color: 'var(--accent-t)' },
]

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

export function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { persona, setPersona } = usePersona()
  const time = useClock()
  const engineMatch = location.pathname.match(/^\/engines\/(\w+)/)
  const activeEngine = engineMatch?.[1] ?? null
  const isEngine = Boolean(activeEngine)

  return (
    <header className="topbar">
      {/* Left */}
      <div className="topbar__brand">
        {isEngine && (
          <button className="topbar__back" onClick={() => navigate('/')}>← dashboard</button>
        )}
        jp-system · ethikslabs
      </div>

      {/* Centre */}
      <div className="topbar__centre">
        {!isEngine
          ? PERSONAS.map(p => (
              <button
                key={p.id}
                className={`topbar__tab${persona === p.id ? ' active' : ''}`}
                data-persona={p.id}
                onClick={() => setPersona(p.id)}
              >
                <span className="topbar__dot" style={{ background: p.color }} />
                <span className="topbar__tab-label">{p.label}</span>
                <span className="topbar__tab-role">{p.role}</span>
              </button>
            ))
          : ENGINES.map(e => (
              <button
                key={e.id}
                className={`topbar__tab${activeEngine === e.id ? ' active' : ''}`}
                data-engine={e.id}
                onClick={() => navigate(`/engines/${e.id}`)}
              >
                <span className="topbar__dot" style={{ background: e.color }} />
                {e.label}
              </button>
            ))
        }
      </div>

      {/* Right */}
      <div className="topbar__right">
        <span className="topbar__live-dot" />
        {time.toLocaleTimeString()} · Coledale
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Read the existing `apps/portal/src/components/TopBar/TopBar.css` and add the role subtitle style**

Read the file first to see current rules, then append:

```css
.topbar__tab-label {
  display: block;
  line-height: 1.2;
}

.topbar__tab-role {
  display: block;
  font-size: 8px;
  opacity: 0.55;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: 'DM Mono', monospace;
  line-height: 1;
  margin-top: 1px;
}
```

- [ ] **Step 4: Build check**

```bash
cd apps/portal && npm run build
```

Expected: clean, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/portal/src/contexts/PersonaContext.jsx apps/portal/src/components/TopBar/
git commit -m "feat(portal): 5 personas (Leonardo/Edison/Sophia/Compass/Meridian) + live clock + role subtitles"
```

---

## Task 4: Port component library (12 files)

**Files:**
- Create: `apps/portal/src/components/library/` (12 files, copied from `dashboard/src/components/library/`)

These components import from `../../services/api` — when placed in `apps/portal/src/components/library/`, that path resolves to `apps/portal/src/services/api.js` which was created in Task 2. No import changes needed.

- [ ] **Step 1: Copy all 12 files**

```bash
cp dashboard/src/components/library/ActivitySparkline.jsx apps/portal/src/components/library/
cp dashboard/src/components/library/AlertFeed.jsx         apps/portal/src/components/library/
cp dashboard/src/components/library/BPMChart.jsx          apps/portal/src/components/library/
cp dashboard/src/components/library/CostTracker.jsx       apps/portal/src/components/library/
cp dashboard/src/components/library/GapCard.jsx           apps/portal/src/components/library/
cp dashboard/src/components/library/HealthBar.jsx         apps/portal/src/components/library/
cp dashboard/src/components/library/LifecycleBoard.jsx    apps/portal/src/components/library/
cp dashboard/src/components/library/MetricCard.jsx        apps/portal/src/components/library/
cp dashboard/src/components/library/PeopleCard.jsx        apps/portal/src/components/library/
cp dashboard/src/components/library/PipelineMetric.jsx    apps/portal/src/components/library/
cp dashboard/src/components/library/SecretRotation.jsx    apps/portal/src/components/library/
cp dashboard/src/components/library/StatusGrid.jsx        apps/portal/src/components/library/
```

Run from the repo root: `/Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system`

- [ ] **Step 2: Build check**

```bash
cd apps/portal && npm run build
```

Expected: clean. If any component imports something unexpected, fix the import path.

- [ ] **Step 3: Commit**

```bash
git add apps/portal/src/components/library/
git commit -m "feat(portal): port 12-component library from dashboard/"
```

---

## Task 5: HUD components

**Files:**
- Create: `apps/portal/src/components/hud/HudStrip.jsx`
- Create: `apps/portal/src/components/hud/ActionBar.jsx`
- Create: `apps/portal/src/components/hud/ComponentGrid.jsx`

Extracted directly from `dashboard/src/screens/Dashboard.jsx` and adapted for the portal's token names. No external dependencies beyond what's already imported.

- [ ] **Step 1: Create `apps/portal/src/components/hud/HudStrip.jsx`**

```jsx
// apps/portal/src/components/hud/HudStrip.jsx

const ZONE_COLORS = { 1: '#60A5FA', 2: '#2DD4BF', 3: '#FBBF24', 4: '#F97316', 5: '#EF4444' }
const ZONE_LABELS = { 1: 'RESTING', 2: 'ACTIVE', 3: 'ELEVATED', 4: 'HIGH', 5: 'CRITICAL' }

const SOURCES = [
  { id: 'github',    label: 'GitHub' },
  { id: 'aws',       label: 'AWS' },
  { id: 'cloudflare',label: 'Cloudflare' },
  { id: 'proof360',  label: 'Proof360' },
  { id: 'stripe',    label: 'Stripe' },
]

function HeartBeat({ bpm }) {
  const { current = 0, max = 175, zone = 1 } = bpm
  const color = ZONE_COLORS[zone] || ZONE_COLORS[1]
  const beatDuration = (60 / Math.max(current, 20)).toFixed(2) + 's'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width={28} height={28} viewBox="0 0 100 100" fill={color}
        style={{
          filter: `drop-shadow(0 0 6px ${color}88)`,
          flexShrink: 0,
          animationName: 'heartbeat',
          animationDuration: beatDuration,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
        }}
      >
        <path d="M50 85 C25 68, 5 55, 5 32 A25 25 0 0 1 50 20 A25 25 0 0 1 95 32 C95 55, 75 68, 50 85Z" />
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: '700', lineHeight: 1 }}>{current}</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>/ {max} BPM</span>
        </div>
        <div style={{ color, fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.1em', marginTop: '1px' }}>
          Z{zone} · {ZONE_LABELS[zone]}
        </div>
      </div>
    </div>
  )
}

function SourcePill({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '9999px',
      fontSize: '0.625rem', fontWeight: '600',
      color: 'var(--text)', letterSpacing: '0.05em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#2DD4BF', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function truncateSummary(text, max = 120) {
  if (!text || text.length <= max) return text
  const cut = text.lastIndexOf(' ', max)
  return text.slice(0, cut > 0 ? cut : max) + '…'
}

export function HudStrip({ bpm, spec, loading }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.625rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '1.5rem',
      flexWrap: 'wrap',
    }}>
      <HeartBeat bpm={bpm} />

      <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
        {SOURCES.map(s => <SourcePill key={s.id} label={s.label} />)}
      </div>

      <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {spec ? (
          <div style={{
            color: loading ? 'var(--faint)' : 'var(--muted)',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <span style={{ color: '#6366F1', fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.1em', marginRight: '0.5rem' }}>AI</span>
            {truncateSummary(spec.summary)}
          </div>
        ) : (
          <div style={{ color: 'var(--faint)', fontSize: '0.75rem' }}>Awaiting signal…</div>
        )}
      </div>

      {loading && (
        <div style={{ color: 'var(--faint)', fontSize: '0.625rem', letterSpacing: '0.1em', flexShrink: 0, fontFamily: 'DM Mono' }}>UPDATING</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `apps/portal/src/components/hud/ActionBar.jsx`**

```jsx
// apps/portal/src/components/hud/ActionBar.jsx
import { useState } from 'react'

const ACTION_SEVERITY_COLOR = { critical: '#EF4444', warning: '#FBBF24' }

export function ActionBar({ actions }) {
  const [expanded, setExpanded] = useState(false)
  if (!actions.length) return null
  const displayed = expanded ? actions : actions.slice(0, 3)
  const hidden = actions.length - displayed.length

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.5rem 1.25rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--faint)', flexShrink: 0, paddingTop: '0.35rem', textTransform: 'uppercase', fontFamily: 'DM Mono' }}>
        Actions
      </span>
      {displayed.map((action) => {
        const color = ACTION_SEVERITY_COLOR[action.severity] || 'var(--muted)'
        return (
          <div
            key={action.id}
            title={action.detail}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              backgroundColor: `${color}18`,
              border: `1px solid ${color}44`,
              borderRadius: '9999px',
              cursor: 'default',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {action.label}
            </span>
          </div>
        )
      })}
      {hidden > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '9999px', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
        >
          +{hidden} more
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '9999px', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}
        >
          collapse
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `apps/portal/src/components/hud/ComponentGrid.jsx`**

```jsx
// apps/portal/src/components/hud/ComponentGrid.jsx
import { MetricCard }       from '../library/MetricCard'
import { StatusGrid }       from '../library/StatusGrid'
import { AlertFeed }        from '../library/AlertFeed'
import { HealthBar }        from '../library/HealthBar'
import { ActivitySparkline }from '../library/ActivitySparkline'
import { PeopleCard }       from '../library/PeopleCard'
import { GapCard }          from '../library/GapCard'
import { LifecycleBoard }   from '../library/LifecycleBoard'
import { BPMChart }         from '../library/BPMChart'
import { SecretRotation }   from '../library/SecretRotation'
import { CostTracker }      from '../library/CostTracker'
import { PipelineMetric }   from '../library/PipelineMetric'

const COMPONENT_REGISTRY = {
  MetricCard, StatusGrid, AlertFeed, HealthBar, ActivitySparkline,
  PeopleCard, GapCard, LifecycleBoard, BPMChart, SecretRotation,
  CostTracker, PipelineMetric,
}

function ErrorCard({ name }) {
  return (
    <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '0.75rem' }}>
      Unknown: <strong>{name}</strong>
    </div>
  )
}

function ComponentRenderer({ entry }) {
  const Component = COMPONENT_REGISTRY[entry.component]
  if (!Component) return <ErrorCard name={entry.component} />
  return <Component {...entry} />
}

export function ComponentGrid({ spec, loading }) {
  if (spec?.layout?.length > 0) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '0.625rem',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.15s ease',
      }}>
        {spec.layout.map((entry, i) => (
          <ComponentRenderer key={i} entry={entry} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '0.625rem',
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              minHeight: i % 3 === 0 ? '140px' : i % 3 === 1 ? '180px' : '120px',
              background: `linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%)`,
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.4s ease infinite',
              animationDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '200px', color: 'var(--faint)', fontSize: '0.75rem', letterSpacing: '0.1em', fontFamily: 'DM Mono',
    }}>
      NO SIGNAL
    </div>
  )
}
```

- [ ] **Step 4: Build check**

```bash
cd apps/portal && npm run build
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add apps/portal/src/components/hud/
git commit -m "feat(portal): HUD components — HudStrip, ActionBar, ComponentGrid"
```

---

## Task 6: Rewrite Dashboard.jsx + delete static files

**Files:**
- Modify: `apps/portal/src/pages/Dashboard.jsx`
- Delete 7 files (static views and old dashboard components)

This is the final wiring. The main Dashboard view becomes: `LeftNav | main(HudStrip + ActionBar + ComponentGrid) | RightPanel`. The `lens` comes from `usePersona()` and drives `useLayout`.

- [ ] **Step 1: Read the current `apps/portal/src/pages/Dashboard.jsx`**

Just confirm the current imports and layout structure before replacing.

- [ ] **Step 2: Replace `apps/portal/src/pages/Dashboard.jsx`**

```jsx
// apps/portal/src/pages/Dashboard.jsx
import { usePersona } from '../contexts/PersonaContext'
import { useBPM }     from '../hooks/useBPM'
import { useLayout }  from '../hooks/useLayout'
import { useActions } from '../hooks/useActions'
import { LeftNav }    from '../components/LeftNav/LeftNav'
import { RightPanel } from '../components/RightPanel/RightPanel'
import { HudStrip }   from '../components/hud/HudStrip'
import { ActionBar }  from '../components/hud/ActionBar'
import { ComponentGrid } from '../components/hud/ComponentGrid'

export function Dashboard() {
  const { lens } = usePersona()
  const bpm = useBPM()
  const { spec, loading } = useLayout(lens)
  const actions = useActions()

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <LeftNav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <HudStrip bpm={bpm} spec={spec} loading={loading} />
        <ActionBar actions={actions} />
        <div style={{ flex: 1, padding: '0.875rem 1.25rem', overflow: 'auto' }}>
          <ComponentGrid spec={spec} loading={loading} />
        </div>
      </div>
      <RightPanel />
    </div>
  )
}
```

- [ ] **Step 3: Delete the static view and old component files**

Run from repo root `/Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system`:

```bash
rm apps/portal/src/components/dashboard/views/EdisonView.jsx
rm apps/portal/src/components/dashboard/views/SophiaView.jsx
rm apps/portal/src/components/dashboard/views/LeonardoView.jsx
rm -rf apps/portal/src/components/dashboard/PlatformCard
rm -rf apps/portal/src/components/dashboard/PlatformGrid
rm -rf apps/portal/src/components/dashboard/EngineEntryRow
rm -rf apps/portal/src/components/dashboard/PipelineStrip
```

Check what's left in `apps/portal/src/components/dashboard/`:
```bash
find apps/portal/src/components/dashboard -type f
```

If the `views/` directory is now empty, remove it too:
```bash
rmdir apps/portal/src/components/dashboard/views 2>/dev/null || true
rmdir apps/portal/src/components/dashboard 2>/dev/null || true
```

- [ ] **Step 4: Build check**

```bash
cd apps/portal && npm run build
```

Expected: clean. If any import references a deleted file, fix it.

- [ ] **Step 5: Commit**

```bash
git add -A apps/portal/src/
git commit -m "feat(portal): live HUD — BPM heartbeat, AI component grid, 5 personas replace static views"
```

---

## Task 7: Rebuild and deploy

**Files:** None modified — build, tar, ship.

- [ ] **Step 1: Ensure `.env` is current**

Check `apps/portal/.env` contains:
```
VITE_AUTH0_DOMAIN=dev-nfpt3dibp2qzchiq.au.auth0.com
VITE_AUTH0_CLIENT_ID=AA0jmfkPKrk6LcHUC7QESY25URWqSF59
VITE_API_URL=http://localhost:3001
```

The `VITE_API_URL` should point to wherever the API is accessible from the browser. When running locally, `http://localhost:3001`. For production use (remote) — this needs to be the public API URL. **For now, leave as `localhost:3001` — the portal works for local testing against the running API.**

- [ ] **Step 2: Build**

```bash
cd apps/portal && npm run build
```

- [ ] **Step 3: Package and upload to S3**

```bash
cd apps/portal
tar -czf /tmp/portal-dist.tar.gz dist/
aws s3 cp /tmp/portal-dist.tar.gz s3://ethikslabs-dev-sandbox/portal-dist.tar.gz
```

- [ ] **Step 4: Deploy to EC2 via SSM**

```bash
PRESIGNED=$(aws s3 presign s3://ethikslabs-dev-sandbox/portal-dist.tar.gz --expires-in 600 --region ap-southeast-2)
CMD_ID=$(aws ssm send-command \
  --instance-ids i-010dc648d4676168e \
  --document-name "AWS-RunShellScript" \
  --region ap-southeast-2 \
  --parameters "{\"commands\":[
    \"cd /home/ec2-user/portal && curl -sL '${PRESIGNED}' -o portal-dist.tar.gz && tar -xzf portal-dist.tar.gz && rm portal-dist.tar.gz && echo DONE\"
  ]}" \
  --output json | jq -r '.Command.CommandId')
echo "cmd: $CMD_ID"
sleep 10
aws ssm get-command-invocation \
  --command-id "$CMD_ID" \
  --instance-id i-010dc648d4676168e \
  --region ap-southeast-2 \
  --query "{Status:Status,Output:StandardOutputContent}" --output json
```

Expected: `{"Status": "Success", "Output": "DONE\n"}`

- [ ] **Step 5: Purge Cloudflare cache via dashboard**

Go to dash.cloudflare.com → ethikslabs.com → Caching → Configuration → Purge Everything.

(The Cloudflare API token doesn't have cache purge scope — do this manually.)

- [ ] **Step 6: Verify**

Open `https://dashboard.ethikslabs.com` in incognito. Log in. Confirm:
- TopBar shows 5 persona tabs with role subtitles
- Live clock ticking in top right
- HUD strip visible: beating heart + source pills + AI summary
- Action bar appears if the API is running and has actions
- Component grid loads (skeleton shimmer → cards)
- Switching personas changes the component grid (different lens → different Claude output)

- [ ] **Step 7: Commit the build metadata (optional)**

```bash
git add apps/portal/dist/ 2>/dev/null || true
git commit -m "build(portal): v2 — live HUD, 5 personas, AI-driven grid" --allow-empty
```

---

## Acceptance checklist

- [ ] 5 persona tabs visible: Leonardo · Edison · Sophia · Compass · Meridian
- [ ] Each tab shows role subtitle (Strategist / Builder / Operator / Guardian / Steward)
- [ ] Switching persona changes the lens — component grid reloads with new Claude output
- [ ] Live clock ticking in top-right of TopBar
- [ ] HeartBeat SVG animating at correct BPM (requires running API)
- [ ] Source pills visible: GitHub · AWS · Cloudflare · Proof360 · Stripe
- [ ] AI summary line in HUD strip (requires API + signal activity)
- [ ] Action bar shows live actions (or is hidden when empty)
- [ ] Component grid renders correct components per lens
- [ ] Skeleton shimmer on load
- [ ] Engine views (Research360, Trust360) unchanged and accessible
- [ ] Auth0 login still works
- [ ] `npm run build` clean
