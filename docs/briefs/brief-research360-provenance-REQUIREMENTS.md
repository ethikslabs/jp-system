# Requirements Document

## Research360 · Provenance Engine  
### REQUIREMENTS v1.0 — Derived from Provenance Spec v3

---

## Introduction

The Provenance Engine is a core internal capability of Research360 that tracks the origin, transformation, and usage of all corpus data and reasoning outputs. It ensures that every chunk, query result, and Trust360 decision is traceable, auditable, and temporally accurate.

The Provenance Engine is not a user-facing system. It operates as an internal layer that products (e.g. Proof360, Fund360, jp-system) consume via controlled response shaping. No product exposes internal architecture constructs such as layers, chunk IDs, or ingestion mechanisms.

The system enforces:
- immutable decision records
- dual confidence tracking (extraction vs reasoning)
- freshness and lifecycle state tracking
- deterministic provenance shaping per product

---

## Glossary

- **Provenance Object**: Structured metadata attached to each chunk and query result describing origin, extraction, freshness, and reasoning usage.
- **Chunk**: A unit of indexed content stored in the Research360 corpus.
- **Extraction Confidence**: Pipeline-derived score (0–1) indicating reliability of source-to-text conversion.
- **Reasoning Confidence**: Trust360-derived score (0–1) indicating how strongly a chunk supports a conclusion in a specific reasoning step.
- **Evidence Layers (L1–L5)**: Persistent data sources (file, customer, web, API).
- **L4 (Transient Context)**: In-memory reasoning context, not persisted.
- **L6 (Decision Record)**: Immutable Trust360 run log.
- **Snapshot Policy**: Defines whether and how a chunk can be refreshed.
- **Freshness Policy**: Defines TTL and stale behavior for a chunk.
- **Supersession**: Lifecycle event where a chunk is replaced by a newer version.
- **Stale**: Freshness state indicating data may no longer be current.
- **Allowlist Response Model**: Product responses are constructed from explicit field allowlists.

---

## Requirements

### Requirement 1: Provenance Object Schema

**User Story:** As a system, I need every chunk and query result to carry a structured provenance object, so that origin, freshness, and reasoning usage are always traceable.

#### Acceptance Criteria

1. THE system SHALL attach a `provenance` object to every chunk and query result.
2. THE provenance object SHALL include `schema_version` set to "1.0".
3. THE provenance object SHALL include required structural fields for source, extraction, status, and reasoning.
4. THE system SHALL store timestamps in UTC and render in Australia/Sydney for presentation.

---

### Requirement 2: Confidence Model

1. THE system SHALL store extraction confidence (0–1).
2. THE system SHALL store reasoning confidence per usage.
3. THE system SHALL NOT collapse confidence scores.

---

### Requirement 3: Schema Authority

1. JSONB provenance SHALL be authoritative.
2. Indexed columns SHALL be synchronised at write.
3. Divergence SHALL treat columns as cache.

---

### Requirement 4: Source Taxonomy

1. All chunks SHALL include source_type and source_subtype.
2. Taxonomy SHALL be consistent and versioned.

---

### Requirement 5: Freshness

1. TTL-based stale detection SHALL be enforced.
2. Null TTL SHALL disable time-based staleness.
3. Fetch failures SHALL mark stale if configured.

---

### Requirement 6: Supersession

1. Old chunks SHALL be preserved.
2. Supersession SHALL be tracked bidirectionally.
3. Lineage SHALL be 1:1 in v1.

---

### Requirement 7: Snapshot Policy

1. snapshot_policy SHALL govern refresh behaviour.

---

### Requirement 8: Trust Runs

1. trust_runs SHALL be immutable.
2. Lifecycle SHALL be stored in trust_run_events.

---

### Requirement 9: Query Behaviour

1. Provenance SHALL always be returned.
2. reasoning SHALL be empty unless run_id provided.

---

### Requirement 10: Response Shaping

1. Allowlist model SHALL be enforced.
2. No internal fields SHALL leak.

---

### Requirement 11: Proof360 Surface

1. User-facing provenance SHALL be simplified.
2. Confidence SHALL map to bands.

---

### Requirement 12: Refresh

1. Refresh endpoint SHALL re-ingest and supersede.
2. History SHALL not be deleted.

---

### Requirement 13: Internal Boundary

1. Internal fields SHALL never be exposed externally.

---

## Status

Finalisation Candidate
