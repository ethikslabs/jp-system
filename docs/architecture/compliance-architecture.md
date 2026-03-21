# Compliance Architecture
EthiksLabs — Founder SIEM Compliance Layer
Status: PLAN ONLY — do not build without John explicitly confirming

---

## The insight

Vanta pulls from 400+ systems and surfaces compliance posture in one place.
The jp-system dashboard does the same thing — starting with your own stack,
eventually generalising into Ethiks360 as a product.

Every compliance signal follows the same path:
```
External system → poller → canonical pulse → ingest → dashboard lens
```

No special compliance schema. No separate database. Pulses with
`tags: ['compliance', ...]` and `severity: warning|critical` are
the compliance layer. The CISO lens surfaces them.

---

## Poller contract

Every integration must implement this interface — no exceptions:

```js
// api/src/services/<source>-poller.js

export function start<Source>Poller({ pool, redis })
  // Starts all polling intervals for this source
  // Returns { stop() }

export function stop<Source>Poller(handle)
  // Calls handle.stop() — clears all intervals
```

Wired into index.js alongside aws-poller, cloudflare-poller, compliance-poller.
Added to shutdown() for clean teardown.

---

## Credential storage pattern

All credentials stored in AWS SSM Parameter Store.
Read once at poller startup — never hardcoded, never in .env (except local dev).

| Source | SSM path |
|---|---|
| Cloudflare | /cloudflare/api-token |
| GitHub | /github/webhook-secret |
| Stripe | /stripe/api-key, /stripe/webhook-secret |
| HubSpot | /hubspot/api-key |
| Azure | /azure/tenant-id, /azure/client-id, /azure/client-secret |
| Xero | /xero/client-id, /xero/client-secret, /xero/refresh-token |
| Auth0 | /auth0/domain, /auth0/client-id, /auth0/client-secret |
| Trello | /trello/api-key, /trello/token |

OAuth tokens (Xero) stored as refresh tokens in SSM.
A token refresher runs before each poll cycle.

---

## Integration roadmap

### Tier 1 — API key, polling, high signal value
Build these first. Simple, no OAuth, immediate compliance value.

**Stripe**
- Signal: failed charges, dispute rate, subscription churn, PCI indicators
- Method: webhook (same pattern as GitHub) + REST polling for history
- Compliance: PCI DSS indicators, revenue integrity
- Personas: Investor (revenue), CISO (PCI), Founder (all)
- SSM: /stripe/api-key, /stripe/webhook-secret
- Sandbox: yes — set up ethikslabs Stripe in test mode first

**HubSpot**
- Signal: new contacts, lifecycle changes, deal stages, GDPR consent
- Method: polling (no native webhooks in free tier)
- Compliance: GDPR consent records, data retention
- Personas: Founder (pipeline), Investor (growth), Board (pipeline)
- SSM: /hubspot/api-key

**Auth0**
- Signal: login events, new accounts, MFA status, suspicious activity
- Method: Auth0 Log Streams → webhook endpoint (POST /webhooks/auth0)
- Compliance: access control, MFA enforcement, anomalous logins
- Personas: CISO (access), Founder (users)
- SSM: /auth0/domain, /auth0/management-token

**Trello**
- Signal: card moves, overdue cards, compliance task completion
- Method: polling + Trello webhooks
- Compliance: open security issues, overdue tasks
- Personas: Founder (ops), CISO (open issues)
- SSM: /trello/api-key, /trello/token

### Tier 2 — Multi-cloud, higher value, slightly more setup

**Azure**
- Signal: Defender for Cloud secure score, policy compliance %, active alerts
- Method: REST polling via service principal
- Compliance: SOC 2, ISO 27001 controls via Defender recommendations
- Personas: CISO (security posture), Board (multi-cloud health)
- SSM: /azure/tenant-id, /azure/client-id, /azure/client-secret
- Credits: MS for Startups — use these
- GRC value:
  - Secure Score = single number for board/investor
  - Recommendations = specific failing controls for CISO
  - Alerts = active threats equivalent to GuardDuty
  - Policy compliance = % resources compliant per framework

**GitHub Advanced Security**
- Signal: secret scanning alerts, dependency vulnerabilities, code scanning
- Method: REST polling (token already in SSM)
- Compliance: secrets exposure, CVE exposure in dependencies
- Personas: CISO (vulnerabilities), Founder (code health)
- SSM: /github/token

### Tier 3 — OAuth required, more complex

**Xero**
- Signal: invoice status, overdue payments, P&L summary, cashflow
- Method: OAuth 2.0 (Xero forces this, no API key option)
- Compliance: financial controls, audit trail
- Personas: Investor (financials), Board (cashflow), Founder (cash)
- Build OAuth flow + refresh token storage in SSM
- Note: build after all Tier 1 and Tier 2 are done

---

## Compliance scoring model (future)

Each source contributes to a compliance score per framework:

```
SOC 2 Type II
├── CC6.1 Logical access        → Auth0 MFA, IAM users without MFA
├── CC6.6 External threats      → GuardDuty findings, Defender alerts
├── CC7.2 System monitoring     → CloudTrail enabled, Azure Monitor
├── CC8.1 Change management     → GitHub branch protection, secret scanning
└── A1.2  System availability   → EC2 health, uptime checks

Score = passing_controls / total_controls * 100
```

Surfaces as a single number in the CISO and Board lenses.
GapCard component already exists for surfacing failing controls.

---

## What "Vanta lite" means at scale

```
Today:        your own stack, ~10 sources, personal SIEM
Ethiks360:    multi-tenant, each customer connects their own sources
```

Each source = one poller module implementing the contract above.
New source = new poller file, new SSM paths, mount in index.js.
The dashboard IS the Ethiks360 compliance product in embryo.
Every integration built here gets reused there.

---

## Build order (when ready)

1. Stripe         — highest investor/founder signal, webhook pattern known
2. HubSpot        — pipeline visibility, GDPR compliance signal
3. Auth0          — access control compliance, already in the stack
4. Azure          — multi-cloud GRC story, Defender secure score
5. GitHub Adv Sec — vulnerability exposure
6. Trello         — ops compliance, overdue security tasks
7. Xero           — financial controls (OAuth complexity, do last)

---

## Notes

- Do not build any of this until John explicitly says "build X"
- This document is the plan, not the brief
- When ready to build a source, write docs/brief-<source>-poller.md
  following the pattern of brief-dashboard-api.md
- Run Phase 0 convergence loop for any source touching OAuth or
  financial data (Xero especially)

---
*Written: 2026-03-21*
*Owner: John Coates — thinking capture only, not authorised for build*
*Status: PLAN — do not build*
