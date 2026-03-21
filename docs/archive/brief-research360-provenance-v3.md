# brief-research360-provenance.md
## Research360 · Provenance Engine
### v3 — convergence round 3

---

## What this is

Provenance is the origin chain attached to every output Research360 produces. It answers:
- Where did this come from?
- How did it get here?
- How confident are we at each step?
- When was this true?

Provenance is an **internal Research360 capability**. Products consume it and surface only the slice appropriate for their context. No product ever exposes Research360 architecture to users.

---

## Layer classification

**Evidence layers** — L1, L2, L3, L5
Persistent, corpus-stored, provenance-bearing.

**Transient context** — L4
LLM working memory during a Trust360 run. Not persisted. Provenance captured in L6 at run completion.

**Decision record** — L6
Immutable run log. Terminal provenance record for all Trust360 outputs.

---

## Core concept

Every chunk carries a provenance record at ingestion. Every query result returns a provenance object. Two confidence dimensions always tracked independently, never collapsed.

**Extraction confidence** — how reliably was the source converted to structured text? Pipeline-owned normalised score 0–1. Measured at ingestion.

**Reasoning confidence** — how strongly did the LLM reasoning layer use this chunk to support a specific conclusion in a specific step? Measured at reasoning time. One chunk may be used in multiple steps with different confidence per step.

---

## Source taxonomy

Two-level classification. Defined once. Never drifts.

**`source_type`** — transport / infrastructure class:
`file | web | api | audio`

**`source_subtype`** — channel / format:
`pdf | docx | podcast | youtube | rss | html | json_api | xml_api`

Mapping examples:
- PDF in S3 → `source_type: file`, `source_subtype: pdf`
- Web crawl → `source_type: web`, `source_subtype: html`
- Ingram API → `source_type: api`, `source_subtype: json_api`
- Podcast episode → `source_type: audio`, `source_subtype: podcast`
- YouTube video → `source_type: audio`, `source_subtype: youtube`

---

## Provenance object schema (v1.0)

```json
{
  "schema_version": "1.0",
  "chunk_id": "uuid",
  "content": "...",
  "similarity_score": 0.94,
  "provenance": {
    "source_type": "file | web | api | audio",
    "source_subtype": "pdf | html | json_api | podcast | youtube | ...",
    "layer": "L1 | L2 | L3 | L5",
    "snapshot_policy": "static | refresh_on_request | auto_refresh",
    "extraction": {
      "confidence": 0.97,
      "method": "unstructured_io | playwright | whisper | api_response",
      "ingested_at": "2026-03-14T09:43:00Z",
      "ingested_by": "ingestion-bot-v1 | manual | api-sync"
    },
    "source": {
      "uri": "https://raw-or-display-uri",
      "canonical_uri": "https://canonical-deduplicated-uri",
      "title": "SOC 2 Type II — AICPA 2017",
      "retrieved_at": "2026-03-14T09:41:22Z",
      "version": "2017 | v2.0 | null",
      "freshness_policy": {
        "ttl_hours": 24,
        "stale_if_fetch_fails": true
      }
    },
    "status": {
      "is_stale": false,
      "stale_since": null,
      "is_superseded": false,
      "superseded_at": null,
      "superseded_by_chunk_id": null
    },
    "reasoning": {
      "run_id": null,
      "usages": []
    }
  }
}
```

**Timestamps**: all stored as `TIMESTAMPTZ` in UTC (`Z` suffix). Rendered in `Australia/Sydney` for human-facing surfaces only. Never store or hardcode AEST/AEDT in data.

**`layer` field**: internal-only. Stripped from all product-facing responses unless `provenance_depth = full_internal`.

**`reasoning` block at rest**: `run_id: null`, `usages: []`. Populated only when chunk was consumed in a Trust360 run.

**Reasoning usage schema**:
```json
"usages": [
  {
    "step": "gap_assessment",
    "step_index": 3,
    "confidence": 0.83,
    "used_at": "2026-03-21T01:14:22Z"
  },
  {
    "step": "vendor_resolution",
    "step_index": 4,
    "confidence": 0.71,
    "used_at": "2026-03-21T01:14:38Z"
  }
]
```

`step_index` enables audit replay in correct sequence. `used_at` is UTC timestamp. No overwriting, no collapsing.

**Retrieval-only queries** (no Trust360 run): return `reasoning: { run_id: null, usages: [] }`. Explicit empty — not null.

**Run-scoped queries** (within a Trust360 run): return populated `reasoning` block with `run_id` and `usages` for that run only.

---

## Schema authority rule

**Top-level indexed columns** are operational fields for filtering, freshness checks, stale detection, and joins.

**`provenance` JSONB** is the canonical API response envelope.

**Rule**: both are written atomically at ingestion. If they diverge, JSONB is authoritative for API responses. Top-level columns are treated as stale cache on divergence.

---

## Snapshot policy

Three values. Applied per chunk at ingestion. Governs whether and how a chunk can be refreshed.

| Value | Meaning |
|-------|---------|
| `static` | Never automatically refreshed. Updated only by explicit human re-ingestion (e.g. new version of an L1 standard). |
| `refresh_on_request` | Refreshed when explicitly requested via the refresh endpoint (e.g. vendor-triggered dispute, product-triggered re-run). |
| `auto_refresh` | Refreshed automatically on TTL expiry or crawl schedule (L3 crawl bots, L5 API syncs). |

---

## Freshness policy and stale detection

`freshness_policy` is defined per chunk at ingestion.

```json
"freshness_policy": {
  "ttl_hours": 24,
  "stale_if_fetch_fails": true
}
```

**Stale detection rule**:
- If `ttl_hours` is `null`: stale-by-time is **disabled**. Only explicit supersession (`superseded_at` set) marks the chunk stale.
- If `ttl_hours` is set: chunk is stale when `NOW() > source.retrieved_at + ttl_hours`
- If `stale_if_fetch_fails: true` and crawl/fetch returns non-200 or times out: chunk is marked stale regardless of TTL

L1 chunks always have `ttl_hours: null`. They are never automatically stale. Supersession is the only lifecycle event.

---

## Per-layer provenance

### L1 — Core corpus (file)

- `source_type: file`, `source_subtype: pdf | docx`
- `snapshot_policy: static`
- `freshness_policy: { ttl_hours: null, stale_if_fetch_fails: false }`
- `canonical_uri`: S3 key (permanent)
- Versioned by supersession. Old chunks never deleted. `superseded_at` + `superseded_by_chunk_id` set on replacement.

### L2 — Customer corpus

- Same as L1, scoped to `company_id/session_id`
- `snapshot_policy: refresh_on_request`
- `scope: private` — never used in cross-company reasoning
- Refresh scoped to `company_id`

### L3 — Real-time signals (crawl bots)

- `source_type: web`, `source_subtype: html | rss`
- `snapshot_policy: auto_refresh`
- `freshness_policy.ttl_hours`: per source (e.g. asic.gov.au: 24, github advisories: 1)
- `freshness_policy.stale_if_fetch_fails: true`
- All timestamps stored UTC. Rendered Australia/Sydney for human surfaces.
- Raw content snapshot stored to S3 per crawl. Byte-for-byte preservation.

### L4 — Transient context

Not a storage layer. Not provenance-bearing. L4 context is logged to L6 at run completion.

### L5 — External APIs

- `source_type: api`, `source_subtype: json_api | xml_api`
- `snapshot_policy: auto_refresh`
- `freshness_policy.ttl_hours`: per integration (Ingram: 4, Vanta: 24, GitHub: 1)
- `freshness_policy.stale_if_fetch_fails: true`
- `extraction.confidence`: 1.0 for complete valid response, degraded proportionally for partial/missing fields
- Raw API response snapshotted to S3 (byte-for-byte)

### L6 — Decision record

Append-only. No updates. No deletes.

Stale flagging does not mutate L6 rows — it is recorded as an event in `trust_run_events` (see schema below).

Every run record includes:
- `run_id`, `company_id`, `run_at` (UTC)
- `chunks_retrieved`: array of `{ chunk_id, provenance_snapshot, similarity_score }` — provenance state at run time, not live
- `reasoning_steps`: array of `{ step, step_index, chunks_used, confidence, step_at }`
- `gaps_identified`, `vendor_resolutions`, `trust_scores`
- `corpus_snapshot`: layer doc counts + L3/L5 freshness status at run time

---

## Confidence scoring

### Extraction confidence (pipeline-owned, normalised 0–1)

| Source | Derivation |
|--------|-----------|
| file (pdf/docx) | Unstructured.io signals: OCR error rate, table fidelity, footnote preservation |
| web (html) | Playwright signals: JS render success, content/boilerplate ratio |
| api | Schema completeness: ratio of expected fields present and non-null |
| audio (podcast/youtube) | Whisper per-segment confidence averaged across chunk |

Not a direct vendor-provided metric. Pipeline normalises to 0–1 regardless of source.

### Reasoning confidence (Trust360-owned, per usage)

How strongly does this chunk support the specific conclusion at this reasoning step. Separate from similarity score. Stored per usage in `reasoning.usages` array. Never collapsed.

---

## Product response shaping — allowlist model

Product-facing responses are constructed from an **allowlist** per `provenance_depth`. Not by stripping from the full internal object. This prevents future internal field leakage if new fields are added.

### Allowlists

**`summary`** (e.g. Proof360):
```
source.title
source.uri
source.retrieved_at
extraction.confidence (mapped to display band — see below)
status.is_stale
status.is_superseded
schema_version
```

**`internal`** (e.g. jp-system portal standard view):
```
all summary fields +
source_type, source_subtype
source.canonical_uri
source.version
source.freshness_policy
extraction.method
extraction.ingested_at
status (full)
snapshot_policy
schema_version
```

**`full_internal`** (e.g. jp-system portal engine view, Fund360):
```
all internal fields +
layer
extraction.ingested_by
reasoning (full, with usages)
raw S3 snapshot link
chunk_id
```

Any field not on the allowlist for the requested depth is excluded at the API response layer — not by the consuming product.

---

## Proof360 surface

`view sources` on gap card (collapsed by default):
- Source title
- Retrieved date (rendered Australia/Sydney, human-readable: "sourced 20 Mar 2026")
- Confidence band (not a raw number)
- Link to source URI where available
- Stale warning if `status.is_stale: true`

**Confidence band mapping** (deterministic, defined here, not per-product):

| `extraction.confidence` | Display |
|------------------------|---------|
| ≥ 0.90 | Strong |
| ≥ 0.70 and < 0.90 | Moderate |
| < 0.70 | Check original |

No layer names, chunk IDs, bot identities, or internal terminology visible to users.

---

## Refresh mechanism

**Endpoint**: `POST /api/research/refresh`
**Auth**: internal-only, v1.
**Scope rules**:
- L3, L5: refresh by `source_uri` or `canonical_uri`
- L1: refresh only if raw S3 snapshot exists for reprocessing, or new file explicitly submitted
- L2: scoped to `company_id` — a company refreshes only its own corpus

**Process**:
1. Re-fetch / re-crawl source
2. Re-extract with current pipeline
3. Re-embed with text-embedding-3-large
4. Write new chunk(s) with new provenance timestamps
5. On old chunk(s): set `superseded_at`, set `superseded_by_chunk_id` → new chunk
6. On new chunk(s): set `previous_chunk_id` → old chunk
7. Write `refresh_completed` event to `trust_run_events` referencing affected `run_id`(s)

**v1 lineage limitation**: `superseded_by_chunk_id` and `previous_chunk_id` assume 1:1 chunk replacement. If a refresh of one source produces multiple replacement chunks (fan-out), v1 links only the first replacement. A source-level lineage table will be introduced in a later iteration to handle many-to-many replacement accurately. This is a known v1 constraint — document it at build time.

---

## Schema

### Chunks table

```sql
ALTER TABLE chunks ADD COLUMN provenance JSONB NOT NULL DEFAULT '{}';
ALTER TABLE chunks ADD COLUMN source_type VARCHAR(20);
ALTER TABLE chunks ADD COLUMN source_subtype VARCHAR(30);
ALTER TABLE chunks ADD COLUMN extraction_confidence FLOAT;
ALTER TABLE chunks ADD COLUMN ingested_by VARCHAR(100);
ALTER TABLE chunks ADD COLUMN source_retrieved_at TIMESTAMPTZ;
ALTER TABLE chunks ADD COLUMN source_uri TEXT;
ALTER TABLE chunks ADD COLUMN canonical_uri TEXT;
ALTER TABLE chunks ADD COLUMN snapshot_policy VARCHAR(30) DEFAULT 'static';
ALTER TABLE chunks ADD COLUMN is_stale BOOLEAN DEFAULT FALSE;
ALTER TABLE chunks ADD COLUMN stale_since TIMESTAMPTZ;
ALTER TABLE chunks ADD COLUMN superseded_at TIMESTAMPTZ;
ALTER TABLE chunks ADD COLUMN superseded_by_chunk_id UUID REFERENCES chunks(id);
ALTER TABLE chunks ADD COLUMN previous_chunk_id UUID REFERENCES chunks(id);

CREATE INDEX idx_chunks_canonical_uri ON chunks(canonical_uri);
CREATE INDEX idx_chunks_is_stale ON chunks(is_stale);
CREATE INDEX idx_chunks_source_retrieved_at ON chunks(source_retrieved_at);
CREATE INDEX idx_chunks_superseded_by ON chunks(superseded_by_chunk_id);
CREATE INDEX idx_chunks_snapshot_policy ON chunks(snapshot_policy);
```

### Trust runs table (v1 — JSONB, append-only)

```sql
CREATE TABLE trust_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(100),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  corpus_snapshot JSONB,
  chunks_retrieved JSONB,
  reasoning_steps JSONB,
  gaps_identified JSONB,
  vendor_resolutions JSONB,
  trust_scores JSONB
);
-- No is_stale column. Stale state tracked in trust_run_events.
```

**v1 note**: JSONB for speed of implementation. Child tables (`trust_run_chunks`, `trust_run_steps`) may be added later for analytics and audit indexing.

### Trust run events table (immutability-preserving lifecycle log)

```sql
CREATE TABLE trust_run_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES trust_runs(run_id),
  event_type VARCHAR(50) NOT NULL,
  event_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- event_type values:
-- stale_flagged        — a chunk cited in this run was refreshed/superseded
-- refresh_triggered    — a refresh was requested for this run's sources
-- refresh_completed    — refresh completed, re-run available
-- dispute_opened       — vendor-initiated dispute against this run
-- dispute_closed       — dispute resolved (with outcome in payload)
```

`trust_runs` rows are never mutated after write. All lifecycle state lives in `trust_run_events`.

---

## API endpoints

```
POST /api/research/query
  body: { query, layers?, provenance_depth: 'summary|internal|full_internal', run_id? }
  returns: { results: [{ chunk_id, content, similarity_score, provenance }] }
  note: reasoning block populated only if run_id provided

POST /api/research/refresh          (internal-only)
  body: { chunk_ids?, source_uris?, canonical_uris?, reason, company_id? }
  returns: { refreshed: [{ old_chunk_id, new_chunk_id, provenance }] }

GET  /api/research/provenance/:chunk_id    (internal-only)
  returns: full provenance chain

GET  /api/trust/runs/:run_id/provenance    (internal-only)
  returns: full provenance audit trail for run

GET  /api/trust/runs/:run_id/events        (internal-only)
  returns: lifecycle event log for run
```

---

## Acceptance criteria

- [ ] `schema_version: "1.0"` on all provenance objects
- [ ] All timestamps stored as TIMESTAMPTZ UTC; rendered Australia/Sydney for human surfaces only
- [ ] All ingestion paths write provenance fields atomically at ingest time
- [ ] Top-level indexed columns and provenance JSONB synchronised at write; JSONB authoritative on divergence
- [ ] `source_type` (transport class) and `source_subtype` (channel/format) both present on all chunks
- [ ] `layer` stripped from all product responses unless `provenance_depth = full_internal`
- [ ] Product responses built from allowlist per depth — not by stripping from full internal object
- [ ] `source.uri` (raw) and `source.canonical_uri` (deduplicated) both stored for web and API chunks
- [ ] `snapshot_policy` present in schema object and in top-level column
- [ ] `freshness_policy.ttl_hours: null` disables stale-by-time; only supersession marks chunk stale
- [ ] L3 and L5 chunks carry `freshness_policy` with ttl_hours and stale_if_fetch_fails
- [ ] Stale detection computed from `source_retrieved_at + ttl_hours` and on fetch failure
- [ ] `superseded_by_chunk_id` and `previous_chunk_id` form bidirectional 1:1 linkage (v1 constraint documented)
- [ ] v1 lineage limitation (1:1 only) explicitly noted in codebase and docs
- [ ] Reasoning provenance stored as `usages` array with `step`, `step_index`, `confidence`, `used_at` per entry
- [ ] Retrieval-only queries return `reasoning: { run_id: null, usages: [] }` — not null
- [ ] Run-scoped queries return populated reasoning block for that run only
- [ ] `trust_runs` table is append-only — no updates or deletes
- [ ] Stale state and lifecycle events recorded in `trust_run_events` — not as mutations to `trust_runs`
- [ ] `trust_run_events` supports: stale_flagged, refresh_triggered, refresh_completed, dispute_opened, dispute_closed
- [ ] Refresh endpoint enforces scope: L2 by company_id, L3/L5 by URI, L1 by snapshot availability
- [ ] Refresh writes supersession linkage and `refresh_completed` event to `trust_run_events`
- [ ] Proof360 `view sources` maps confidence to Strong/Moderate/Check original using defined thresholds
- [ ] Proof360 surfaces stale warning when `status.is_stale: true`
- [ ] No internal fields in product-facing responses outside `full_internal` depth
