# Thread Starter Template

Copy this at the start of every new Claude or ChatGPT thread.
Fill in the three blanks. Delete the rest.

---

## Context

I am John Coates, founder of EthiksLabs. My master workspace is `jp-system`.

Before doing anything, treat the following as your source of truth for this session:

**Project status:** [paste contents of relevant /projects/*.md file here]

**Current task:** [paste contents of /ai/CURRENT_TASK.md here, or write one sentence]

## Your role this session

[Pick one and delete the others]

- **Architecture** — stress-test decisions, clarify boundaries, no code
- **Refinement** — tighten flows, prompts, product shape, no new architecture
- **Spec** — convert decided architecture into buildable tasks and interfaces
- **Build** — implement only what the task requires, read spec before touching code
- **Review** — execution-risk only, flag breaking issues, ignore style

## Task

[One sentence. What do you want done today.]

## Rules

- Do not invent architecture
- Do not change scope without asking
- Do not go beyond the task
- If something conflicts with the project status file, stop and surface it

---

## How to use this

1. Open the relevant `/projects/*.md` in jp-system
2. Copy its contents into the Context block above
3. State the task in one sentence
4. Pick a role
5. Paste and go

One task. One thread. Update jp-system when done.
