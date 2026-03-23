const ZONE_THRESHOLDS = [
  { pct: 50, color: '#60A5FA', label: 'Z1' },
  { pct: 65, color: '#2DD4BF', label: 'Z2' },
  { pct: 75, color: '#FBBF24', label: 'Z3' },
  { pct: 90, color: '#F97316', label: 'Z4' },
  { pct: 100, color: '#EF4444', label: 'Z5' },
]

function getZoneColor(pct) {
  if (pct < 50) return '#60A5FA'
  if (pct < 65) return '#2DD4BF'
  if (pct < 75) return '#FBBF24'
  if (pct < 90) return '#F97316'
  return '#EF4444'
}

export function HealthBar({ title, value = 72, max = 100, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = getZoneColor(pct)

  return (
    <div className="card">
      <div className="card-title">{title || 'Health'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: '700' }}>{value}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', alignSelf: 'flex-end' }}>/ {max} {label || ''}</span>
      </div>
      <div style={{ position: 'relative', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'visible' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
        {ZONE_THRESHOLDS.map((t) => (
          <div
            key={t.label}
            style={{
              position: 'absolute',
              left: `${t.pct}%`,
              top: '-4px',
              width: '1px',
              height: '16px',
              backgroundColor: 'var(--border)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {ZONE_THRESHOLDS.map((t) => (
          <span key={t.label} style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}
