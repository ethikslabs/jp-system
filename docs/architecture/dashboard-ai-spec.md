# Dashboard AI Spec
> Founder SIEM — AI-generated views through bounded component library

**Status:** Canonical — do not change without John explicitly confirming  
**Version:** 1.0

---

## The model

The dashboard has one job: apply a lens to a pulse stream and show what matters.

Claude does not generate HTML. Claude does not invent UI. Claude picks and configures components from a pre-built library and returns a layout spec. The dashboard renderer assembles that spec. The renderer never makes layout decisions.

```
Pulse stream + Lens context
        ↓
    Claude API
        ↓
  Layout spec (JSON)
        ↓
  Dashboard renderer
        ↓
  Assembled dashboard
```

This keeps the UI bounded, consistent, and sane — while giving Claude full latitude to decide what matters for each audience.

---

## The heart — primary UI element

The heart is the centrepiece of every dashboard view. It is never hidden, never replaced by a component.

```
[ Heart — beating at current BPM ]
[ Max BPM number pulsing inside ]
[ Zone indicator — colour coded 1–5 ]
```

**Zone colours:**
- Zone 1 — cool blue (resting)
- Zone 2 — teal (active)
- Zone 3 — amber (elevated)
- Zone 4 — orange (high intensity)
- Zone 5 — red (critical / max)

The heart beats at the actual current BPM. Zone 5 it hammers. Zone 1 it is slow and steady. Flatline means something is dead.

The founder's max BPM number pulses inside the heart. Current BPM visible beneath it or overlaid. The gap between the two is the read.

---

## Component library

Claude selects from this list only. It does not invent new components.

| Component | What it shows |
|---|---|
| `MetricCard` | Single number with label and trend indicator (up/down/flat) |
| `StatusGrid` | Traffic light array — multiple entities, one health colour each |
| `AlertFeed` | Chronological pulse list, filtered by severity, with source and timestamp |
| `HealthBar` | Progress bar with zone threshold markers — good for scores, percentages |
| `ActivitySparkline` | Lightweight time series — pulse count over last N hours/days |
| `PeopleCard` | Person + lifecycle state + last activity + tags |
| `GapCard` | Trust gap with severity + vendor CTA (inherits Proof360 gap card pattern) |
| `LifecycleBoard` | Kanban columns by project lifecycle state |
| `BPMChart` | BPM over time — shows rhythm, spikes, resting baseline |
| `SecretRotation` | Secrets registry with rotation status and days-until-expiry |
| `CostTracker` | API spend per project — Firecrawl, Claude, AWS, etc. |
| `PipelineMetric` | Funnel metric — sessions, completions, drop-off rate |

New components require explicit addition to this list. Claude cannot reference a component not in the library.

---

## Lens model

A lens is an audience context that tells Claude how to interpret the pulse stream.

```yaml
lens:
  id: string                  # founder | ciso | investor | board | custom
  label: string               # display name
  prompt_context: string      # what this audience cares about
  severity_weights: json      # which severity levels to emphasise
  source_weights: json        # which pulse sources to prioritise
  max_components: integer     # how many components Claude may place
```

### Built-in lenses

| Lens | What it prioritises |
|---|---|
| `founder` | Everything. Full system read. BPM + all zones visible. |
| `ciso` | Security pulses — secrets, vulnerabilities, access events, SSL. Zone 4–5 only. |
| `investor` | Revenue, pipeline, trust scores, lifecycle state. Calm framing. |
| `board` | High-level health, cost, lifecycle, key people. Zone 3+ only. |
| `custom` | Founder defines the prompt context and weights at setup. |

Same pulse stream. Different read. Different meaning.

---

## Layout spec — what Claude returns

Claude returns a JSON layout spec. The renderer assembles it. No HTML, no styling, no invented components.

```json
{
  "lens": "investor",
  "bpm_zone": 3,
  "summary": "Build velocity is elevated this week. Trust score stable. Two new HubSpot contacts.",
  "layout": [
    {
      "component": "MetricCard",
      "title": "Trust Score",
      "signal": "proof360.score.latest",
      "trend": "up"
    },
    {
      "component": "StatusGrid",
      "title": "Project Health",
      "filter": { "entity_type": "project" }
    },
    {
      "component": "PipelineMetric",
      "title": "Assessment Funnel",
      "filter": { "source": "proof360" }
    },
    {
      "component": "PeopleCard",
      "title": "Recent Contacts",
      "filter": { "source": "hubspot", "limit": 3 }
    }
  ]
}
```

### Layout spec rules

- Claude may place a maximum of `lens.max_components` components
- Every component must exist in the component library
- `filter` fields map directly to pulse schema fields — no invented query syntax
- `summary` is a single plain-language sentence — not a paragraph, not bullet points
- Claude does not set colours, sizes, or layout positions — the renderer handles that

---

## Claude prompt contract

When the dashboard requests a layout spec, it sends:

```json
{
  "lens": { ...lens definition... },
  "recent_pulses": [ ...last N pulses, canonical schema... ],
  "current_bpm": 47,
  "bpm_zone": 3,
  "system_baseline_bpm": 32,
  "available_components": [ ...component library list... ]
}
```

Claude returns the layout spec JSON only. No preamble, no explanation, no markdown. Pure JSON.

System prompt to Claude:

> You are a dashboard layout engine. You receive a pulse stream and a lens definition. You return a JSON layout spec selecting components from the provided library. You never invent new components. You never return HTML. You never return prose. The summary field is one sentence maximum. Select components that matter most for this lens and audience. Return valid JSON only.

---

## Onboarding sequence

1. Dashboard loads for first time
2. Prompt: **"What is your max heart rate?"** — founder enters a number
3. Max BPM stored, zones calibrated
4. Default lens: `founder`
5. Heart begins beating at current BPM
6. First layout spec requested from Claude using `founder` lens

---

*Defined: 2026-03-18*  
*Owner: John Coates — do not change without explicit confirmation*
