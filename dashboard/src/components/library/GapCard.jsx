const SEVERITY_COLOR = {
  info: '#60A5FA',
  warning: '#FBBF24',
  critical: '#EF4444',
}

const DEFAULT_GAPS = [
  { title: 'SOC 2 Type II missing', severity: 'critical', vendor: 'Vanta', cta: 'Start Assessment' },
  { title: 'Pen test not scheduled', severity: 'warning', vendor: 'Cobalt', cta: 'Book Now' },
  { title: 'Privacy policy outdated', severity: 'warning', vendor: 'Termly', cta: 'Review' },
]

export function GapCard({ title, gaps = DEFAULT_GAPS }) {
  return (
    <div className="card">
      <div className="card-title">{title || 'Trust Gaps'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {gaps.map((gap, i) => (
          <div
            key={i}
            style={{
              padding: '0.75rem',
              backgroundColor: `${SEVERITY_COLOR[gap.severity] || '#6B7280'}11`,
              border: `1px solid ${SEVERITY_COLOR[gap.severity] || '#6B7280'}33`,
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: '500' }}>{gap.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>via {gap.vendor}</div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: SEVERITY_COLOR[gap.severity] || '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  flexShrink: 0,
                }}
              >
                {gap.severity}
              </span>
            </div>
            {gap.cta && (
              <button
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: `1px solid ${SEVERITY_COLOR[gap.severity] || '#6B7280'}66`,
                  borderRadius: '4px',
                  color: SEVERITY_COLOR[gap.severity] || '#6B7280',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {gap.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
