# Signal360 — Project Room

*This file powers the Project Room view in the jp-system dashboard.*
*Owner: John Coates. Update when meaningful facts change.*

---

## identity

slug: signal360
name: Signal360
tagline: LinkedIn contact extraction to CRM pipeline
lifecycle: live
url: https://platform.ethikslabs.com/hx/contacts/
repo: ~/Dropbox/Projects/signal360
color: purple

---

## problem

Turning LinkedIn connections into actionable CRM records is manual, slow, and inconsistent. Sales and BD teams waste hours copying profile data into HubSpot. The signal exists — the extraction doesn't.

---

## solution

Signal360 extracts structured contact data from LinkedIn profiles and pushes it directly to HubSpot with company association, lifecycle stage, and owner assignment. One click, full contact record.

---

## market

- **Category:** Sales intelligence / CRM automation
- **Comparable:** Apollo.io, LinkedIn Sales Navigator export, Clay
- **Differentiation:** Direct LinkedIn → HubSpot pipeline, no intermediate tool
- **Internal first:** Running in production for EthiksLabs, validates the pattern before productisation

---

## moat

- Auth0-gated — clean identity layer from day one
- HubSpot private app integration — no OAuth complexity for end users
- Extensible: the extraction pattern works for any structured profile source

---

## traction

- Running in production on EC2
- Used internally for EthiksLabs contact pipeline

---

## graduation criteria

Signal360 is already `live` — the question is whether it graduates to Ethiks360 as a standalone product or gets absorbed into the broader platform.

Decision pending:
- [ ] Define whether Signal360 is a standalone product or a feature of Ethiks360
- [ ] If standalone: define commercial model + GTM
- [ ] If feature: integrate into Ethiks360 platform layer

---

## stack

```
API:   Node.js (Express/Fastify)
Auth:  Auth0 (username/password only, no social login)
CRM:   HubSpot private app
Infra: EC2 ethikslabs-platform, port 3001, PM2
```

---

## infrastructure

- EC2: `ethikslabs-platform` (`i-010dc648d4676168e`)
- PM2 name: `signal360`
- Nginx: `/hx/contacts/` → `localhost:3001`
- `.env`: `/home/ec2-user/platform/services/signal360/.env`

---

*Last updated: 2026-03-21*
