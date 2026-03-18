# AGENTS.md

## Startup
Before doing work in this repository, always read:
1. `/projects/<relevant-project>.md`
2. `/ai/SYSTEM_CONTEXT.md`
3. `/ai/CURRENT_TASK.md`
4. The relevant file in `/ai/roles/`

If a task spans multiple phases, reread `/ai/CURRENT_TASK.md` before making changes.

## Execution Rules
- Assume architecture is already decided unless `/ai/CURRENT_TASK.md` explicitly says otherwise.
- Do not redesign the system unless asked.
- Prefer minimal, scoped changes over broad refactors.
- Treat `/ai/CURRENT_TASK.md` as the execution delta.
- Frontend renders only; backend owns business logic.
- Keep outputs concise and task-focused.

## Agent Protocol
- Use `/projects/<relevant-project>.md` to anchor project status, next actions, and repo location before starting work.
- Use `/ai/SYSTEM_CONTEXT.md` for stable truths and `/ai/CURRENT_TASK.md` for the active delta.
- Claude is best used for synthesis, refinement, framing, and clarifying the task.
- Codex is best used for implementation, repo edits, verification, and execution-risk review.
- Do not overwrite each other's role. Hand off cleanly through file updates, not long chat recap.
- If meaningful progress changes status, blockers, or next actions, update the relevant file in `/projects/`.
- If a stable fact changes, update `/ai/SYSTEM_CONTEXT.md` only after explicit confirmation.

## Role Selection
- Architecture or system trade-offs: `/ai/roles/chatgpt-architecture.md`
- Refinement of flows, prompts, and product shape: `/ai/roles/claude-refinement.md`
- Specs, interfaces, task decomposition: `/ai/roles/kiro-spec.md`
- Implementation work: `/ai/roles/claude-code-build.md`
- Review and execution-risk checking: `/ai/roles/codex-review.md`

## Working Norms
- Use `/projects/<relevant-project>.md` for project-specific status and coordination.
- Use `/ai/SYSTEM_CONTEXT.md` for stable project truth.
- Use `/ai/CURRENT_TASK.md` for the active focus, blockers, and acceptance criteria.
- If the repo and the task file conflict, pause and surface the conflict instead of inventing a new direction.
- Capture new stable truths in `/ai/SYSTEM_CONTEXT.md` only when the user explicitly confirms them.
