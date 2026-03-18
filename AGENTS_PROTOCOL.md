# AGENTS_PROTOCOL.md
EthiksLabs — Multi-Agent Development Process
Version 2.0 — March 2026

This project uses convergence loops at every stage. No agent works alone. Every phase is a back-and-forth between two agents until the output converges — or the iteration cap is hit. John watches, steers, and approves the transition to the next phase.

---

## Core Pattern

```
Two agents go back and forth → converge → output passes to next phase
```

This pattern repeats at every stage. The agents change. The pattern does not.

**Iteration cap:** 10 per phase. If not converged by iteration 10, John decides: approve current state, reset with tighter scope, or escalate.

---

## Roles

| Role | Tool | Function |
|---|---|---|
| Operator | John (Human) | Sets agenda. Watches. Steers. Approves transitions. |
| Strategist A | Claude (chat) | Architecture, strategy, refinement |
| Strategist B | ChatGPT | Architecture, strategy, challenge |
| Planner | Kiro | Spec design and task decomposition |
| Builder | Codex | Implementation from specs |
| Engineer | Claude Code | Production code from converged build |
| Reviewer A | Codex | Code review after Claude Code builds |
| Reviewer B | Claude (chat) | Strategy and architecture review |
| Reviewer C | ChatGPT | Independent review pass |

---

## Phase 1 — Strategy Convergence

**Agents:** Claude Chat ↔ ChatGPT
**Initiator:** Either agent. John sets the agenda and one agent opens.
**Cap:** 10 iterations

**What happens:**
- John defines the agenda (intent, scope, constraints)
- One agent produces an opening position — goals, structure, key decisions
- The other agent responds: challenges, gaps, alternatives, refinements
- They iterate toward a converged output
- John watches and can steer at any point

**Converged output:**
- Clear goals
- Architecture skeleton
- Key decisions made with rationale documented
- Ready for Kiro

**Transition trigger:** John approves the converged output → passes to Phase 2.

---

## Phase 2 — Spec Convergence

**Agents:** Kiro ↔ Codex
**Initiator:** Kiro receives converged strategy output from Phase 1
**Cap:** 10 iterations

**What happens:**
- Kiro breaks strategy into tasks and produces initial specs
- Codex reads specs and pushes back: ambiguities, missing detail, implementation conflicts
- Kiro refines specs in response
- They iterate until specs are implementation-ready
- John watches and can steer

**Converged output:**
- `tasks.md` — ordered task list with acceptance criteria
- Per-task specs with enough detail for Claude Code to build without guessing
- No open ambiguities

**Transition trigger:** John approves specs → passes to Phase 3.

---

## Phase 3 — Build

**Agent:** Claude Code
**Input:** Converged specs from Phase 2
**Cap:** No iteration cap — Claude Code works until tasks are done

**What happens:**
- Claude Code reads `EXECUTION_STATE.md`, `tasks.md`, and `docs/` briefs
- Claims tasks, implements, runs verification, commits
- Updates `EXECUTION_STATE.md` after each task
- Surfaces blockers rather than guessing

**Constraint:** Claude Code does not make architectural decisions. Ambiguity goes back to John.

**Completion trigger:** All tasks complete, build verified → passes to Phase 4.

---

## Phase 4 — Review Convergence

**Agents:** Codex + Claude Chat + ChatGPT
**Input:** Built code from Phase 3
**Cap:** 10 iterations across the review pool

**What happens:**
- Codex reviews code: bugs, regressions, architecture violations, performance, security
- Claude Chat reviews: strategy alignment, architecture integrity against original goals
- ChatGPT reviews: independent pass, catches what the others normalise
- Findings consolidated and attached to task IDs
- If refinements needed, loop back to the appropriate phase

**John's role:** Reads consolidated review output. Decides: ship, refine (loop back), or escalate.

**Converged output:**
- Review sign-off from all three agents
- Remaining issues classified as blocking or non-blocking
- Deployment decision sits with John

---

## The Full Flow

```
John sets agenda
       ↓
Phase 1: Claude Chat ↔ ChatGPT
         (strategy convergence, max 10 iterations)
       ↓
John approves → converged goals + architecture
       ↓
Phase 2: Kiro ↔ Codex
         (spec convergence, max 10 iterations)
       ↓
John approves → tasks.md + specs
       ↓
Phase 3: Claude Code builds
         (no cap — builds until done)
       ↓
Phase 4: Codex + Claude Chat + ChatGPT review
         (max 10 iterations)
       ↓
John decides → ship / refine / escalate
```

---

## Iteration Tracking

Each phase tracks its own iteration count. Log format:

```
Phase: 1
Iteration: 3/10
Agent: Claude Chat
Output: [summary of what changed this iteration]
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
| `docs/architecture.md` | Phase 1 output | Strategy truth |
| `tasks.md` | Phase 2 output | Task queue |
| `EXECUTION_STATE.md` | Claude Code | Session state, build log |
| `CLAUDE.md` | John | Claude Code session context |
| `personas.md` | John | Cognitive operating system |
| `infrastructure.md` | John | Stack and infra reference |

Git is the source of truth. State files are coordination layers.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | March 2026 | Initial — linear handoff chain, ChatGPT as one-shot Architect |
| 2.0 | March 2026 | Convergence loop pattern at every phase. 10-iteration cap per phase. Claude Chat + ChatGPT as peer strategists. Kiro ↔ Codex spec loop. Three-agent review pool. |
