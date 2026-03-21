const METRICS = [
  { number: '6',   label: 'Platforms in the 360 stack',         trend: '↗ Trust · Research · Voice · Fund · Raise · Ethiks' },
  { number: 'ANZ', label: 'Ingram MD engagement — inbound',      trend: 'Scarcity strategy · not chasing' },
  { number: '5',   label: 'Active strategic partnerships',       trend: 'AWS · Microsoft · Cloudflare · Vanta · Cisco' },
  { number: 'WL',  label: 'White-label licensing thesis',        trend: 'Proof360 → partner portals → Ingram channel' },
]

export function LeonardoView() {
  return (
    <div>
      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-l)', marginBottom: '8px' }}>
        Leonardo · macro
      </div>
      <div style={{ fontFamily: 'Instrument Serif', fontSize: '26px', color: 'var(--text)', marginBottom: '6px' }}>
        The strategic position.
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
        Where EthiksLabs sits. What the thesis is. Where this goes.
      </div>

      {/* 2×2 metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {METRICS.map((m, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px 22px' }}>
            <div style={{ fontFamily: 'Instrument Serif', fontSize: '38px', color: 'var(--text)', lineHeight: 1, marginBottom: '6px' }}>{m.number}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--accent-l)' }}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Thesis card */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px 26px' }}>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: '20px', color: 'var(--text)', marginBottom: '12px' }}>
          "The moat is the dataset, not the UI."
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, maxWidth: '600px' }}>
          The gap schema (why → risk → control → closure → vendors) and the signals object must be treated as sacred from session one. Every Proof360 report adds a structured, comparable record to the corpus. That's what makes the trust score meaningful rather than just computed — and what no competitor can clone in 3 months.
        </div>
      </div>
    </div>
  )
}
