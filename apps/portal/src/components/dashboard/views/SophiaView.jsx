const CARDS = [
  {
    eyebrow: 'Primary · in market',
    headline: "Proof360 is live — and Ingram's ANZ MD wants a meeting.",
    body: "A trust intelligence report every founder needs before their first enterprise deal. Live, generating interest. Scarcity deliberate. We're not chasing Ingram — they came to us.",
  },
  {
    eyebrow: 'The bigger picture',
    headline: 'Six platforms. One thesis: trust is the operating system for company growth.',
    body: 'Research360 is the knowledge layer. Voice360 is the interface. Fund360 validates the AI analyst model. Raise360 connects founders to capital. Ethiks360 is the platform that ties it together — Sarvesh (CTO) and Val (COO) run it.',
  },
  {
    eyebrow: 'Needs your attention',
    headline: 'Ethiks360 is staged and waiting. Ethiks361 is the proving ground.',
    body: "Before anything escalates to Ethiks360, it runs through Ethiks361 — a pre-staging sandbox. By design. When you're ready to engage, the architecture will be solid enough to hand over cleanly.",
  },
  {
    eyebrow: 'Upcoming',
    headline: 'Lunch with Paul Findlay — ReachLX. Designing the investor teaser.',
    body: 'The REACH Leading Profile surfaces in every Proof360 report with a founder_trust gap. Paul and John are designing the investor-framed version together. EthiksLabs dogfoods what it recommends.',
  },
]

export function SophiaView() {
  return (
    <div>
      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-s)', marginBottom: '8px' }}>
        Sophia · narrative
      </div>
      <div style={{ fontFamily: 'Instrument Serif', fontSize: '26px', color: 'var(--text)', marginBottom: '6px' }}>
        The story so far.
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
        What's being built, why it matters, and where the momentum is.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {CARDS.map((c, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '20px 22px', transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(143,184,160,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-s)', marginBottom: '6px' }}>{c.eyebrow}</div>
            <div style={{ fontFamily: 'Instrument Serif', fontSize: '17px', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.4 }}>{c.headline}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
