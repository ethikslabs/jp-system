// Static project room data — parsed from /projects/*-room.md files.
// Update these when the source files change.

export const LIFECYCLE_COLOR = {
  lab:        '#6B7280',
  public:     '#60A5FA',
  validated:  '#2DD4BF',
  authorised: '#FBBF24',
  live:       '#10B981',
  archived:   '#374151',
}

export const PROJECT_ROOMS = {
  proof360: {
    slug: 'proof360',
    name: 'Proof360',
    tagline: 'Trust intelligence for founders',
    lifecycle: 'lab',
    url: 'https://proof360.au',
    repo: null,
    github: null, // set to e.g. 'https://github.com/ethikslabs/proof360' when repo is public
    color: '#2DD4BF',

    problem: `Founders operate in opacity.

When they approach vendors, partners, or investors — they have no structured way to present their operating posture. The evidence exists — compliance tools, cloud infrastructure, team structure, governance docs — but it's messy, scattered, and unreadable by anyone outside the organisation.

The result: founders get asked the same questions repeatedly, can't close vendor deals efficiently, and lose investor credibility not because of what they've built but because they can't prove it.

Every existing tool assesses the stack. Nobody assesses the founder running it. That gap is where trust actually breaks down.`,

    solution: `Proof360 converts messy operating evidence into structured trust output.

A founder enters their website URL. Proof360 extracts signals, builds an inference model, identifies gaps against known frameworks, maps vendor recommendations, and produces a report that vendors and partners can act on.

The output: a trust score, a gap map, a vendor recommendation layer, and — uniquely — a founder profile that shows the person behind the product.

The founder goes from chaos to calm, clear, and actionable. The partner gets a high-signal, pre-qualified lead with full context.`,

    insight: `Every trust tool assesses the stack. Proof360 is the only tool that assesses the founder.

The founder_trust gap fires for every founder by default. It surfaces a ReachLX 10-question leadership profile as a free teaser in the report. The full 95-question profile is the upsell. In the investor deal room, the founder profile sits alongside the technical trust score.

Nobody else has this layer. This is the moat.`,

    market: `- **Category:** GRC (Governance, Risk, Compliance) automation + founder trust
- **Global GRC market:** $4.2B, growing
- **Vanta** validated the category at $1B valuation — but serves enterprise, not founders
- **ANZ entry point:** underserved, strong Ingram Micro / Dicker Data distribution network already engaged
- **Wedge:** Founder trust layer creates a category that doesn't exist yet

Adjacent markets: investor due diligence tooling, vendor onboarding / partner portals, founder credentialing.`,

    moat: `- **Trust360** — the reasoning engine — is private forever. It never ships. Proof360 is the product built on top.
- **Vendor neutrality** — gap-to-vendor matching logic is defensibly neutral. Revenue is a consequence of trust, not the other way around.
- **Persona model** — Bob, Leonardo, Edison, Sophia — the cognitive operating system. Not a feature, a foundation.
- **Partner portal** — high-signal leads, pre-qualified, context-rich. Partners get fewer leads but better ones. That's the pitch to Ingram.`,

    traction: `- Live at proof360.au
- Ingram Micro ANZ AM saw live demo — wants meeting with ANZ MD
- Deliberate strategy: scarcity. Not chasing the engagement.
- Lunch with Paul Findlay (ReachLX CEO) scheduled — designing the 10-question investor-framed teaser
- CognitiveView (Dilip Mohapatra) conversation pending — AI governance gap`,

    graduation_criteria: [
      { text: 'ReachLX 10-question teaser integrated and live in report', done: false },
      { text: 'Vendor graph engine live (capability tiles → vendor resolution → distributor routing)', done: false },
      { text: 'Ingram Micro wiring complete (real token, not mock)', done: false },
      { text: 'Partner portal live for first vendor partner', done: false },
      { text: '10 completed founder assessments', done: false },
      { text: 'Ingram ANZ MD meeting completed', done: false },
      { text: 'Commercial model agreed with at least one distribution partner', done: false },
      { text: 'SOC 2 Type II gap addressed or waived for launch', done: false },
    ],

    stack: `Frontend:  React + Vite — proof360.au
API:       Fastify (Node.js)
Reasoning: Trust360 (external engine — private boundary)
Scraping:  Firecrawl + Claude Haiku (signal extraction)
Vendors:   vendors.js catalog (30+ vendors, 9 categories)
Gaps:      gaps.js (founder_trust added — fires by default)`,

    docs: [
      { name: 'architecture.md', description: 'System design' },
      { name: 'brief-strategy.md', description: 'Product strategy + moat argument' },
      { name: 'brief-vendors.md', description: 'Vendor intelligence spec' },
      { name: 'brief-vendor-graph.md', description: 'Capability abstraction + distributor routing' },
      { name: 'proof360-principle.md', description: 'System principle (locked)' },
      { name: 'proof360-founder-experience.md', description: 'UX principle (locked)' },
    ],

    relationships: [
      { person: 'Paul Findlay', company: 'ReachLX', role: 'CEO (mate, ex-coach)', status: 'Lunch scheduled' },
      { person: 'Dilip Mohapatra', company: 'CognitiveView', role: 'CEO', status: 'Conversation pending' },
      { person: 'Ingram AM', company: 'Ingram Micro ANZ', role: 'Account Manager', status: 'Saw demo, wants MD intro' },
      { person: 'Ingram ANZ MD', company: 'Ingram Micro ANZ', role: 'Managing Director', status: 'Meeting pending' },
    ],
  },

  research360: {
    slug: 'research360',
    name: 'Research360',
    tagline: 'Knowledge ingestion and retrieval engine',
    lifecycle: 'lab',
    url: 'https://research360.ethikslabs.com',
    repo: null,
    github: null,
    color: '#60A5FA',

    problem: `AI products need to reason over large, heterogeneous bodies of knowledge — documents, transcripts, web content, video — but building the ingestion, chunking, embedding, and retrieval layer from scratch is a multi-month engineering project before any product logic can run.

Every AI product in the 360 stack needs this layer. Building it once, correctly, is the foundation.`,

    solution: `Research360 is a knowledge ingestion and retrieval engine. It ingests documents, web pages, YouTube transcripts, and audio; extracts structured content; chunks and embeds it; and makes it queryable via semantic search and reasoning.

It serves two purposes simultaneously:
1. John's personal knowledge management system — everything important ingested, queryable, permanent
2. Platform layer for vendor partners — demonstrable infrastructure that Proof360 and other products run on top of`,

    insight: `Research360 is not a product. It's the engine that makes products possible.

Proof360 is the first product built on top of it. Every subsequent 360 product uses the same ingestion, embedding, and retrieval layer. The engine stays private. The products are what get sold.

This is the same pattern as Trust360: private engine, public product surface.`,

    market: `- **Category:** RAG infrastructure / knowledge management platform
- **Adjacent to:** Notion AI, Mem, Obsidian, enterprise knowledge bases
- **Differentiation:** Not a note-taking tool. A reasoning substrate. Built for AI-native products, not human writing workflows.
- **Internal first:** Validates the platform before any external sales motion`,

    moat: `- **pgvector on Postgres** — keeps the knowledge store in the same database as everything else. No separate vector DB dependency.
- **Multi-modal ingestion** — documents, web pages, YouTube (yt-dlp + Whisper), audio. One pipeline, all formats.
- **Claude Sonnet as reasoning layer** — not just retrieval, but reasoning over retrieved chunks.
- **Unstructured.io + Playwright** — production-grade extraction, not naive text scraping.`,

    traction: `- Running in production at research360.ethikslabs.com
- Full local stack confirmed end-to-end
- Proof360 is the first application consuming it`,

    graduation_criteria: [
      { text: 'Proof360 fully integrated — all signal extraction running through Research360', done: false },
      { text: '1,000+ documents ingested and queryable', done: false },
      { text: 'Query latency < 2s p95', done: false },
      { text: 'Demo-ready for vendor partner conversations', done: false },
      { text: 'Commercial model defined (API access tier, usage-based billing via Metronome)', done: false },
    ],

    stack: `API:       Fastify (Node.js)
Database:  Postgres + pgvector (RDS)
Queue:     BullMQ + Redis
Storage:   S3 (research360-ethikslabs, ap-southeast-2)
Embed:     OpenAI text-embedding-3-large
Extract:   Unstructured.io + Playwright + yt-dlp + Whisper
Reasoning: Claude Sonnet
Infra:     Docker Compose (local), EC2 (production)`,

    docs: [],
    relationships: [],
  },

  signal360: {
    slug: 'signal360',
    name: 'Signal360',
    tagline: 'LinkedIn contact extraction to CRM pipeline',
    lifecycle: 'live',
    url: 'https://platform.ethikslabs.com/hx/contacts/',
    repo: null,
    github: null,
    color: '#A78BFA',

    problem: `Turning LinkedIn connections into actionable CRM records is manual, slow, and inconsistent. Sales and BD teams waste hours copying profile data into HubSpot. The signal exists — the extraction doesn't.`,

    solution: `Signal360 extracts structured contact data from LinkedIn profiles and pushes it directly to HubSpot with company association, lifecycle stage, and owner assignment. One click, full contact record.`,

    insight: `The extraction pattern works for any structured profile source. Signal360 is the proof-of-concept that it's fast to build and fast to validate. The question now is whether it becomes a standalone product or a feature inside Ethiks360.`,

    market: `- **Category:** Sales intelligence / CRM automation
- **Comparable:** Apollo.io, LinkedIn Sales Navigator export, Clay
- **Differentiation:** Direct LinkedIn → HubSpot pipeline, no intermediate tool
- **Internal first:** Running in production for EthiksLabs, validates the pattern before productisation`,

    moat: `- Auth0-gated — clean identity layer from day one
- HubSpot private app integration — no OAuth complexity for end users
- Extensible: the extraction pattern works for any structured profile source`,

    traction: `- Running in production on EC2
- Used internally for EthiksLabs contact pipeline`,

    graduation_criteria: [
      { text: 'Define whether Signal360 is a standalone product or a feature of Ethiks360', done: false },
      { text: 'If standalone: define commercial model + GTM', done: false },
      { text: 'If feature: integrate into Ethiks360 platform layer', done: false },
    ],

    stack: `API:   Node.js (Express/Fastify)
Auth:  Auth0 (username/password only, no social login)
CRM:   HubSpot private app
Infra: EC2 ethikslabs-platform, port 3001, PM2`,

    docs: [],
    relationships: [],
  },

  'fund360': {
    slug: 'fund360',
    name: 'Fund360',
    tagline: 'RAG-based investment analysis',
    lifecycle: 'lab',
    url: null,
    repo: null,
    github: null,
    color: '#34D399',

    problem: `Investment analysis is slow, inconsistent, and doesn't scale. Analysts spend hours reading PDFs, earnings calls, and filings to form views that are biased by recency and availability of information.`,

    solution: `Fund360 is a RAG-based investment analysis engine. It ingests documents, earnings transcripts, and research; builds a hypothesis registry; and uses Claude + pgvector to reason over a structured knowledge base to produce consistent, sourced investment views.`,

    insight: `The hypothesis registry is the core moat. Every investment thesis is tracked, tested, and updated as new data arrives. The engine doesn't just answer questions — it maintains a live model of the world.`,

    market: `- **Category:** Investment research automation
- **Adjacent to:** Bloomberg, FactSet, Tegus — but at 1% of the cost
- **Internal first:** Validates the platform before any external product motion`,

    moat: `- **pgvector on Postgres** — same infrastructure as Research360, no separate vector DB
- **Hypothesis registry** — structured, testable investment views, not just retrieval
- **Claude Sonnet reasoning** — not just search, but synthesis over retrieved context
- **Edison persona** — the cognitive operating model for investment analysis`,

    traction: `- Local stack running
- Integrated with Research360 as data substrate`,

    graduation_criteria: [
      { text: 'Hypothesis registry schema defined and populated', done: false },
      { text: '100+ documents ingested and queryable', done: false },
      { text: 'First full investment memo generated end-to-end', done: false },
      { text: 'Commercial model defined', done: false },
    ],

    stack: `API:       Fastify (Node.js)
Database:  Postgres + pgvector (shared with Research360)
Queue:     BullMQ + Redis
Embed:     OpenAI text-embedding-3-large
Reasoning: Claude Sonnet (Edison persona)
Infra:     Docker Compose`,

    docs: [],
    relationships: [],
  },

  'trust360': {
    slug: 'trust360',
    name: 'Trust360',
    tagline: 'Private reasoning engine — never ships',
    lifecycle: 'lab',
    url: null,
    repo: null,
    github: null,
    color: '#818CF8',

    problem: `AI trust evaluation is inconsistent — different models, different prompts, different conclusions. There is no framework for producing reliable, auditable trust assessments at scale.`,

    solution: `Trust360 is a 6-stage multi-LLM ensemble pipeline that produces consensus trust scores. It runs createContext → buildPrompt → runLLMEnsemble → parseOutputs → computeConsensus → buildResponse. The reasoning engine is private. Proof360 is the product built on top.`,

    insight: `Trust360 never ships as a product. It is the private engine that makes Proof360 defensible. The moat is that the reasoning layer is inaccessible to competitors — they can copy the UI but not the engine.`,

    market: `- **Internal use only** — private boundary, never productised directly
- **Powers:** Proof360 trust scoring and gap analysis`,

    moat: `- **6-stage ensemble** — not a single LLM call, a structured pipeline with validation at each stage
- **25 property-based tests** — vitest, ensures pipeline stability
- **Private forever** — the engine is the moat`,

    traction: `- Running in production
- Proof360 is the first application consuming it
- 25 property-based tests passing`,

    graduation_criteria: [
      { text: 'Proof360 fully wired to Trust360 (real API calls, not mock)', done: false },
      { text: 'Pipeline latency < 10s p95', done: false },
      { text: 'Consensus scoring validated against known test cases', done: false },
    ],

    stack: `Pipeline: 6-stage (createContext → buildPrompt → runLLMEnsemble → parseOutputs → computeConsensus → buildResponse)
LLMs:     OpenAI + Anthropic ensemble
Tests:    25 property-based tests (vitest)
Entry:    src/pipeline.js + src/stages/`,

    docs: [],
    relationships: [],
  },

  'ethikslabs-core': {
    slug: 'ethikslabs-core',
    name: 'EthiksLabs Core',
    tagline: 'Voice pipeline and labs hub',
    lifecycle: 'live',
    url: 'https://ethikslabs.com',
    repo: null,
    github: 'https://github.com/ethikslabs/ethikslabs-core',
    color: '#F472B6',

    problem: `Early voice AI demos were one-off scripts. No reusable pipeline, no production deployment, no way to iterate quickly.`,

    solution: `EthiksLabs Core is the original voice pipeline and public hub. AWS Transcribe (STT) → Bedrock Claude 3.5 Sonnet (LLM) → Amazon Polly (TTS). It runs on EC2 behind Cloudflare and serves as the ethikslabs.com entry point.`,

    insight: `Core validates the deployment pattern. Every new service gets deployed to EC2 via PM2 using the same Nginx/Cloudflare pattern established here.`,

    market: `- **Internal infrastructure** — deployment pattern, not a product`,

    moat: `- **Established deployment pattern** — Cloudflare → Nginx → PM2 → Node.js
- **EC2 + SSM** — no SSH exposure, all access via SSM`,

    traction: `- Live at ethikslabs.com
- Voice pipeline running in production
- Deployment pattern used by all subsequent services`,

    graduation_criteria: [
      { text: 'Voice pipeline documented end-to-end', done: false },
      { text: 'Deployment script tested on clean EC2', done: false },
    ],

    stack: `STT:    AWS Transcribe
LLM:    AWS Bedrock (Claude 3.5 Sonnet)
TTS:    Amazon Polly
Infra:  EC2 ap-southeast-2, Nginx, PM2
Entry:  server.mjs
Deploy: scripts/deploy-ec2.sh`,

    docs: [
      { name: 'run-local.sh', description: 'Start voice pipeline locally' },
      { name: 'scripts/deploy-ec2.sh', description: 'Deploy to EC2' },
    ],
    relationships: [],
  },

  'ethikslabs-platform': {
    slug: 'ethikslabs-platform',
    name: 'EthiksLabs Platform',
    tagline: 'Promoted services — Nginx + PM2 + EC2',
    lifecycle: 'live',
    url: 'https://platform.ethikslabs.com',
    repo: null,
    github: null,
    color: '#FB923C',

    problem: `Individual services (Signal360, etc.) need a consistent, production-grade deployment host. Managing each service's Nginx config and PM2 process independently creates drift.`,

    solution: `EthiksLabs Platform is the deployment host for all promoted services. Nginx routes per service, PM2 manages processes, GitHub Actions deploys on push to main. Deploy any service with one script.`,

    insight: `Platform is the ops layer that makes it safe to ship. Nothing ships to production without going through Platform's deployment process.`,

    market: `- **Internal infrastructure** — not a product`,

    moat: `- **Consistent deployment pattern** — all services follow the same Nginx/PM2/EC2 model
- **GitHub Actions CI** — automated deployment on push to main`,

    traction: `- Signal360 live on Platform
- Central-Spark live on Platform`,

    graduation_criteria: [
      { text: 'All live services documented in Platform', done: false },
      { text: 'Health checks for all PM2 processes', done: false },
    ],

    stack: `Host:    EC2 ap-southeast-2 (54.252.185.132)
Routing: Nginx (per-service vhosts)
Process: PM2
CI/CD:   GitHub Actions (push to main)
Deploy:  scripts/deploy.sh <service>`,

    docs: [],
    relationships: [],
  },

  'central-spark': {
    slug: 'central-spark',
    name: 'Central Spark',
    tagline: 'Static site — centralsparkpsychotherapy.com.au',
    lifecycle: 'live',
    url: 'https://centralsparkpsychotherapy.com.au',
    repo: null,
    github: null,
    color: '#A3E635',

    problem: `A psychology practice needed a clean, professional web presence. No CMS overhead, no database, just a fast, maintainable static site.`,

    solution: `Single-file static site deployed on EC2 via the EthiksLabs Platform deployment pattern. Zero dependencies, zero runtime. Just HTML/CSS/JS.`,

    insight: `The simplest solution is often the right one. Single-file static sites load instantly, never break, and require no maintenance.`,

    market: `- **Client work** — not an EthiksLabs product`,

    moat: null,
    traction: `- Live at centralsparkpsychotherapy.com.au`,

    graduation_criteria: [
      { text: 'Site live and verified', done: true },
    ],

    stack: `Type:   Single-file static HTML/CSS/JS
Host:   EC2 via EthiksLabs Platform
DNS:    Cloudflare`,

    docs: [],
    relationships: [],
  },

  'ethiks360-master': {
    slug: 'ethiks360-master',
    name: 'Ethiks360',
    tagline: 'Pitch docs, pricing pages, homepage',
    lifecycle: 'lab',
    url: null,
    repo: null,
    github: null,
    color: '#E879F9',

    problem: `The Ethiks360 product story needs a public-facing home — pricing pages, pitch decks, and a homepage HTML that can be deployed independently of the product itself.`,

    solution: `Ethiks360 Master holds the marketing and pitch layer: pricing pages, homepage HTML, and pitch documentation. Separate from the platform so the story can evolve without touching the product.`,

    insight: `Story and product should be decoupled. The story moves faster than the product.`,

    market: `- **Internal** — marketing and pitch assets for Ethiks360 product`,

    moat: null,
    traction: `- Pitch docs in progress`,

    graduation_criteria: [
      { text: 'Homepage live', done: false },
      { text: 'Pricing page live', done: false },
      { text: 'Pitch deck complete', done: false },
    ],

    stack: `Type: Static HTML/CSS + markdown docs`,

    docs: [],
    relationships: [],
  },

  civique: {
    slug: 'civique',
    name: 'Civique',
    tagline: 'Strata management transparency — owners first',
    lifecycle: 'lab',
    url: null,
    repo: null,
    github: null,
    color: '#FBBF24',

    problem: `Strata management is opaque. Owners — the people who actually own the building — have almost no visibility into how their money is being spent, what decisions are being made, or whether their strata manager is acting in their interest.

Strata managers are appointed by committees, communicate via infrequent meetings and dense PDFs, and operate with minimal accountability to individual owners. The information asymmetry is enormous and almost entirely structural.`,

    solution: `Civique gives strata owners real-time visibility into what's happening in their building. Meeting minutes, maintenance requests, levy spend, and committee decisions — structured, searchable, and surfaced without requiring owners to chase anyone.

The strata manager doesn't change. The owner's relationship to their own building does.`,

    insight: `The competition is not other strata software — it's the current process, which is opaque by default.

GTM is owners-first. Not strata managers, not committees, not property developers. Individual owners who are frustrated and have no tool. That's the wedge.

When enough owners in a building use Civique, the strata manager has no choice but to engage with the platform. The supply side follows the demand side.`,

    market: `- **Category:** PropTech / strata management transparency
- **Australia:** 3.5M+ strata lots nationally, growing
- **Current tools:** Stratabox, StrataVote — all manager-facing, none owner-facing
- **Regulation:** NSW strata laws increasingly mandate disclosure — tailwind
- **Journalism angle:** Known journalist contact for PR distribution at launch`,

    moat: `- **Owners-first GTM** — bypasses the strata manager gatekeeping problem entirely
- **Same engine as Proof360** — Research360 for document ingestion, Trust360 for reasoning over strata documents
- **Network effect** — once one owner in a building is on Civique, recruiting others is easy
- **Regulatory tailwind** — disclosure requirements create demand pull`,

    traction: `- Concept validated — GTM strategy defined (owners-first, journalist relationship for PR)
- No code built yet
- Parallel test case for the Ethiks360 platform alongside Proof360`,

    graduation_criteria: [
      { text: 'MVP built — owner can log in, see their building\'s documents structured and searchable', done: false },
      { text: 'One building onboarded (could be John\'s own building)', done: false },
      { text: 'Journalist briefed for PR distribution', done: false },
      { text: '50+ active owners across 3+ buildings', done: false },
      { text: 'One strata manager engaged (inbound, not outbound)', done: false },
      { text: 'Media coverage published', done: false },
    ],

    stack: `Same platform as Proof360:
- Research360 for document ingestion (meeting minutes, reports, levies)
- Trust360 for reasoning over structured strata data
- React + Vite frontend
- Fastify API`,

    docs: [],
    relationships: [],
  },
}
