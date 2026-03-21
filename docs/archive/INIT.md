# /init

When John types `/init`, read these files in order and confirm current state:

1. /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/ai/CURRENT_TASK.md
2. /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/ai/SYSTEM_CONTEXT.md
3. /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/docs/TASKS.md

Then confirm in one short paragraph:
- What the current task is
- What's done and what isn't
- What you need from John to start

Do not re-explain context. Do not summarise what you just read back at length. Just confirm state and ask what's needed.

---

## For Claude chat (this interface)

`/init` works automatically — Claude reads the files above via Filesystem tools and orients itself.

## For Claude Code

Claude Code reads CLAUDE.md automatically on session start. No paste needed.
Just open the repo and start the session — it will read CLAUDE.md and orient itself.

## For ChatGPT

ChatGPT cannot read files directly. Use CHATGPT_HANDOFF.md:
- Open /Users/johncoates/Library/CloudStorage/Dropbox/Projects/jp-system/ai/CHATGPT_HANDOFF.md
- Copy everything between START and END
- Paste into a new ChatGPT thread
- Update the CURRENT TASK section before pasting
