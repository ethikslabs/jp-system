# Current Task

**Status:** IN PROGRESS

**Task:** Real signal sources — wiring live data into the dashboard

## What was completed this session (2026-03-21)

### Dashboard v1.0 — fully working
- Heart beats, lens switching, component grid populating from Claude layout engine ✅
- Frontend: localhost:5174, API: localhost:3001

### GitHub webhooks ✅
- POST /webhooks/github live
- HMAC-SHA256 signature verification
- 4 event normalisers: push, pull_request, deployment_status, issues
- Webhook configured in GitHub → higher-baculine-andree.ngrok-free.dev
- Real GitHub events flowing into pulse stream

### AWS poller ✅
- EC2 instance health (60s) — 10 instances visible, 3 running
- EC2 CPU utilisation via CloudWatch (60s)
- Monthly cost by service via Cost Explorer (1hr)
- IAM permissions updated: DashboardPollerPermissions policy added to ethikslabs-dev

### GuardDuty ✅
- Enabled in ap-southeast-2
- Detector ID: 3ece865a73c5267e2e8851328c68aa13
- Monitoring for threats, compromise, unusual API calls

### Compliance poller — built, not yet restarted
- Open security groups (10min) — CRITICAL findings ready:
  - launch-wizard-1: port 5432 (Postgres) + port 22 open to 0.0.0.0/0
  - launch-wizard-2/3/4/5/6/7/8: port 22 open to 0.0.0.0/0
  - ethikslabs-platform-sg: clean (80/443 only)
- Unencrypted EBS volumes (1hr)
- GuardDuty findings (5min)
- IAM users without MFA (1hr)
- NOTE: Security groups left open intentionally — real findings for CISO lens

### Cloudflare poller — built, not yet restarted
- Zone analytics (5min)
- SSL certificate status (1hr)
- Reads CF token from SSM /cloudflare/api-token

### Proof360 pulse emitter — built
- emitPulse() in proof360/api/src/services/pulse-emitter.js
- Fires on: assessment_started, assessment_submitted, report_generated, lead_captured, pipeline_timeout
- Fire-and-forget — Proof360 unaffected if dashboard API is down
- DASHBOARD_API_URL=http://localhost:3001 in proof360 .env

## Running the full stack

```bash
# Terminal 1 — ngrok
ngrok http --url=higher-baculine-andree.ngrok-free.dev 3001

# Terminal 2 — API (restarts picks up compliance + cloudflare pollers)
lsof -ti :3001 | xargs kill -9
cd ~/Library/CloudStorage/Dropbox/Projects/jp-system/api && node index.js

# Terminal 3 — Frontend
cd ~/Library/CloudStorage/Dropbox/Projects/jp-system/dashboard && npm run dev

# Terminal 4 — Proof360 (optional)
cd ~/Library/CloudStorage/Dropbox/Projects/proof360/api && node server.js
```

## Next tasks

1. Restart API — pick up compliance + cloudflare pollers
2. Verify CISO lens shows real security findings (open ports, GuardDuty)
3. Stripe webhooks — same pattern as GitHub
4. Deploy to EC2 — permanent URL, kill ngrok dependency
5. Back to Proof360 — vendor graph, Ingram wiring, ReachLX lunch

---
*Updated: 2026-03-21*
