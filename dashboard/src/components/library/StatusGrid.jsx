const STATUS_COLOR = {
  green: '#2DD4BF',
  ok: '#2DD4BF',
  healthy: '#2DD4BF',
  amber: '#FBBF24',
  warning: '#FBBF24',
  degraded: '#FBBF24',
  red: '#EF4444',
  critical: '#EF4444',
  stopped: '#6B7280',
  unknown: '#6B7280',
}

const DEFAULT_ITEMS = [
  { label: 'Proof360', status: 'green' },
  { label: 'Auth0', status: 'green' },
  { label: 'GitHub', status: 'green' },
  { label: 'Stripe', status: 'amber' },
  { label: 'HubSpot', status: 'green' },
  { label: 'AWS', status: 'amber' },
  { label: 'ethikslabs.com', status: 'green' },
  { label: 'Firecrawl', status: 'green' },
]

export function StatusGrid({ title, items = DEFAULT_ITEMS }) {
  return (
    <div className="card">
      <div className="card-title">{title || 'System Status'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: STATUS_COLOR[item.status] || '#6B7280',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
