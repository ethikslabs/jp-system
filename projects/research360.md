# Research360

**Status:** Live — demo bar, not full MVP
**Target:** Demo-ready for vendor partners
**Launch goal:** 1 July 2026

## What it is
Knowledge ingestion and retrieval engine. Ingests documents, extracts structured content, embeds, and makes it queryable.

## Pipeline
`ingest → extract → transform → chunk → embed → retrieve → reason`

## Stack
- API: Fastify (Node.js)
- Frontend: Vite + React
- Database: Postgres + pgvector
- Queue: BullMQ + Redis
- Storage: S3 (`research360-ethikslabs`, ap-southeast-2)
- Containers: Docker Compose

## Repos
- Product: `~/Dropbox/Projects/research360`

## Infrastructure
- Live: `https://research360.ethikslabs.com`
- EC2: `ethikslabs-platform` (`i-010dc648d4676168e`, `13.237.68.89`)
- Nginx routes `research360.ethikslabs.com` → `localhost:8081`
- Deploy: `bash deploy.sh` from `/home/ec2-user/research360` on EC2
- Secrets: SSM under `/research360/*`

## Local dev
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Storage: MinIO (`S3_ENDPOINT=http://localhost:9000`, key=minioadmin)
- Compose: `docker-compose.yml`

## Current state
- Running in production
- Workers use separate BullMQ queues per stage

## Next actions
- Bring to demo-ready bar (same as Proof360 target)
