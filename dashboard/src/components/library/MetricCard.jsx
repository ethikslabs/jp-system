const TREND_ARROW = { up: '↑', down: '↓', flat: '→' }
const TREND_COLOR = { up: '#2DD4BF', down: '#EF4444', flat: '#6B7280' }

export function MetricCard({ title, signal, trend = 'flat', value = 42 }) {
  return (
    <div className="card">
      <div className="card-title">{title || 'Metric'}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span className="card-value">{value}</span>
        <span style={{ fontSize: '1.25rem', color: TREND_COLOR[trend] || TREND_COLOR.flat }}>
          {TREND_ARROW[trend] || TREND_ARROW.flat}
        </span>
      </div>
      {signal && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{signal}</div>
      )}
    </div>
  )
}
