const DEFAULT_SECRETS = [
  { name: 'ANTHROPIC_API_KEY', status: 'ok', daysUntilExpiry: 45, store: 'SSM' },
  { name: 'STRIPE_SECRET_KEY', status: 'warning', daysUntilExpiry: 12, store: 'SSM' },
  { name: 'AUTH0_CLIENT_SECRET', status: 'ok', daysUntilExpiry: 89, store: 'SSM' },
  { name: 'GITHUB_TOKEN', status: 'danger', daysUntilExpiry: 2, store: 'SSM' },
  { name: 'FIRECRAWL_API_KEY', status: 'ok', daysUntilExpiry: 120, store: 'SSM' },
]

const STATUS_COLOR = {
  ok: '#2DD4BF',
  warning: '#FBBF24',
  danger: '#EF4444',
}

export function SecretRotation({ title, secrets = DEFAULT_SECRETS }) {
  return (
    <div className="card">
      <div className="card-title">{title || 'Secret Rotation'}</div>
      <div style={{ marginTop: '0.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 80px',
            gap: '0.5rem',
            padding: '0.375rem 0',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Secret</span>
          <span style={{ textAlign: 'right' }}>Days</span>
          <span style={{ textAlign: 'right' }}>Status</span>
        </div>
        {secrets.map((secret, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 80px',
              gap: '0.5rem',
              padding: '0.5rem 0',
              borderBottom: i < secrets.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {secret.name}
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: STATUS_COLOR[secret.status] || '#6B7280',
                textAlign: 'right',
              }}
            >
              {secret.daysUntilExpiry}d
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: STATUS_COLOR[secret.status] || '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'right',
              }}
            >
              {secret.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
