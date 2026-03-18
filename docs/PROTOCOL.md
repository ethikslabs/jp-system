# PROTOCOL.md — Stage 0 Design Loop (v1.1)

## Purpose

This protocol defines a deterministic, self-converging design loop between two agents (ChatGPT and Claude) to reach a stable design state before handing off to Kiro.

The goal is to eliminate drift, overthinking, and premature building.

---

## Loop Format (STRICT)

Each response MUST follow this exact structure:

```
Round: X/10 | Ref: Round Y — [Prior Enhancement Label]

Label: [Title Case 2–4 Words No Punctuation]

Enhancement: [ONE change only]

Type: Constraint | Clarification | Edge Case | Simplification

Why: [ONE line rationale]

Status: Still converging | Feels recursive
```

---

## Rules (NON-NEGOTIABLE)

1. Only ONE enhancement per response
2. No bundling of multiple ideas
3. Rationale must be ONE line only
4. Must declare Type explicitly
5. No freeform text outside this structure
6. Enhancement must MODIFY the protocol — not restate it
7. "Still converging" requires a genuinely novel modification not seen in prior rounds
8. If one agent says "Feels recursive" and the other says "Still converging," the "Still converging" agent must produce a valid novel enhancement or the round counts as recursive

---

## Enhancement Types (DEFINITION)

**Constraint**
→ Tightens rules, reduces ambiguity

**Clarification**
→ Makes implicit logic explicit

**Edge Case**
→ Tests or breaks the protocol

**Simplification**
→ Reduces complexity without losing function

---

## Header Format (STRICT)

```
Round: X/10 | Ref: Round Y — [Enhancement Label]
```

- Label must be Title Case
- Label must be 2–4 words
- Label must contain no punctuation
- Ref must point to the prior round's Label exactly

---

## Convergence Logic

```
IF:
  Both agents return "Status: Feels recursive" in the SAME round

THEN:
  → STOP loop immediately
  → Lock protocol
  → Hand off to Kiro
```

---

## Tie-Break Rule

If one agent declares "Feels recursive" and the other declares "Still converging":
→ The "Still converging" agent MUST produce a novel enhancement
→ If no novel enhancement is produced, the round counts as recursive
→ Convergence is triggered

---

## Safety Bound

Max iterations: **10**

```
IF reached:
  → STOP regardless of status
  → Hand off to Kiro
```

---

## Human Override

The human (Founder) is responsible for detecting false convergence.

If convergence is declared incorrectly:
→ Loop continues

---

## Operating Model

```
ChatGPT ↔ Claude  (back-and-forth loop)
```

- No other agents participate in this stage
- Kiro is ONLY engaged after convergence

---

## Output

Final output of this stage:
- `PROTOCOL.md` (this file, locked)

This file becomes the input for:
→ Kiro (Design Stage)
→ See `PIPELINE.md` for full build pipeline

---

## Notes

- This is a control layer, not a design document
- Do not introduce product logic here
- Do not begin requirements or tasks
- All agents (Claude Code, Codex, Kiro) read this file from `docs/PROTOCOL.md` in the repo

---

## Status

| Field | Value |
|---|---|
| Stage | 0 (Protocol) |
| State | Locked |
| Version | v1.1 |
| Converged | Round 6 |
| Repo path | `docs/PROTOCOL.md` |
