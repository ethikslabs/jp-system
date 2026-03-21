# AGENTS.md
EthiksLabs — Agent Operating Instructions
Version 2.0 — March 2026

This file governs how agents behave inside this repository. Read it at the start of every session.

For the full build pipeline and convergence loop protocol, see `docs/PIPELINE.md`.
For the strict Phase 0 loop mechanics, see `docs/PROTOCOL.md`.

---

## Startup — always do this first

Before any work, read in order:
1. `/projects/<relevant-project>.md` — current status, next actions, repo location
2. `/ai/SYSTEM_CONTEXT.md` — stable context for the current project focus
3. `/ai/CURRENT_TASK.md` — active execution delta, blockers, acceptance criteria
4. The relevant role file from `/ai/roles/`

If the task spans multiple phases, reread `/ai/CURRENT_TASK.md` before each phase.

---

## Role Selection

| Role file | Use when |
|---|---|
| `ai/roles/chatgpt-architecture.md` | Architecture or system trade-offs |
| `ai/roles/claude-refinement.md` | Refining flows, prompts, or product shape |
| `ai/roles/kiro-spec.md` | Writing specs, interfaces, or task decomposition |
| `ai/roles/claude-code-build.md` | Implementation work |
| `ai/roles/codex-review.md` | Review and execution-risk checking |

---

## Execution Rules

- Assume architecture is already decided unless `/ai/CURRENT_TASK.md` explicitly says otherwise.
- Do not redesign the system unless asked.
- Prefer minimal, scoped changes over broad refactors.
- Backend owns all business logic. Frontend renders state and collects input only.
- Each pipeline stage output is structured data — not loose prose.
- Validate at stage boundaries. No hidden state between stages.
- Treat `/ai/CURRENT_TASK.md` as the execution delta.
- Keep outputs concise and task-focused.
- If the codebase and task files conflict, surface the conflict — do not invent a new direction.
- Capture new stable facts in `/ai/SYSTEM_CONTEXT.md` only when John explicitly confirms them.

---

## Handoff Rules

- Use `/projects/<relevant-project>.md` to anchor project status before starting.
- Use `/ai/SYSTEM_CONTEXT.md` for stable truths. Use `/ai/CURRENT_TASK.md` for the active delta.
- Do not overwrite another agent's role. Hand off cleanly through file updates, not long chat recap.
- If meaningful progress changes status, blockers, or next actions — update the relevant `/projects/` file.
- Update `docs/TASKS.md` at the end of any session where meaningful progress was made.

---

## Agent Responsibilities (brief)

**Claude (chat)** — synthesis, refinement, framing, brief writing, review against north star
**ChatGPT** — architecture, challenge, independent review
**Kiro** — spec production, task decomposition, requirements
**Claude Code** — implementation, task negotiation, build lead
**Codex** — execution-risk review, build support, sign-off review
**John** — agenda, override, sign-off, lifecycle decisions

Full protocol for each phase: `docs/PIPELINE.md`

---

## Working Mode

This repo (`jp-system`) is a control layer and execution workspace, not a product application repo. Do not treat it like one unless the current task explicitly says otherwise.

When implementation begins for a specific product, follow that product's architecture and task files rather than inventing a new system here.
