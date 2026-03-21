// src/components/dashboard/PipelineStrip/PipelineStrip.jsx
const PHASES = [
  { num: 0, label: ['Design Loop', 'Protocol locked'], state: 'done' },
  { num: 1, label: ['Proof360', 'Portal build'], state: 'current' },
  { num: 2, label: ['Research360', 'Engine deploy'], state: 'current' },
  { num: 3, label: ['Voice360', 'Brief → Kiro'], state: 'pending' },
  { num: 4, label: ['Fund360', 'Alpha launch'], state: 'pending' },
  { num: 5, label: ['Ethiks360', 'Platform hand-off'], state: 'pending' },
]

const NODE_STYLES = {
  done:    { border: 'rgba(90,158,111,0.5)', bg: 'rgba(90,158,111,0.1)', color: 'var(--green)' },
  current: { border: 'var(--accent-e)', bg: 'rgba(200,169,110,0.08)', color: 'var(--accent-e)', glow: '0 0 12px rgba(200,169,110,0.25)' },
  pending: { border: 'var(--border)', bg: 'var(--bg3)', color: 'var(--muted)' },
}

export function PipelineStrip() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px 24px', marginTop: '10px' }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '20px' }}>
        Pipeline · PIPELINE.md · convergence max 10 rounds
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '13px', left: '13px', right: '13px', height: '1px', background: 'var(--border)', zIndex: 0 }} />
        {PHASES.map((phase, i) => {
          const s = NODE_STYLES[phase.state]
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '26px', height: '26px',
                borderRadius: '50%',
                border: `1px solid ${s.border}`,
                background: s.bg,
                color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono', fontSize: '10px',
                boxShadow: s.glow ?? 'none',
              }}>{phase.num}</div>
              <div style={{ textAlign: 'center' }}>
                {phase.label.map((l, j) => (
                  <div key={j} style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.4 }}>{l}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
