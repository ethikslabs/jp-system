# brief-research360-provenance.md
## Research360 · Provenance Engine
### LOCKED — convergence complete after 4 rounds
### Ready for build handoff to Kiro

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

Every chunk carries a provenance record at ingestion. Every query result returns a provenance object. Two confidence dimensions tracked independently, never collapsed.

**Extraction confidence** — how reliably was the source converted to structured text? Pipeline-owned normalised score 0–1. Measured at ingestion.

**Reasoning confidence** — how strongly did the LLM reasoning layer use this chunk to support a specific conclusion in a specific step? Measured at reasoning time. One chunk may appear in multiple steps within one run with different confidence per step.

---

## Source taxonomy

Two-level classification. Fixed. No drift.

**`source_type`** — transport / infrastructure class (fixed enum):
`file | web | api | audio`

**`source_subtype`** — channel / format (initial enum, extensible by schema migration only):

| Initial values | Description |
|---------------|-------------|
| `pdf` | PDF document |
| `docx` | Word document |
| `html` | Web page |
| `rss` | RSS/Atom feed |
| `json_api` | JSON REST API response |
| `xml_api` | XML API response |
| `podcast` | Podcast audio episode |
| `youtube` | YouTube video transcript |

New subtypes require a schema migration and a version bump. `...` is not a valid value at runtime.

Mapping examples:
- PDF in S3 → `source_type: file`, `source_subtype: pdf`
- Web crawl → `source_type: web`, `source_subtype: html`
- Ingram API → `source_type: api`, `source_subtype: json_api`
- Podcast → `source_type: audio`, `source_subtype: podcast`

---

## Lifecycle state — stale vs superseded

These are independent states. They are never treated as synonymous.

**`is_superseded`** — version / lifecycle state. Set when a chunk has been replaced by a newer version of the same source (via refresh or re-ingestion). A superseded chunk is still historically valid — it accurately represents the source at the time it was ingested. Historical Trust360 runs that cited it remain accurate.

**`is_stale`** — freshness / recency state. Set when `NOW() > source.retrieved_at + ttl_hours`, or when a fetch/crawl fails and `stale_if_fetch_fails: true`. A stale chunk has not been verified as current recently.

A chunk can be:
- Neither (normal)
- Stale only (TTL expired, not yet refreshed)
- Superseded only (replaced, was valid when ingested)
- Both (replaced and also past TTL)

When `ttl_hours` is `null` (L1 static documents): stale-by-time is disabled. `is_stale` is never set by the time-based rule. Supersession is tracked separately via `is_superseded` and does not automatically imply `is_stale`. Whether a superseded chunk is treated as stale for a given use case is a product/runtime decision, not a storage rule.

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
    "source_subtype": "pdf | html | json_api | podcast | ...",
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
      "raw_snapshot_uri": "s3://bucket/snapshots/chunk-uuid-20260314.json",
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

**Timestamps**: all stored as `TIMESTAMPTZ` UTC. Rendered in `Australia/Sydney` for human-facing surfaces only. Never hardcode AEST/AEDT in storage or data.

**`layer`**: internal-only. Stripped from all product responses unless `provenance_depth = full_internal`.

**`source.raw_snapshot_uri`**: S3 URI of the byte-for-byte raw source snapshot taken at ingestion or crawl time. Present for all L1, L3, L5 chunks. Null for L2 if no raw file was submitted. Exposed only at `full_internal` depth.

**`reasoning` at rest**: `run_id: null`, `usages: []`. Never null — always an empty array at rest.

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

`step_index` enables audit replay in sequence. `used_at` UTC. No overwriting, no collapsing across steps.

---

## Schema authority rule

Top-level indexed columns are operational fields for filtering, freshness checks, and joins.
`provenance` JSONB is the canonical API response envelope.
Both written atomically at ingestion. On divergence, JSONB is authoritative for API responses.

---

## Snapshot policy

| Value | Meaning |
|-------|---------|
| `static` | Never auto-refreshed. Updated only by explicit human re-ingestion. |
| `refresh_on_request` | Refreshed when explicitly requested via refresh endpoint. |
| `auto_refresh` | Refreshed automatically on TTL expiry or crawl schedule. |

---

## Freshness policy and stale detection

```json
"freshness_policy": {
  "ttl_hours": 24,
  "stale_if_fetch_fails": true
}
```

**Rules**:
- `ttl_hours: null` → stale-by-time disabled. Only `is_superseded` applies as a lifecycle signal.
- `ttl_hours` set → `is_stale = true` when `NOW() > source.retrieved_at + ttl_hours`
- `stale_if_fetch_fails: true` and fetch returns non-200 or times out → `is_stale = true` regardless of TTL

`is_stale` and `is_superseded` are set independently. Neither implies the other at the storage layer.

---

## Per-layer provenance

### L1 — Core corpus (file)
- `source_type: file`, `source_subtype: pdf | docx`
- `snapshot_policy: static`
- `freshness_policy: { ttl_hours: null, stale_if_fetch_fails: false }`
- `raw_snapshot_uri`: S3 key of original file (permanent)
- Versioned by supersession. Old chunks never deleted.

### L2 — Customer corpus
- Same as L1, scoped to `company_id/session_id`
- `snapshot_policy: refresh_on_request`
- `scope: private` — never used in cross-company reasoning
- `raw_snapshot_uri`: S3 key if file submitted, null if text-only

### L3 — Real-time signals (crawl bots)
- `source_type: web`, `source_subtype: html | rss`
- `snapshot_policy: auto_refresh`
- `freshness_policy.ttl_hours`: per source (asic.gov.au: 24, github advisories: 1)
- `freshness_policy.stale_if_fetch_fails: true`
- `raw_snapshot_uri`: S3 key of raw crawled content snapshot per crawl event
- All timestamps UTC. Rendered Australia/Sydney for human surfaces.

### L4 — Transient context
Not a storage layer. Not provenance-bearing. Logged to L6 at run completion.

### L5 — External APIs
- `source_type: api`, `source_subtype: json_api | xml_api`
- `snapshot_policy: auto_refresh`
- `freshness_policy.ttl_hours`: per integration (Ingram: 4, Vanta: 24, GitHub: 1)
- `freshness_policy.stale_if_fetch_fails: true`
- `raw_snapshot_uri`: S3 key of byte-for-byte API response snapshot

### L6 — Decision record
Append-only. No updates. No deletes.
Stale and lifecycle state recorded in `trust_run_events`, not as mutations to `trust_runs`.

---

## Confidence scoring

### Extraction confidence (pipeline-owned, normalised 0–1)

| Source | Derivation |
|--------|-----------|
| file (pdf/docx) | Unstructured.io signals: OCR error rate, table fidelity, footnote preservation |
| web (html) | Playwright signals: JS render success, content/boilerplate ratio |
| api | Schema completeness: ratio of expected fields present and non-null |
| audio | Whisper per-segment confidence averaged across chunk |

Not a direct vendor metric. Pipeline normalises to 0–1.

### Reasoning confidence (Trust360-owned, per usage)
Stored per usage in `reasoning.usages`. Never collapsed. One chunk, multiple steps, different confidence per step — all recorded.

---

## Product response shaping — allowlist model

Product responses constructed from an **allowlist** per `provenance_depth`. Never by stripping from the full internal object. Future internal fields cannot leak if someone forgets to extend a striplist.

### `summary` (e.g. Proof360)
```
schema_version
source.title
source.uri
source.retrieved_at
extraction.confidence → mapped to display band
status.is_stale
status.is_superseded
```

### `internal` (e.g. jp-system portal standard)
```
all summary fields +
source_type, source_subtype
source.canonical_uri
source.version
source.freshness_policy
extraction.method
extraction.ingested_at
status (full object)
snapshot_policy
```

### `full_internal` (e.g. jp-system portal engine view, Fund360)
```
all internal fields +
layer
chunk_id
extraction.ingested_by
source.raw_snapshot_uri
reasoning (full — run_id + usages array)
```

---

## Proof360 surface

`view sources` on gap card (collapsed by default):
- Source title
- Retrieved date (Australia/Sydney, human-readable: "sourced 20 Mar 2026")
- Confidence band
- Source URI link
- Stale warning if `status.is_stale: true`
- Superseded notice if `status.is_superseded: true` (with "refresh available" CTA)

**Confidence band mapping** (deterministic — defined here, applied identically by all products):

| `extraction.confidence` | Display |
|------------------------|---------|
| ≥ 0.90 | Strong |
| ≥ 0.70 and < 0.90 | Moderate |
| < 0.70 | Check original |

---

## Refresh mechanism

**Endpoint**: `POST /api/research/refresh` — internal-only, v1.

**Scope**:
- L3, L5: by `source_uri` or `canonical_uri`
- L1: only if raw S3 snapshot exists, or new file explicitly submitted
- L2: scoped to `company_id`

**Process**:
1. Re-fetch / re-crawl source
2. Re-extract + re-embed
3. Write new chunk(s) with new provenance
4. Old chunk(s): set `superseded_at`, `superseded_by_chunk_id` → new chunk
5. New chunk(s): set `previous_chunk_id` → old chunk
6. Write `refresh_completed` event to `trust_run_events`

**v1 lineage constraint**: `superseded_by_chunk_id` and `previous_chunk_id` assume 1:1 replacement. If a source refresh produces multiple replacement chunks (fan-out), v1 links only the first. A source-level lineage table will be introduced in a later iteration. This is a known v1 constraint — document in codebase at build time.

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
ALTER TABLE chunks ADD COLUMN raw_snapshot_uri TEXT;
ALTER TABLE chunks ADD COLUMN snapshot_policy VARCHAR(30) DEFAULT 'static';
ALTER TABLE chunks ADD COLUMN is_stale BOOLEAN DEFAULT FALSE;
ALTER TABLE chunks ADD COLUMN stale_since TIMESTAMPTZ;
ALTER TABLE chunks ADD COLUMN is_superseded BOOLEAN DEFAULT FALSE;
ALTER TABLE chunks ADD COLUMN superseded_at TIMESTAMPTZ;
ALTER TABLE chunks ADD COLUMN superseded_by_chunk_id UUID REFERENCES chunks(id);
ALTER TABLE chunks ADD COLUMN previous_chunk_id UUID REFERENCES chunks(id);

CREATE INDEX idx_chunks_canonical_uri ON chunks(canonical_uri);
CREATE INDEX idx_chunks_is_stale ON chunks(is_stale);
CREATE INDEX idx_chunks_is_superseded ON chunks(is_superseded);
CREATE INDEX idx_chunks_source_retrieved_at ON chunks(source_retrieved_at);
CREATE INDEX idx_chunks_superseded_by ON chunks(superseded_by_chunk_id);
CREATE INDEX idx_chunks_snapshot_policy ON chunks(snapshot_policy);
```

### Trust runs table (v1, append-only)

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
-- Append-only. Never update or delete rows.
-- Stale and lifecycle state lives in trust_run_events.
-- v1 JSONB shape. Child tables (trust_run_chunks, trust_run_steps) added later for analytics.
```

### Trust run events table

```sql
CREATE TABLE trust_run_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES trust_runs(run_id),
  event_type VARCHAR(50) NOT NULL,
  event_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- event_type enum (v1):
--   stale_flagged        chunk cited in this run was refreshed or superseded
--   refresh_triggered    refresh requested for sources cited in this run
--   refresh_completed    refresh done, re-run available
--   dispute_opened       vendor-initiated dispute against this run
--   dispute_closed       dispute resolved (outcome in payload)
```

---

## API

```
POST /api/research/query
  body: {
    query: string,
    layers?: string[],
    provenance_depth: 'summary | internal | full_internal',
    run_id?: uuid   // read-only replay scope only
  }
  returns: { results: [{ chunk_id, content, similarity_score, provenance }] }
  note: if run_id provided, it must reference an existing Trust360 run.
        reasoning block is scoped to that recorded run only.
        this endpoint never mutates trust_runs.

POST /api/research/refresh          (internal-only)
  body: { chunk_ids?, source_uris?, canonical_uris?, reason, company_id? }
  returns: { refreshed: [{ old_chunk_id, new_chunk_id, provenance }] }

GET  /api/research/provenance/:chunk_id         (internal-only)
GET  /api/trust/runs/:run_id/provenance         (internal-only)
GET  /api/trust/runs/:run_id/events             (internal-only)
```

---

## Acceptance criteria

- [ ] `schema_version: "1.0"` on all provenance objects
- [ ] All timestamps stored TIMESTAMPTZ UTC; rendered Australia/Sydney for human surfaces only
- [ ] All ingestion paths write provenance fields atomically at ingest time
- [ ] Top-level columns and provenance JSONB synchronised at write; JSONB authoritative on divergence
- [ ] `source_type` (transport class) and `source_subtype` (channel/format) present on all chunks
- [ ] `source_subtype` values restricted to defined initial enum; new values require migration + version bump
- [ ] `layer` stripped from all product responses unless `provenance_depth = full_internal`
- [ ] Product responses built from per-depth allowlist — not by stripping from full internal object
- [ ] `source.uri`, `source.canonical_uri`, `source.raw_snapshot_uri` all stored for L1/L3/L5 chunks
- [ ] `snapshot_policy` present in schema object and top-level column
- [ ] `freshness_policy.ttl_hours: null` disables stale-by-time; `is_stale` never set by time rule for null-TTL chunks
- [ ] `is_stale` and `is_superseded` tracked independently — never treated as synonymous by storage model
- [ ] Neither `is_stale` nor `is_superseded` implies the other at the storage layer
- [ ] Stale detection runs on `source_retrieved_at + ttl_hours` and on fetch failure per `stale_if_fetch_fails`
- [ ] `superseded_by_chunk_id` and `previous_chunk_id` form bidirectional 1:1 linkage
- [ ] v1 lineage 1:1 constraint documented in codebase
- [ ] `reasoning.usages` is always an array (empty `[]` at rest, never null)
- [ ] Each usage entry includes `step`, `step_index`, `confidence`, `used_at`
- [ ] Retrieval-only queries return `reasoning: { run_id: null, usages: [] }`
- [ ] Run-scoped queries scope reasoning to that run only; endpoint never mutates trust_runs
- [ ] `trust_runs` append-only — no updates or deletes
- [ ] `trust_run_events` carries all lifecycle state: stale_flagged, refresh_triggered, refresh_completed, dispute_opened, dispute_closed
- [ ] Refresh endpoint enforces scope: L2 by company_id, L3/L5 by URI, L1 by snapshot availability
- [ ] Refresh writes supersession linkage and `refresh_completed` event to `trust_run_events`
- [ ] Proof360 confidence band mapping applied deterministically: ≥0.90 Strong, ≥0.70 Moderate, <0.70 Check original
- [ ] Proof360 surfaces stale warning and superseded notice with refresh CTA where applicable
- [ ] No internal fields exposed in product responses outside `full_internal` depth
