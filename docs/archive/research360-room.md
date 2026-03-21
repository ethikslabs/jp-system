# Research360 — Project Room

*This file powers the Project Room view in the jp-system dashboard.*
*Owner: John Coates. Update when meaningful facts change.*

---

## identity

slug: research360
name: Research360
tagline: Knowledge ingestion and retrieval engine
lifecycle: lab
url: https://research360.ethikslabs.com
repo: ~/Dropbox/Projects/research360
color: blue

---

## problem

AI products need to reason over large, heterogeneous bodies of knowledge — documents, transcripts, web content, video — but building the ingestion, chunking, embedding, and retrieval layer from scratch is a multi-month engineering project before any product logic can run.

Every AI product in the 360 stack needs this layer. Building it once, correctly, is the foundation.

---

## solution

Research360 is a knowledge ingestion and retrieval engine. It ingests documents, web pages, YouTube transcripts, and audio; extracts structured content; chunks and embeds it; and makes it queryable via semantic search and reasoning.

It serves two purposes simultaneously:
1. **John's personal knowledge management system** — everything important ingested, queryable, permanent
2. **Platform layer for vendor partners** — demonstrable infrastructure that Proof360 and other products run on top of

---

## the unique insight

Research360 is not a product. It's the engine that makes products possible.

Proof360 is the first product built on top of it. Every subsequent 360 product uses the same ingestion, embedding, and retrieval layer. The engine stays private. The products are what get sold.

This is the same pattern as Trust360: private engine, public product surface.

---

## market

- **Category:** RAG infrastructure / knowledge management platform
- **Adjacent to:** Notion AI, Mem, Obsidian, enterprise knowledge bases
- **Differentiation:** Not a note-taking tool. A reasoning substrate. Built for AI-native products, not human writing workflows.
- **Internal first:** Validates the platform before any external sales motion

---

## moat

- **pgvector on Postgres** — keeps the knowledge store in the same database as everything else. No separate vector DB dependency.
- **Multi-modal ingestion** — documents, web pages, YouTube (yt-dlp + Whisper), audio. One pipeline, all formats.
- **Claude Sonnet as reasoning layer** — not just retrieval, but reasoning over retrieved chunks.
- **Unstructured.io + Playwright** — production-grade extraction, not naive text scraping.

---

## traction

- Running in production at research360.ethikslabs.com
- Full local stack confirmed end-to-end
- Proof360 is the first application consuming it

---

## graduation criteria

To move from `lab` → `validated`:
- [ ] Proof360 fully integrated — all signal extraction running through Research360
- [ ] 1,000+ documents ingested and queryable
- [ ] Query latency < 2s p95
- [ ] Demo-ready for vendor partner conversations

To move from `validated` → `authorised`:
- [ ] Commercial model defined (API access tier, usage-based billing via Metronome)
- [ ] John explicitly confirms authorised

---

## stack

```
API:       Fastify (Node.js)
Database:  Postgres + pgvector (RDS)
Queue:     BullMQ + Redis
Storage:   S3 (research360-ethikslabs, ap-southeast-2)
Embed:     OpenAI text-embedding-3-large
Extract:   Unstructured.io + Playwright + yt-dlp + Whisper
Reasoning: Claude Sonnet
Infra:     Docker Compose (local), EC2 (production)
```

---

## infrastructure

- EC2: `ethikslabs-platform` (`i-010dc648d4676168e`, `13.237.68.89`)
- Nginx: `research360.ethikslabs.com` → `localhost:8081`
- Deploy: `bash deploy.sh` from `/home/ec2-user/research360` on EC2
- Secrets: SSM under `/research360/*`

---

*Last updated: 2026-03-21*
