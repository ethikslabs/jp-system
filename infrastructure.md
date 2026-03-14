PROJECT: EthiksLabs
FOUNDER: John Coates
PURPOSE: R&D execution environment for systems that power the Ethiks360 platform.

CONCEPT:
EthiksLabs builds and validates AI-driven operational infrastructure before it becomes a product inside Ethiks360.

CORE PRINCIPLE:
SSOE (Single Source of Execution) — systems run here; SSOT systems provide data.

DOMAIN:
ethikslabs.com

EDGE / DNS:
Cloudflare
Nameservers: aida.ns.cloudflare.com, kyle.ns.cloudflare.com
SSL mode: Flexible
AI training bots: blocked

DNS RECORD:
ethikslabs.com → A → 54.252.185.132 (proxied)

ORIGIN:
AWS EC2
Region: ap-southeast-2 (Sydney)

ROUTING:
Cloudflare → EC2 → Nginx → Node.js backend

REPOSITORY:
github.com/ethikslabs/ethikslabs-core

DEV PATH (Mac):
~/Projects/ethikslabs/ethikslabs-core

SERVER PATH (EC2):
/home/ec2-user/ethikslabs/ethikslabs-core

BACKEND:
Node.js + Express
Manual execution via: node server.mjs

FRONTEND:
Vite + Svelte
Project: LabsGlass (real-time cockpit UI)

VOICE PIPELINE:
record → audio → STT → LLM → TTS → playback

STT:
AWS Transcribe

LLM:
AWS Bedrock
Claude 3.5 Sonnet

TTS:
Amazon Polly (Neural voices)

MODULES:
audio.mjs
stt.mjs
llm.mjs
tts.mjs
pipeline.mjs
logger.mjs

OBSERVABILITY:
Full execution logs in terminal + LabsGlass UI.

ENGINEERING DISCIPLINE:
DEP (Deterministic Engineering Protocol)
Modular design, explicit logs, no hidden state.

CORE ENGINES BEING BUILT:
Trust360 — trust evaluation engine
Research360 — knowledge ingestion + retrieval
Proof360 — founder trust assessment product

LONG TERM GOAL:
Convert company operations into continuous trust evidence queryable by founders, investors, partners, and enterprise buyers.
