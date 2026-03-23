import React from 'react'
import { getEntityPulses } from '../../services/api'

// ISO string → local time; relative strings ("2m ago") pass through unchanged
function formatTs(ts) {
  if (!ts) return ''
  if (/^\d{4}-\d{2}-\d{2}T/.test(ts)) {
    return new Date(ts).toLocaleString()
  }
  return ts
}

const SEVERITY_COLOR = {
  info: '#60A5FA',
  warning: '#FBBF24',
  critical: '#EF4444',
}

const SOURCE_ICON = {
  github: '⌥',
  stripe: '$',
  auth0: '🔐',
  hubspot: '⬡',
  proof360: '◎',
  system: '⚙',
  aws: '☁',
}

const GH_EVENT_ICON = {
  push: '↑',
  pull_request: '⇄',
  pr: '⇄',
  deployment_status: '▶',
  deployment: '▶',
  issues: '◎',
  issue: '◎',
}

function RepoDrillDown({ entityId, onClose }) {
  const [pulses, setPulses] = React.useState(null)
  const repo = entityId || ''
  const repoName = repo.replace(/^.*\//, '') // strip owner prefix for display

  React.useEffect(() => {
    if (!repo) return
    getEntityPulses(repo, 5).then(setPulses).catch(() => setPulses([]))
  }, [repo])

  const ghUrl = repo ? `https://github.com/${repo}` : null

  return (
    <div style={{
      marginTop: '0.5rem',
      padding: '0.625rem 0.75rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid #60A5FA44',
      borderRadius: '6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#60A5FA' }}>
          {repoName || repo}
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {ghUrl && (
            <a href={ghUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              github.com/{repo} ↗
            </a>
          )}
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1, padding: '0 0.125rem' }}>
            ×
          </button>
        </div>
      </div>

      {pulses === null ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Loading…</div>
      ) : pulses.length === 0 ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recent events</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {pulses.map((p, i) => {
            const payload = p.payload || {}
            const eventType = payload.event_type || payload.action || p.type
            const icon = GH_EVENT_ICON[eventType] || '·'
            const msg = payload.message || payload.title || payload.description || eventType
            return (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace', flexShrink: 0, width: '1rem', textAlign: 'center' }}>{icon}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', flexShrink: 0 }}>{formatTs(p.timestamp)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const DEFAULT_ALERTS = [
  { source: 'github', severity: 'info', message: 'PR merged: add dashboard API v1.0', timestamp: '2m ago', entity_id: 'ethikslabs/ethikslabs-core' },
  { source: 'auth0', severity: 'info', message: 'New user login from 203.0.113.42', timestamp: '8m ago' },
  { source: 'system', severity: 'warning', message: 'SSL cert expires in 14 days for ethikslabs.com', timestamp: '1h ago' },
  { source: 'stripe', severity: 'info', message: 'Payment received $299', timestamp: '3h ago' },
  { source: 'aws', severity: 'warning', message: 'Server CPU spike: 87% for 4 minutes', timestamp: '5h ago' },
]

export function AlertFeed({ title, filter, alerts = DEFAULT_ALERTS }) {
  const [expanded, setExpanded] = React.useState(false)
  const [drilldown, setDrilldown] = React.useState(null) // entity_id of open drilldown

  const filtered = filter?.severity
    ? alerts.filter((a) => a.severity === filter.severity)
    : alerts
  const displayed = expanded ? filtered : filtered.slice(0, 3)
  const hidden = filtered.length - displayed.length

  function toggleDrilldown(alert) {
    if (alert.source !== 'github' || !alert.entity_id) return
    setDrilldown(d => d === alert.entity_id ? null : alert.entity_id)
  }

  return (
    <div className="card">
      <div className="card-title">{title || 'Alert Feed'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        {filtered.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No alerts</span>
        )}
        {displayed.map((alert, i) => {
          const isGH = alert.source === 'github' && alert.entity_id
          const isOpen = drilldown === alert.entity_id
          return (
            <div key={i}>
              <div
                onClick={() => toggleDrilldown(alert)}
                style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.5rem 0',
                  borderBottom: (i < displayed.length - 1 || hidden > 0) && !isOpen ? '1px solid var(--border)' : 'none',
                  cursor: isGH ? 'pointer' : 'default',
                }}
              >
                <span style={{ color: isGH && isOpen ? '#60A5FA' : 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'monospace', flexShrink: 0, minWidth: '1rem', textAlign: 'center' }}>
                  {SOURCE_ICON[alert.source] || '·'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{alert.message}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: SEVERITY_COLOR[alert.severity] || 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {alert.severity}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{alert.source}</span>
                    {isGH && <span style={{ color: '#60A5FA', fontSize: '0.65rem', marginLeft: '0.25rem' }}>tap to expand</span>}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{formatTs(alert.timestamp)}</span>
                  </div>
                </div>
              </div>
              {isOpen && (
                <RepoDrillDown entityId={alert.entity_id} onClose={() => setDrilldown(null)} />
              )}
            </div>
          )
        })}
        {hidden > 0 && (
          <button onClick={() => setExpanded(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', padding: '0.25rem 0' }}>
            and {hidden} more…
          </button>
        )}
        {expanded && filtered.length > 3 && (
          <button onClick={() => setExpanded(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', padding: '0.25rem 0' }}>
            show less
          </button>
        )}
      </div>
    </div>
  )
}
