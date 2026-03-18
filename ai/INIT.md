# Claude Chat — Session Init

Paste this as the first message in every new Claude chat thread.

---

## Paste this:

```
New thread. Read jp-system to orient:

- /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/ai/SYSTEM_CONTEXT.md
- /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/ai/CURRENT_TASK.md
- /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/projects/proof360.md

Then confirm what the current task is and what you need from me to start.
```

---

## Rules

- One task per thread. When the task is done, update CURRENT_TASK.md before closing.
- Do not re-explain context — it lives in jp-system.
- If jp-system files are stale or missing, say so before proceeding.
- After completing a task, update the relevant /projects/*.md and CURRENT_TASK.md.
- When the task is resolved and John keeps typing, prompt him to start a new thread. Say: "Task is done — start a new thread and /init for the next one."
