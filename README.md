# jp-system

`jp-system` is John's master workspace for coordinating projects, AI agents, and execution state across the company.

## AI Execution Model
Agents should read these files in order before doing work:

1. `/projects/<relevant-project>.md` for project status, next actions, and repo location
2. `/ai/SYSTEM_CONTEXT.md` for stable context for the current project focus
3. `/ai/CURRENT_TASK.md` for the current execution delta
4. The relevant role file in `/ai/roles/`

`/projects/*.md` tracks where each project stands.
`SYSTEM_CONTEXT.md` is the durable source of truth for the active project.
`CURRENT_TASK.md` is intentionally short and should change as the work changes.
Role files keep agent behavior consistent without redefining the product each time.

## Agent Protocol
Use this repo as the handoff surface between agents.

- Claude is best used for synthesis, refinement, context shaping, and turning messy intent into a cleaner task.
- Codex is best used for implementation, repo structure, concrete edits, verification, and execution-risk review.
- Both agents should assume the architecture is already decided unless `CURRENT_TASK.md` says otherwise.
- Both agents should prefer minimal, scoped changes and update the relevant project file when meaningful progress changes status or next actions.

Keep this layer lean. It exists to align execution, not to become a framework.
