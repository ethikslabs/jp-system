# Signal360

**Status:** Live
**Purpose:** LinkedIn contact extraction → HubSpot CRM pipeline

## What it is
Extracts structured contact data from LinkedIn profiles and pushes to HubSpot with company association.

## Stack
- Node.js (Express/Fastify)
- Auth: Auth0 (username/password only, no social login)
- CRM: HubSpot private app

## Repos
- Local dev: `~/Dropbox/Projects/signal360`
- Platform copy: `~/Dropbox/Projects/ethikslabs-platform/services/signal360`
- **Always `cp` changed files to platform repo before committing. Never edit platform repo directly.**

## Infrastructure
- EC2: `ethikslabs-platform` (`i-010dc648d4676168e`)
- Port: 3001 | PM2 name: `signal360`
- URL: `platform.ethikslabs.com/hx/contacts/`
- Nginx routes `/hx/contacts/` → `localhost:3001`
- `.env` location on EC2: `/home/ec2-user/platform/services/signal360/.env`

## HubSpot integration notes
- Owner ID (John): `598121996`
- Contact→Company association type: `1`
- LinkedIn field: `hs_linkedin_url`
- All contacts pushed as `lifecyclestage: lead`
- Required scopes: contacts.write, owners.read, companies.read/write, notes.write

## Auth0
- Tenant: `dev-nfpt3dibp2qzchiq.au.auth0.com`
- Client ID: `CK1wjQsKZ1FPDUolXG5VLTdWbRI029QD`
- Behind Cloudflare Flexible SSL — requires trust proxy + sameSite Lax config

## Current state
- Running in production
