# Proof360 System Context

## Product
Proof360 is a founder-facing trust assessment workflow that converts messy operating evidence into a structured trust output that can be reviewed by vendors and partners.

## Core Pipeline
`input -> signals -> inference -> corrections -> context -> gaps -> Trust360 -> score -> vendors -> report`

## System Boundary
- Proof360 owns intake, orchestration, correction flow, report assembly, and UI rendering.
- Trust360 is an external reasoning engine. Proof360 prepares structured inputs for it and consumes its outputs.
- Frontend renders state and captures user actions. Backend owns business rules, pipeline control, and integrations.

## Stack
- API: Fastify
- Frontend: Vite + React
- External reasoning: Trust360

## Architectural Rules
- Keep the pipeline deterministic and stage-based.
- Treat each stage output as structured data, not loose prose.
- Validate inputs and outputs at stage boundaries.
- Avoid hidden state and side effects between stages.
- Keep business logic in the backend; do not move it into the frontend.
- Do not redesign the architecture unless the active task explicitly calls for it.
- Prefer minimal, reversible changes that preserve the current pipeline.
