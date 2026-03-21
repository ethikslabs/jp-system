# Proof360 — Project Room

*This file powers the Project Room view in the jp-system dashboard.*
*Owner: John Coates. Update when meaningful facts change.*

---

## identity

slug: proof360
name: Proof360
tagline: Trust intelligence for founders
lifecycle: lab
url: https://proof360.au
repo: ~/Dropbox/Projects/proof360
color: teal

---

## problem

Founders operate in opacity.

When they approach vendors, partners, or investors — they have no structured way to present their operating posture. The evidence exists — compliance tools, cloud infrastructure, team structure, governance docs — but it's messy, scattered, and unreadable by anyone outside the organisation.

The result: founders get asked the same questions repeatedly, can't close vendor deals efficiently, and lose investor credibility not because of what they've built but because they can't prove it.

Every existing tool assesses the stack. Nobody assesses the founder running it. That gap is where trust actually breaks down.

---

## solution

Proof360 converts messy operating evidence into structured trust output.

A founder enters their website URL. Proof360 extracts signals, builds an inference model, identifies gaps against known frameworks, maps vendor recommendations, and produces a report that vendors and partners can act on.

The output: a trust score, a gap map, a vendor recommendation layer, and — uniquely — a founder profile that shows the person behind the product.

The founder goes from chaos to calm, clear, and actionable. The partner gets a high-signal, pre-qualified lead with full context.

---

## the unique insight

Every trust tool assesses the stack. Proof360 is the only tool that assesses the founder.

The `founder_trust` gap fires for every founder by default. It surfaces a ReachLX 10-question leadership profile as a free teaser in the report. The full 95-question profile is the upsell. In the investor deal room, the founder profile sits alongside the technical trust score.

Nobody else has this layer. This is the moat.

---

## market

- **Category:** GRC (Governance, Risk, Compliance) automation + founder trust
- **Global GRC market:** $4.2B, growing
- **Vanta** validated the category at $1B valuation — but serves enterprise, not founders
- **ANZ entry point:** underserved, strong Ingram Micro / Dicker Data distribution network already engaged
- **Wedge:** Founder trust layer creates a category that doesn't exist yet

Adjacent markets:
- Investor due diligence tooling
- Vendor onboarding / partner portals
- Founder credentialing

---

## moat

- **Trust360** — the reasoning engine — is private forever. It never ships. Proof360 is the product built on top.
- **Vendor neutrality** — gap-to-vendor matching logic is defensibly neutral. Revenue is a consequence of trust, not the other way around.
- **Persona model** — Bob, Leonardo, Edison, Sophia — the cognitive operating system. Not a feature, a foundation.
- **Partner portal** — high-signal leads, pre-qualified, context-rich. Partners get fewer leads but better ones. That's the pitch to Ingram.

---

## traction

- Live at proof360.au
- Ingram Micro ANZ AM saw live demo — wants meeting with ANZ MD
- Deliberate strategy: scarcity. Not chasing the engagement.
- Lunch with Paul Findlay (ReachLX CEO) scheduled — designing the 10-question investor-framed teaser
- CognitiveView (Dilip Mohapatra) conversation pending — AI governance gap

---

## graduation criteria

To move from `lab` → `validated`:
- [ ] ReachLX 10-question teaser integrated and live in report
- [ ] Vendor graph engine live (capability tiles → vendor resolution → distributor routing)
- [ ] Ingram Micro wiring complete (real token, not mock)
- [ ] Partner portal live for first vendor partner
- [ ] 10 completed founder assessments

To move from `validated` → `authorised` (ready for Ethiks360 handoff):
- [ ] Ingram ANZ MD meeting completed
- [ ] Commercial model agreed with at least one distribution partner
- [ ] SOC 2 Type II gap addressed or waived for launch
- [ ] John explicitly confirms authorised

---

## stack

```
Frontend:  React + Vite — proof360.au
API:       Fastify (Node.js)
Reasoning: Trust360 (external engine — private boundary)
Scraping:  Firecrawl + Claude Haiku (signal extraction)
Vendors:   vendors.js catalog (30+ vendors, 9 categories)
Gaps:      gaps.js (founder_trust added — fires by default)
```

---

## key relationships

| Person | Company | Role | Status |
|---|---|---|---|
| Paul Findlay | ReachLX | CEO (mate, ex-coach) | Lunch scheduled |
| Dilip Mohapatra | CognitiveView | CEO | Conversation pending |
| Ingram AM | Ingram Micro ANZ | Account Manager | Saw demo, wants MD intro |
| Ingram ANZ MD | Ingram Micro ANZ | Managing Director | Meeting pending |

---

## docs

- `architecture.md` — system design
- `brief-strategy.md` — product strategy + moat argument
- `brief-vendors.md` — vendor intelligence spec
- `brief-vendor-graph.md` — capability abstraction + distributor routing
- `proof360-principle.md` — system principle (locked)
- `proof360-founder-experience.md` — UX principle (locked)

---

*Last updated: 2026-03-21*
