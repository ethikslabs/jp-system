# Dashboard Signal Backlog

Captured: 2026-03-21
Source: Claude Code recommendation during signal wiring session

---

## The framing

The dashboard should answer the question a Series A investor or enterprise security team asks before signing — not just "is the system up?" but "is this team running a trustworthy operation?"

Proof360 gap velocity + secret rotation age + SSL health + Auth0 anomalies together tell that story in real time, without a deck.

---

## Security posture (high value, easy to wire)

- [ ] SSL expiry countdown per domain — days remaining, not just pass/fail
- [ ] Secret rotation age — days since each secret was last rotated (secrets/ folder already tracks this)
- [ ] Dependency vulnerability count — npm audit score as a daily pulse, trending up or down
- [ ] Failed auth attempts from Auth0 — spike = someone probing you

## Proof360 trust signals (the differentiated angle)

- [ ] Live trust score as a BPM-style number — if the score drops, the dashboard reacts
- [ ] Gap closure velocity — gaps closed this week vs last week
- [ ] Assessment completion rate — % of controls evidenced

## Operational credibility

- [ ] Uptime % rolling 30 days — calculated from existing health check pulses
- [ ] Mean time to deploy — derived from GitHub push → deployment_status events
- [ ] Incident open time — issue opened to closed, for anything tagged bug

## Customer-facing trust

- [ ] API error rate to external callers — 4xx/5xx ratio, not just internal health
- [ ] Data residency confirmation — daily pulse confirming AWS region for customer data

---

## Already built / in progress

- [x] GitHub webhooks — push, PR, deployment, issues
- [x] AWS EC2 health — instance state polling
- [x] AWS costs — Cost Explorer monthly by service
- [x] GuardDuty — enabled, findings polling (compliance-poller)
- [x] Open security groups — port 22, 5432 exposed (compliance-poller)
- [x] Unencrypted EBS volumes — (compliance-poller)
- [x] IAM users without MFA — (compliance-poller)
- [x] Cloudflare zone analytics + SSL — (cloudflare-poller)
- [ ] Stripe webhooks
- [ ] Auth0 webhooks
- [ ] Proof360 signals

---

## Priority order (recommendation)

1. Auth0 failed login anomalies — security + investor story, easy webhook
2. Stripe webhooks — real revenue signal, investor lens
3. Secret rotation age — pull from secrets/ folder, no external API needed
4. SSL days remaining — already have Cloudflare SSL status, just add days_remaining
5. npm audit daily pulse — single command, high trust signal
6. Proof360 live trust score — connect the two products
