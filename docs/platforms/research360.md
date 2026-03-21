# Research360
## EthiksLabs · Platform document

---

## What it is

Research360 is the knowledge engine that powers the entire 360 stack.

It is not a product. It is not visible to end users. It is the substrate — the layer that makes every other platform intelligent rather than merely functional.

Research360 ingests source material, extracts meaning, embeds it for semantic retrieval, and returns structured, trustworthy, traceable knowledge to whatever platform is asking the question. Every gap assessment in Proof360, every hypothesis in Fund360, every trust score in Trust360 is only as good as what Research360 knows and how confidently it knows it.

---

## Why it exists

Information is not the problem. The world has too much information. The problem is trustworthy, traceable, retrievable meaning at the moment it is needed.

Most knowledge systems are black boxes. They produce answers without provenance. You cannot inspect how a conclusion was reached. You cannot know when the source was current. You cannot challenge the evidence because you cannot see it.

Research360 is built on the opposite principle. Every piece of knowledge has an origin chain. Every claim is traceable to a primary source. Every output carries confidence scores that distinguish between what was cleanly extracted and what was inferred. The system knows what it knows and knows how well it knows it.

That is the foundation on which trustworthy products can be built.

---

## Current state

**As of March 2026**: running locally end-to-end. Not yet deployed.

- pgvector on RDS Postgres for vector storage and semantic search
- Redis + BullMQ for ingestion job queuing
- S3 for raw source snapshots and file storage
- OpenAI text-embedding-3-large for embeddings
- Unstructured.io + Playwright + yt-dlp/Whisper for extraction
- Claude Sonnet as the reasoning layer
- Full local stack confirmed running

**Next**: deployment to AWS. Research360 must be live before Trust360 can run against real corpus data and before Proof360 can move beyond its current static vendor catalog.

---

## Architecture

### Six-layer corpus

Research360 organises knowledge into six layers. Each layer has different characteristics, provenance semantics, and freshness policies.

**L1 — Core corpus**
Static reference material. Compliance frameworks, governance standards, security controls, vendor capability maps, operational maturity models. These are the authoritative sources Research360 reasons against. Ingested once, versioned by supersession, never deleted.

Examples: SOC 2 Type II, ISO 27001:2022, NIST CSF 2.0, Privacy Act 1988, ASIC disclosure obligations.

**L2 — Customer corpus**
Company-specific documents submitted per assessment session. Scoped to company_id. Never used in cross-company reasoning. Point-in-time — represents the company's documentation as of the assessment date.

Examples: company security policies, existing compliance certifications, product documentation, pitch decks.

**L3 — Real-time signals**
Continuous crawl. Sources that change — regulatory updates, vendor announcements, market signals, advisory feeds. Crawl bots run on schedule. Every crawl produces a new snapshot. Stale detection is active.

Examples: ASIC regulatory updates, GitHub security advisories, vendor blog announcements, ASX filings.

**L4 — LLM working memory**
Transient. The in-context reasoning state during a Trust360 run. Not persisted in corpus. The chunks retrieved from L1–L5 into L4 context are logged to L6 at run completion.

**L5 — External layer**
Live API integrations. Vanta compliance status, GitHub repository signals, Xero financial data, HubSpot CRM signals, Ingram Micro catalog, Dicker Data catalog. Each integration has a TTL and stale detection policy.

**L6 — Decision log**
The immutable terminal record. Every Trust360 run writes to L6 — which chunks were retrieved, what reasoning steps were taken, what confidence was assigned, what conclusions were reached. L6 is append-only. Nothing is deleted. The delta between runs is computable.

---

### The provenance engine

Every chunk in Research360 carries a provenance record from the moment of ingestion. The provenance chain answers:

- Where did this come from? (`source.uri`, `source.canonical_uri`)
- How was it extracted? (`extraction.method`, `extraction.confidence`)
- When was it true? (`source.retrieved_at`)
- Has it changed since? (`status.is_stale`, `status.is_superseded`)
- How was it used in reasoning? (`reasoning.usages`)

Two confidence scores travel independently and are never collapsed:

**Extraction confidence** — how reliably was the source converted to structured text? Measured at ingestion. Normalised 0–1.

**Reasoning confidence** — how strongly did the LLM use this chunk to support a specific conclusion in a specific step? Measured at reasoning time. Stored per usage.

The provenance engine is the mechanism that makes Research360's outputs defensible. A vendor who disputes a gap assessment in Proof360 is not arguing with EthiksLabs — they are looking at the primary source, the extraction confidence, the crawl timestamp, and the reasoning chain that produced the assessment. The evidence is visible. The dispute has a resolution path.

See `briefs/brief-research360-provenance-LOCKED.md` for the full provenance specification.

---

### Ingestion pipeline

Sources enter Research360 through type-specific ingestion paths:

| Source | Path | Extraction |
|--------|------|-----------|
| PDF / file | S3 upload → Unstructured.io | Text, tables, structure |
| Web page | Playwright crawl | Rendered HTML content |
| API | Direct integration | Structured JSON/XML response |
| Podcast / YouTube | yt-dlp download → Whisper | Audio transcription |

All paths produce the same output: chunks with embeddings and a complete provenance record. The ingestion pipeline normalises confidence to 0–1 regardless of source type.

BullMQ manages the job queue. Redis handles job state. Failed jobs are retried with exponential backoff. Every ingestion event is logged.

---

### Query model

Research360 supports two retrieval modes:

**Semantic query** — LLM-oriented. Natural language question, embedding comparison, ranked results by similarity score. Used by Trust360 during reasoning runs to retrieve relevant chunks for gap analysis.

**Reference query** — transparency-oriented. Search the corpus, return original artefacts, extracted text, confidence scores, and source citations without LLM synthesis. Used by Proof360's `view sources` feature to show the evidence trail behind a gap assessment.

Both modes return provenance objects. Depth is configurable per product: `summary` for Proof360, `internal` for standard tooling, `full_internal` for engine views and Fund360.

---

### Relationship to other platforms

Research360 is the substrate. Everything else is an application on top of it.

**Trust360** queries Research360 during every reasoning run. It retrieves L1–L5 chunks relevant to the company being assessed, reasons across them with Claude Sonnet, and writes results to L6.

**Proof360** is the first and primary application on top of Research360. Every gap card, vendor recommendation, and trust score in a Proof360 report is produced by Trust360 reasoning against Research360 knowledge.

**Fund360** will query Research360 for market context, regulatory signals, and company intelligence. The hypothesis engine reasons against L1 frameworks and L3 real-time signals.

**Ethiks360** will eventually query Research360 as the knowledge backbone for the entire platform. Research360 is not a Proof360 component — it is an EthiksLabs infrastructure layer.

---

## Dual purpose

Research360 serves two purposes simultaneously.

**Personal knowledge management** — John's own research, reading, and thinking ingested and retrievable. The system John uses to know what he knows.

**Demonstrable platform layer** — a production-grade knowledge engine that can be shown to partners, investors, and enterprise customers as the intelligence substrate of the 360 stack. When the Ingram ANZ MD sits down, Research360 is what makes the demo credible — not the UI, but the engine behind it.

The show-don't-tell principle applies here. You do not explain Research360. You run a company through Trust360 and let the evidence trail speak. The provenance, the sources, the confidence scores — that is Research360 visible without being exposed.

---

## What is not Research360

Research360 is the engine. It is not:

- A product sold to customers
- A user-facing interface
- A competitor to knowledge management tools like Notion or Confluence
- A replacement for primary sources

Research360 makes primary sources more accessible and trustworthy. It does not replace them. The source is always the authority. Research360 is the retrieval and reasoning layer that makes the source findable, legible, and citable at the moment it is needed.

---

## Open questions

- Deployment architecture on AWS — RDS instance sizing, Redis ElastiCache vs self-managed, S3 bucket structure
- Crawl bot scheduling and orchestration — how bots are triggered, monitored, and recovered from failure
- L1 corpus population — which frameworks and standards are in scope for v1, who maintains the ingestion schedule
- Cross-platform query isolation — ensuring L2 customer corpus is never retrievable across company boundaries
- Rate limiting and cost management on the embedding API — text-embedding-3-large costs at scale

---

## Acceptance criteria for deployment

- [ ] pgvector RDS instance running on AWS
- [ ] Redis + BullMQ ingestion queue operational
- [ ] S3 buckets configured for raw snapshots and file storage
- [ ] At least 5 L1 framework documents ingested with full provenance
- [ ] Semantic query returning ranked results with provenance objects
- [ ] Reference query returning source citations with extraction confidence
- [ ] L3 crawl bot running for at least one source (ASIC or GitHub advisories)
- [ ] L5 API integration for at least one external source (Vanta or Ingram)
- [ ] Proof360 connected to Research360 via Trust360 for live gap analysis
- [ ] L6 decision log writing on every Trust360 run

---

*Last updated: 21 March 2026*
