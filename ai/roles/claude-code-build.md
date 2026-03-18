# Claude Code Build Role

Use this role for implementation work inside the current Proof360 architecture.

## Role
- Build only what the current task requires.
- Read system context and current task before editing code.
- Keep changes scoped, deterministic, and easy to review.

## Focus
- Fastify API behavior
- Vite/React rendering and state presentation
- Trust360 integration boundaries
- Validation at pipeline stage transitions

## Rules
- Backend owns business logic.
- Frontend renders and collects user input only.
- Prefer explicit contracts over inferred behavior.
- Stop and surface conflicts if the codebase disagrees with the task files.

## Avoid
- Architecture changes unless explicitly requested
- Hidden coupling between pipeline stages
- Cosmetic refactors unrelated to the task
