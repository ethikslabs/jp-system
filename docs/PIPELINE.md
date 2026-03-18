# PIPELINE.md — Full Build Pipeline

This is a living document. Updates as the process matures.
The convergence protocol that gates Phase 1 lives in `PROTOCOL.md` (locked).

---

## Overview

```
Phase 0 → Design loop converges      (ChatGPT + Claude)
Phase 1 → Design artifact            (Kiro)
Phase 2 → Requirements               (Kiro)
Phase 3 → Task negotiation           (Claude Code + Codex)
Phase 4 → Build                      (Claude Code leads, Codex supports)
Phase 5 → Founder sign-off           (ChatGPT + Claude)
```

---

## Phase 0 — Design Convergence

**Agents:** ChatGPT + Claude
**Protocol:** See `PROTOCOL.md` (strict, locked)
**Output:** Stable design state, ready for Kiro

Trigger: Founder has an idea or a problem to solve.
End state: Both agents declare "Feels recursive" or 10 rounds reached.

---

## Phase 1 — Design

**Agents:** Kiro (spec), Claude + ChatGPT (review)

1. Claude writes a brief for Kiro based on converged design
2. Kiro produces design artifact
3. Claude + ChatGPT review against north star and existing architecture
4. Repeat until sign-off

**Output:** `docs/brief-[feature].md` committed to repo

---

## Phase 2 — Requirements

**Agents:** Kiro (spec), Claude + ChatGPT (review)

Same loop as Phase 1.
Kiro produces requirements document from the design artifact.
Claude + ChatGPT review. Sign-off.

**Output:** `docs/requirements-[feature].md` committed to repo

---

## Phase 3 — Task Negotiation

**Agents:** Claude Code + Codex
**No code written in this phase.**

1. Claude Code reads requirements
2. Proposes task list with order, dependencies, and acceptance criteria
3. Codex reviews for execution risk, missing validation, wrong assumptions
4. Both negotiate until task list is stable
5. Founder reviews and confirms

**Output:** Task list committed to `docs/tasks-[feature].md`

---

## Phase 4 — Build

**Agents:** Claude Code (leads), Codex (supports)

- Claude Code owns UX, frontend, single source of truth
- Codex supports on backend, review, edge cases
- Screenshots routed back to Claude + ChatGPT periodically to verify outcome alignment
- Build order: `config → database → queue → services → routes → workers → retrieval → reasoning → query interface`
- Stop at checkpoints — do not skip steps
- Update `projects/[project].md` at end of each session

**Output:** Working code, committed, deployed

---

## Phase 5 — Founder Sign-off

**Agents:** ChatGPT + Claude (as co-founders, not implementers)

1. Build presented back to ChatGPT + Claude
2. They confirm: does this match the original intent?
3. Does it align with the north star?
4. Are there gaps or drift from Phase 1 design?
5. Founder makes final call

**Output:** Project lifecycle state updated
- Approved → `validated`
- Needs work → back to Phase 4
- Ready to ship → `authorised`

---

## Roles Reference

| Agent | Phase | Role |
|-------|-------|------|
| ChatGPT | 0, 1, 2, 5 | Architecture, stress-test, review |
| Claude | 0, 1, 2, 5 | Refinement, brief writing, review |
| Kiro | 1, 2 | Spec production |
| Claude Code | 3, 4 | Task negotiation, build lead |
| Codex | 3, 4 | Task review, build support |
| Founder | All | Override, sign-off, lifecycle decisions |

---

## Status

| Field | Value |
|---|---|
| Version | v1.0 |
| State | Living — updates as process matures |
| Repo path | `docs/PIPELINE.md` |
| Last updated | 2026-03-19 |
