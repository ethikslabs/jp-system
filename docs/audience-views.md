# Audience-Based Views

## The Idea

Same data. Different lens. One input: "who are you?"

A single field — dropdown or free text — that reframes the entire dashboard
for the person looking at it. Powered by Claude interpreting trust data
through the lens of the audience.

## Audiences

### Curious teen / student
- Plain English, no jargon
- "This means your site could be hacked because..."
- Gamified score — "74/100, here's how to get to 80"
- Links to learn more
- Makes real systems approachable for cyber education

### Startup founder
- What's broken, what it costs, how to fix it
- Business impact not technical detail
- Next 3 actions, nothing more

### CISO
- CVE references, CVSS scores, MITRE ATT&CK mapping
- SOC2 / ISO27001 control gaps
- Audit trail, evidence package
- Framework-aligned language

### Board member
- One number, one direction, one risk
- "Trust Score 74 ↑ from 68 last quarter"
- Zero jargon
- What requires a decision

### Vendor / partner
- Is this business safe to work with?
- Compliance posture, tech stack health
- Integration risk

### Investor
- Traction, momentum, risk profile
- Due diligence in 30 seconds
- "Last commit this morning, 0 critical vulnerabilities,
   SSL valid 89 days, revenue up"

### Custom
- Free text: "describe yourself"
- Claude reads the trust data and explains it in that context
- Same signals, completely different narrative

## The mechanics

```
User selects / describes audience
         ↓
Same underlying trust data
         ↓
Claude interprets through that lens
         ↓
Dashboard re-renders with audience-appropriate language,
metrics, and recommended actions
```

## Product implications

- Core feature of Ethiks360 deal room
- Personalisation engine for trust output
- Standalone education product potential (CyberLab)
  — live real system for students to learn on
  — free for students, paid for schools

## Origin

Came from the observation that a CISSP-trained founder
building a SharePoint deal room would naturally think
about who is in the room and what they need to see.

Same data. Different room. Different trust.
