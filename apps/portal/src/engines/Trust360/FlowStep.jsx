// apps/portal/src/engines/Trust360/FlowStep.jsx
const STEP_OUTPUTS = {
  1: () => (
    <div>
      <div style={lineStyle}>Web: proof360.au + ethikslabs.com <Tick /></div>
      <div style={lineStyle}>GitHub: 14 repos · active 2d ago <Tick /></div>
      <div style={lineStyle}>ASIC: Registered · ACN confirmed <Tick /></div>
      <div style={lineStyle}>Signals: <Val n={47} /> normalised</div>
    </div>
  ),
  2: () => (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
        {['SOC 2','ISO 27001','NIST CSF','ASIC','Vanta','REACH'].map(s => (
          <span key={s} style={{ fontFamily: 'DM Mono', fontSize: '8px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(176,138,212,0.12)', color: 'var(--accent-r)' }}>{s}</span>
        ))}
      </div>
      <div style={lineStyle}>Chunks: <Val n={183} /></div>
      <div style={lineStyle}>Avg similarity: <Val n="0.847" /></div>
    </div>
  ),
  3: () => (
    <div>
      {[
        { text: 'SOC 2 not started', sev: 'critical' },
        { text: 'Privacy policy missing', sev: 'critical' },
        { text: 'DORA partial', sev: 'medium' },
        { text: 'Founder trust assessed', sev: 'medium' },
        { text: 'GitHub security present', sev: 'low' },
      ].map(g => <GapRow key={g.text} {...g} />)}
    </div>
  ),
  4: () => (
    <div>
      {[
        { vendor: 'Vanta', score: '0.91', via: '→ Ingram AU' },
        { vendor: 'Didomi', score: '0.84', via: '→ direct' },
        { vendor: 'REACH Profile', score: null, via: '→ teaser (warn)' },
      ].map((v,i) => (
        <div key={i} style={lineStyle}>{v.vendor} <span style={{ color: 'var(--accent-r)', fontFamily: 'DM Mono', fontSize: '10px' }}>{v.score}</span> {v.via}</div>
      ))}
      <div style={{ ...lineStyle, color: 'var(--muted)' }}>8 vendors across 5 gaps</div>
    </div>
  ),
  5: () => (
    <div>
      {[
        { label: 'Overall', score: 61 },
        { label: 'Security', score: 58 },
        { label: 'Governance', score: 44 },
        { label: 'Operational', score: 79 },
        { label: 'Founder trust', score: 68 },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', width: '90px', flexShrink: 0 }}>{s.label}</span>
          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: scoreColor(s.score) }}>{s.score}/100</span>
        </div>
      ))}
    </div>
  ),
  6: () => (
    <div>
      <div style={lineStyle}>ID: PR-2026-0321-001</div>
      <div style={lineStyle}>L6: written <Tick /></div>
      <div style={{ ...lineStyle, color: 'var(--accent-e)' }}>Email gate: pending capture ⚠</div>
      <div style={lineStyle}>Status: ready <Tick /></div>
    </div>
  ),
}

function scoreColor(n) {
  if (n >= 75) return 'var(--green)'
  if (n >= 50) return 'var(--accent-e)'
  return 'var(--accent-t)'
}

const lineStyle = { fontSize: '11px', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.4 }

function Tick() { return <span style={{ color: 'var(--green)' }}> ✓</span> }

function Val({ n }) { return <span style={{ color: 'var(--accent-l)', fontFamily: 'DM Mono' }}>{n}</span> }

const SEV_COLORS = { critical: 'var(--accent-t)', medium: 'var(--accent-e)', low: 'var(--muted)' }

function GapRow({ text, sev }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: SEV_COLORS[sev], flexShrink: 0 }} />
      <span style={{ fontSize: '11px', color: 'var(--text)' }}>{text}</span>
      <span style={{ fontFamily: 'DM Mono', fontSize: '9px', color: SEV_COLORS[sev], marginLeft: 'auto' }}>{sev}</span>
    </div>
  )
}

export function FlowStep({ num, title, state, output }) {
  // state: 'pending' | 'running' | 'done'
  const nodeStyle = {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'DM Mono', fontSize: '11px', flexShrink: 0,
    transition: 'all 0.3s ease',
    ...(state === 'pending' ? {
      border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--muted)',
    } : state === 'running' ? {
      border: '1px solid var(--accent-t)', background: 'rgba(196,122,122,0.1)', color: 'var(--accent-t)',
      animation: 'glow-pulse 1.8s ease-in-out infinite',
    } : {
      border: '1px solid rgba(196,122,122,0.4)', background: 'rgba(196,122,122,0.06)', color: 'var(--accent-t)',
    }),
  }

  const OutputComponent = output ? STEP_OUTPUTS[num] : null

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={nodeStyle}>{num}</div>
        <div style={{ width: '1px', flex: 1, background: state !== 'pending' ? 'rgba(196,122,122,0.15)' : 'var(--border)', marginTop: '4px' }} />
      </div>
      <div style={{ flex: 1, paddingBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: state === 'pending' ? 'var(--muted)' : 'var(--text)', marginBottom: '6px', paddingTop: '4px' }}>{title}</div>
        {(state === 'running' || state === 'done') && OutputComponent && (
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
            <OutputComponent />
          </div>
        )}
      </div>
    </div>
  )
}
