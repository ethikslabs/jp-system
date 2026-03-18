# Pulse Schema
> "We never invent the truth, only interpret it."

**Status:** Canonical — do not change without John explicitly confirming  
**Version:** 1.0

---

## What a pulse is

A pulse is a single immutable fact that something happened in the system.

A pulse is emitted. It cannot be edited or deleted. External factors change the rate or pattern of pulses — a build sprint increases BPM, a quiet weekend lowers it — but each individual pulse is a fixed truth in time.

This is the foundation of the Founder SIEM: raw, unedited signal. The dashboard interprets pulses through a lens. It never modifies them.

---

## Pulse schema

```yaml
pulse:
  id: uuid                          # immutable, generated at emission
  timestamp: ISO8601                # when it happened, not when it was ingested
  source: string                    # stripe | github | auth0 | hubspot | proof360 | system | ...
  type: string                      # event | metric | state | alert
  entity_type: string               # project | user | vendor | system
  entity_id: string                 # the specific entity this pulse relates to
  severity: string                  # info | warning | critical
  payload: json                     # source-specific structured data — extensible, no schema change required
  tags: string[]                    # free-form, queryable, assigned at ingest
  schema_version: string            # "1.0" — enables schema evolution without breaking consumers
```

### Key design decisions

- **`payload` is the extensibility mechanism.** New sources add fields inside payload without requiring a schema change. The envelope stays stable.
- **`source` is a string, not an enum.** New sources register themselves — no schema PR required.
- **`schema_version` enables evolution.** Consumers can handle multiple versions gracefully.
- **`tags` enables grouping and filtering** without needing new top-level fields.
- **Severity is the only interpreted field.** It is assigned by the ingest layer, not the source. This is the one place the system adds a read on top of the raw pulse. All other fields are facts.

---

## Raw vs interpreted pulse

| Layer | What it is | Mutable? |
|---|---|---|
| Raw pulse | What happened, emitted by the source | Never |
| Interpreted pulse | Raw pulse + severity + tags + entity mapping, added at ingest | No — ingest adds once, never changes |

The pulse itself is never touched after emission. The ingest layer adds the interpretation fields exactly once.

---

## BPM — beats per minute

BPM is the aggregate read across pulses over a time window.

```yaml
bpm:
  current: integer          # pulses per minute, rolling window
  baseline: integer         # learned resting rate for this system
  max: integer              # set by the founder at onboarding ("what is your max heart rate?")
  zone: integer             # 1–5, derived from percentage of max
  window_seconds: integer   # window used to calculate current BPM
```

BPM is not stored per pulse. It is computed at read time from the pulse stream.

---

## Heart rate zones

Zones are relative to the system's own max BPM — set by the founder at onboarding. Not a fixed number. Every system has its own ceiling.

| Zone | % of Max | Meaning |
|---|---|---|
| 1 | 0–50% | Resting. Idle, healthy, nothing urgent. |
| 2 | 50–65% | Active. Normal operating rhythm. Build activity, routine events. |
| 3 | 65–75% | Elevated. Something is happening. Worth watching. |
| 4 | 75–90% | High intensity. Multiple systems firing. Needs attention. |
| 5 | 90–100% | Max. Critical state. Something is wrong or a major event is in progress. |

The same BPM means different things in different contexts. A founder in a build sprint expects Zone 4. The same Zone 4 during a quiet maintenance period is an alert.

Over time the system learns the founder's **resting rate** — normal BPM on a quiet day. The gap between resting and current is as important as the zone number itself.

---

## Onboarding — max heart rate

First question the dashboard asks at setup:

> "What is your max heart rate?"

The founder sets a number. This becomes the system ceiling. All zones are calibrated to it. The number pulses inside the heart UI at current BPM — the founder always knows where they are relative to their limit.

---

## Sources (initial)

| Source | What it emits |
|---|---|
| `github` | commits, PRs, deployments, issues |
| `stripe` | payments, subscriptions, failed charges |
| `auth0` | logins, new accounts, access events |
| `hubspot` | new contacts, lifecycle stage changes, deals |
| `proof360` | assessments, trust scores, gap completions |
| `system` | health checks, SSL expiry, PM2 restarts, secret rotation warnings |
| `aws` | EC2 health, SSM events, cost alerts |

New sources added by registering a `source` string and defining their `payload` shape. No schema changes required.

---

*Defined: 2026-03-18*  
*Owner: John Coates — do not change without explicit confirmation*
