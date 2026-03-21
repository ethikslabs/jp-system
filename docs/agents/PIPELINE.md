# PIPELINE.md — Full Build Pipeline
Version 2.0 — March 2026

This is the master process document. It defines who does what, when, and how handoffs work across every phase of building at EthiksLabs.

The strict convergence loop mechanics used in Phase 0 and Phase 1 live in `PROTOCOL.md` (locked).

---

## Core Pattern

Every phase uses a convergence loop. Two agents go back and forth until the output converges, or the iteration cap is hit. The agents change. The pattern does not.

```
Two agents back and forth → converge → John approves → next phase
```

**Iteration cap:** 10 per phase. If not converged by iteration 10, John decides: approve current state, reset with tighter scope, or escalate.

---

## Roles

| Role | Tool | Function |
|---|---|---|
| Operator | John (Human) | Sets agenda. Watches. Steers. Approves transitions. |
| Strategist A | Claude (chat) | Refinement, framing, architecture pressure-test |
| Strategist B | ChatGPT | Architecture, challenge, independent position |
| Planner | Kiro | Spec production, task decomposition |
| Builder | Codex | Spec pressure-test, implementation support |
| Engineer | Claude Code | Production code from converged specs |
| Reviewer | Codex + Claude + ChatGPT | Post-build review pool |

---

## Phase 0 — Design Convergence

**Agents:** Claude Chat ↔ ChatGPT
**Initiator:** Either agent. John sets the agenda and one agent opens.
**Protocol:** `PROTOCOL.md` (strict loop format — non-negotiable)
**Cap:** 10 iterations

**What happens:**
- John defines the agenda: intent, scope, constraints
- Agents go back and forth — one enhancement per round, strict format
- Each round must modify the design, not restate it
- Convergence: both agents declare "Feels recursive" in the same round, or cap is hit
- John watches and can steer at any point

**Converged output:**
- Stable design state
- Goals, architecture skeleton, key decisions with rationale
- Ready for Kiro

**Transition trigger:** John approves → hands to Kiro for Phase 1.

---

## Phase 1 — Design Artifact

**Agents:** Kiro (produces) ↔ Claude + ChatGPT (review)
**Cap:** 10 iterations

**What happens:**
- Claude writes a brief for Kiro based on the converged Phase 0 output
- Kiro produces design artifact (`docs/brief-[feature].md`)
- Claude + ChatGPT review against north star and existing architecture
- Kiro refines in response
- Repeat until sign-off

**Converged output:**
- `docs/brief-[feature].md` committed to repo

**Transition trigger:** John approves → Phase 2.

---

## Phase 2 — Requirements

**Agents:** Kiro (produces) ↔ Claude + ChatGPT (review)
**Cap:** 10 iterations

Same loop as Phase 1. Kiro produces requirements document from the design artifact. Claude + ChatGPT review. Sign-off.

**Converged output:**
- `docs/requirements-[feature].md` committed to repo

**Transition trigger:** John approves → Phase 3.

---

## Phase 3 — Task Negotiation

**Agents:** Claude Code ↔ Codex
**No code written in this phase.**
**Cap:** 10 iterations

**What happens:**
- Claude Code reads requirements
- Proposes task list: order, dependencies, acceptance criteria
- Codex reviews for execution risk, missing validation, wrong assumptions
- Both negotiate until task list is stable
- John reviews and confirms

**Converged output:**
- `docs/tasks-[feature].md` committed to repo

**Transition trigger:** John approves task list → Phase 4.

---

## Phase 4 — Build

**Agent:** Claude Code (leads), Codex (supports)
**Cap:** No iteration cap — builds until done

**What happens:**
- Claude Code reads `EXECUTION_STATE.md`, task list, and brief
- Claims tasks, implements, runs verification, commits
- Updates `EXECUTION_STATE.md` after each task
- Codex supports on backend, edge cases, review
- Screenshots routed to Claude + ChatGPT periodically to verify alignment
- Build order: `config → database → queue → services → routes → workers → retrieval → reasoning → query interface`
- Surfaces blockers rather than guessing

**Constraint:** Claude Code does not make architectural decisions. Ambiguity goes back to John.

**Completion trigger:** All tasks done, build verified → Phase 5.

---

## Phase 5 — Founder Sign-off

**Agents:** ChatGPT + Claude (as co-founders, not implementers)
**Cap:** 10 iterations

**What happens:**
- Build presented back to Claude + ChatGPT
- Does this match the original intent from Phase 0?
- Does it align with the north star?
- Are there gaps or drift from Phase 1 design?
- Findings consolidated — blocking vs non-blocking
- John makes final call

**Converged output:**
- Review sign-off
- Project lifecycle state updated

**John's decision:**
- Approved → `validated`
- Needs work → back to Phase 4
- Ready to ship → `authorised`

---

## The Full Flow

```
John sets agenda
       ↓
Phase 0: Claude Chat ↔ ChatGPT
         Design convergence (PROTOCOL.md format, max 10)
       ↓
John approves → stable design
       ↓
Phase 1: Kiro produces brief ↔ Claude + ChatGPT review
         (max 10 iterations)
       ↓
John approves → docs/brief-[feature].md
       ↓
Phase 2: Kiro produces requirements ↔ Claude + ChatGPT review
         (max 10 iterations)
       ↓
John approves → docs/requirements-[feature].md
       ↓
Phase 3: Claude Code proposes tasks ↔ Codex reviews
         (max 10 iterations, no code)
       ↓
John approves → docs/tasks-[feature].md
       ↓
Phase 4: Claude Code builds (Codex supports)
         (no cap — builds until done)
       ↓
Phase 5: Claude + ChatGPT sign-off
         (max 10 iterations)
       ↓
John decides → validated / back to Phase 4 / authorised
```

---

## Iteration Tracking

Each phase tracks its own count. Log format:

```
Phase: 0
Iteration: 3/10
Agent: Claude Chat
Output: [one line — what changed this round]
Status: Converging / Diverging / Converged
```

If status is **Diverging** at iteration 5+, John steers before the cap is hit.

---

## Escalation Rules

Any agent escalates to John when:
- A decision exceeds its defined scope
- The loop is diverging rather than converging
- A blocker cannot be resolved within the phase
- The iteration cap is approaching without convergence

Agents do not resolve ambiguity by assumption. They surface it.

---

## State Files

| File | Owner | Purpose |
|---|---|---|
| `docs/PROTOCOL.md` | Locked | Convergence loop mechanics |
| `docs/brief-[feature].md` | Phase 1 output | Design truth |
| `docs/requirements-[feature].md` | Phase 2 output | Requirements |
| `docs/tasks-[feature].md` | Phase 3 output | Task queue |
| `EXECUTION_STATE.md` | Claude Code | Session state, build log |
| `CLAUDE.md` | John | Claude Code session context |
| `personas.md` | John | Cognitive operating system |

Git is the source of truth. State files are coordination layers.

---

## Roles Reference

| Agent | Phases | Role |
|---|---|---|
| ChatGPT | 0, 1, 2, 5 | Architecture, challenge, review |
| Claude | 0, 1, 2, 5 | Refinement, brief writing, review |
| Kiro | 1, 2 | Spec and requirements production |
| Claude Code | 3, 4 | Task negotiation, build lead |
| Codex | 3, 4, 5 | Task review, build support, sign-off review |
| John | All | Agenda, override, sign-off, lifecycle decisions |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | March 2026 | Initial pipeline — Phase 0–5 |
| 2.0 | March 2026 | Convergence loop pattern formalised across all phases. Roles table added. Iteration tracking format added. Escalation rules added. Absorbed AGENTS_PROTOCOL.md. |
