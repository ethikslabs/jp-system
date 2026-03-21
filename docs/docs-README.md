# docs/
## jp-system · EthiksLabs
### Document corpus — index and orientation

---

## Who reads this

Two consumers. Different modes. Different purposes.

**Kiro** — the build agent. Reads `architecture/`, `platforms/`, and `briefs/` for implementation context. Reads `agents/` for operating instructions. Kiro builds against acceptance criteria. Kiro does not need to read `philosophy/` or `personas/` to do its job — but may read them for orientation when a decision requires understanding intent, not just specification.

**Bob** — the meta-cognition agent. Reads `philosophy/` and `personas/` as primary corpus. Reads `architecture/`, `platforms/`, and `decisions/` for context on what is being built and why. Bob never reads `briefs/` — briefs are instructions, not meaning. Bob observes, reflects, and speaks when the system is stuck or when confidence is spread too wide.

**John** — the founder. Writes everything. Reads nothing he hasn't already thought. Uses the docs to externalise the context window that has been running in his head for two years.

---

## The rule

**`briefs/` is Kiro's domain. `philosophy/` is Bob's domain. Everything else serves both.**

A brief is an instruction. It tells an agent what to build.
A philosophy document is meaning. It tells an agent why anything is being built at all.
Never put instructions in philosophy. Never put meaning in briefs.

---

## Folder structure

```
docs/
│
├── philosophy/          
│   The root corpus. Why EthiksLabs exists. What it believes.
│   Bob's primary reading. The lens for every decision.
│
├── personas/            
│   The four cognitive lenses: Bob, Edison, Sophia, Leonardo.
│   Who they are, how they think, when they speak.
│   Bob reads these to know himself and to understand the other lenses.
│
├── architecture/        
│   How the system is built. The decisions that shaped it.
│   Kiro reads for implementation context.
│   Bob reads to understand what the system is becoming.
│
├── platforms/           
│   One file per platform in the 360 stack.
│   Current state, architectural decisions, open questions.
│   Both Kiro and Bob read these.
│
├── briefs/              
│   Build instructions for Kiro. Locked specs. Requirements docs.
│   Kiro only. Bob does not read briefs.
│
├── decisions/           
│   Architectural decision records. Dated. Immutable once written.
│   Why a decision was made, what was considered, what was rejected.
│   Both Kiro and Bob read these.
│
└── agents/              
    Operating instructions for all agents.
    PIPELINE.md, AGENTS.md, PROTOCOL.md live here.
    Kiro reads AGENTS.md before every session.
    Bob reads PROTOCOL.md to understand the convergence loop.
```

---

## Philosophy

```
philosophy/
├── philosophy.md        ← START HERE. The root document. Everything else hangs off this.
├── hx.md                Human Experience — the design philosophy
├── monday-morning-problem.md
├── gelato-dilemma.md
├── 333-pi-model.md
├── show-dont-tell.md
├── not-knowing-is-normal.md
├── moat.md              The moat is the dataset, not the UI
└── oxytocin-not-dopamine.md   The product optimisation principle
```

`philosophy.md` is the root. Read it first. Every other document in this folder is an elaboration of something stated there.

---

## Personas

```
personas/
├── bob.md               Meta-cognition. The Seer. Speaks on deadlock or confidence spread >0.4.
├── edison.md            Quant. Build velocity. Operational reality.
├── sophia.md            Narrative. Strategic story. Human stakes.
└── leonardo.md          Macro. Market thesis. Long horizon.
```

The personas serve dual purpose: cognitive lenses for John's own thinking, and prototype validation of the Ethiks360 meta-agent interaction model.

Bob is not a dashboard. Bob observes. Bob speaks sideways. Bob is the voice that cuts through when everyone else has run out of road.

---

## Architecture

```
architecture/
├── stack-overview.md    The 360 stack — six platforms, one thesis
├── corpus-layers.md     L1–L6 — the six-layer corpus architecture
├── provenance.md        The provenance engine — origin chains, confidence, freshness
├── pipeline.md          The build pipeline — phases 0–5, convergence loop
├── gap-schema.md        The canonical gap schema — why→risk→control→closure→vendors
├── pulse-schema.md      The pulse/signal schema — BPM, heart rate zones, dashboard
└── dashboard-ai-spec.md The jp-system dashboard AI specification
```

---

## Platforms

```
platforms/
├── proof360.md          Trust intelligence for founders — PRIMARY
├── research360.md       The knowledge engine — corpus, embeddings, retrieval
├── trust360.md          The reasoning engine — gap analysis, scoring, reports
├── voice360.md          Voice interface layer — WebSocket, Cartesia, AudioWorklet
├── fund360.md           Hypothesis testing engine — ASX, analyst personas
├── raise360.md          Capital layer — SAFEs, tokenisation, private placement
├── ethiks360.md         The platform — Sarvesh (CTO), Val (COO)
└── civique.md           Strata transparency — owners-first GTM
```

Each platform document covers: what it is, why it exists, current state, architectural decisions, open questions, relationship to other platforms.

---

## Briefs

```
briefs/
├── brief-portal.md                              jp-system portal — React SPA
├── brief-research360-provenance-LOCKED.md       Provenance engine — narrative spec
├── brief-research360-provenance-REQUIREMENTS.md Provenance engine — build requirements
├── brief-ingram.md                              Ingram vendor graph (to be written)
└── ...
```

Briefs are written to a standard: overview, tech stack, component structure, acceptance criteria. Locked briefs have gone through the convergence loop. Requirements docs are the formal build contract for Kiro.

---

## Decisions

```
decisions/
└── YYYYMMDD-decision-title.md
```

Format: date + short title. Content: context, decision, alternatives considered, consequences. Written at the moment a significant architectural decision is made. Never edited after the fact — if a decision is reversed, a new record is written.

Example titles:
- `20260314-proof360-as-research360-application.md`
- `20260316-pgvector-over-pinecone.md`
- `20260321-provenance-engine-internal-only.md`

---

## Agents

```
agents/
├── AGENTS.md     Claude Code operational instructions — Kiro reads this first
├── PIPELINE.md   The build pipeline — single source of truth
└── PROTOCOL.md   The convergence loop protocol — standalone, locked
```

PIPELINE.md is the single source of truth for how work moves through the system. If PIPELINE.md and any other document conflict, PIPELINE.md wins.

---

## What does not exist yet

These documents need to be written. They are the highest priority gaps in the corpus:

**Philosophy** (Bob cannot function without these):
- `philosophy/hx.md`
- `philosophy/monday-morning-problem.md`
- `philosophy/show-dont-tell.md`
- `philosophy/not-knowing-is-normal.md`
- `philosophy/moat.md`

**Platforms** (Kiro and Bob both need these):
- All eight platform documents

**Decisions** (the record of why things are the way they are):
- At least five significant decisions from the March 2026 build sessions need to be written up

These are not blocking the current build phase. But Bob cannot do his job until the philosophy folder exists. And the platform documents are the single best way to give Kiro clean context without it reading code.

---

## The principle

The docs folder is the externalisation of the founder's context window.

Two years of thinking, pattern recognition, failed attempts, and breakthrough insights live in John's head. This folder is how that thinking becomes persistent, queryable, and available to agents that do not have a biological context window.

A well-maintained docs folder means:
- Kiro never has to guess at intent
- Bob always has clean corpus to draw from
- New collaborators (Sarvesh, Val, future hires) can orient without a 3-hour onboarding call
- The system compounds rather than degrades

Write the docs. Everything else follows.

---

*Last updated: 21 March 2026*
