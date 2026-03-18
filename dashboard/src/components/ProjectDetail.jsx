import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const LIGHTS = {
  green: { color: '#00e676', label: 'LIVE' },
  amber: { color: '#ffab00', label: 'IN PROGRESS' },
  red:   { color: '#ff3d00', label: 'BLOCKED' },
  grey:  { color: '#3a3a3a', label: 'INCOMING' },
}

const HEALTH_COLORS = { ok: '#00e676', warn: '#ffab00', danger: '#ff3d00', unknown: '#444', unconfigured: '#444' }

function HealthChecks({ health }) {
  if (!health || health.summary === 'unconfigured') return (
    <div className="secrets-empty">No health checks configured.</div>
  )
  return (
    <div className="health-checks">
      {health.checks.map((c, i) => (
        <div key={i} className={`health-row ${c.ok ? 'health-ok' : 'health-fail'}`}>
          <span className="health-row-dot" style={{ background: c.ok ? '#00e676' : '#ff3d00' }} />
          <span className="health-row-name">{c.name}</span>
          <span className="health-row-url">{c.url}</span>
          <span className="health-row-code" style={{ color: c.ok ? '#00e676' : '#ff3d00' }}>
            {c.status ?? 'ERR'}
          </span>
          <span className="health-row-time">{c.responseTime}ms</span>
          <span className="health-row-checked">
            {c.lastChecked ? new Date(c.lastChecked).toLocaleTimeString() : '—'}
          </span>
        </div>
      ))}
      {health.ssl.length > 0 && (
        <div className="ssl-section">
          <div className="detail-section-title" style={{ marginBottom: '10px' }}>SSL CERTIFICATES</div>
          {health.ssl.map((s, i) => (
            <div key={i} className="health-row">
              <span className="health-row-dot" style={{ background: HEALTH_COLORS[s.status] ?? '#444' }} />
              <span className="health-row-name">{s.domain}</span>
              <span className="health-row-url">expires {s.expiresAt ?? 'unknown'}</span>
              <span className="health-row-code" style={{ color: HEALTH_COLORS[s.status] ?? '#444' }}>
                {s.daysRemaining != null ? `${s.daysRemaining}d` : '—'}
              </span>
              <span className="health-row-time" />
              <span className="health-row-checked" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_STYLES = {
  ok:      { color: '#00e676', label: 'OK' },
  warn:    { color: '#ffab00', label: 'ROTATE SOON' },
  danger:  { color: '#ff3d00', label: 'OVERDUE' },
  unknown: { color: '#444',    label: 'UNKNOWN' },
}

function SecretsRegistry({ secrets }) {
  if (!secrets || secrets.length === 0) return (
    <div className="secrets-empty">No secrets registered.</div>
  )

  return (
    <div className="secrets-table">
      <div className="secrets-row secrets-header">
        <span>KEY</span>
        <span>STORE</span>
        <span>LOCATION</span>
        <span>ROTATED</span>
        <span>STATUS</span>
      </div>
      {secrets.map((s, i) => {
        const st = STATUS_STYLES[s.status] ?? STATUS_STYLES.unknown
        return (
          <div key={i} className={`secrets-row secrets-row--${s.status}`}>
            <span className="secret-key">{s.key}</span>
            <span className="secret-store">{s.store}</span>
            <span className="secret-location">{s.location}</span>
            <span className="secret-rotated">{s.rotated}</span>
            <span className="secret-status" style={{ color: st.color }}>{st.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Changelog({ commits }) {
  const [open, setOpen] = useState(false)

  if (!commits || commits.length === 0) return null

  const latest = commits[0]

  return (
    <div className="changelog">
      <button className="changelog-toggle" onClick={() => setOpen(o => !o)}>
        <span className="changelog-arrow">{open ? '▼' : '▶'}</span>
        <span className="changelog-latest">
          <span className="commit-subject">{latest.subject}</span>
          <span className="commit-time">{latest.time}</span>
        </span>
      </button>

      {open && (
        <div className="commit-list">
          {commits.map((c, i) => (
            <div key={i} className="commit-row">
              <span className="commit-hash">{c.hash}</span>
              <span className="commit-msg">{c.subject}</span>
              <span className="commit-meta">{c.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(setProject)
  }, [id])

  if (!project) return (
    <div className="app">
      <div className="detail-loading">Loading…</div>
    </div>
  )

  const light = LIGHTS[project.light] ?? LIGHTS.grey

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>← OPS</button>
          <span className="header-divider">·</span>
          <span className="wordmark">ETHIKSLABS</span>
        </div>
        <div className={`live-pill ${project.light === 'green' ? 'live' : project.light === 'red' ? 'offline' : ''}`}>
          <span className="live-dot" />
          {light.label}
        </div>
      </header>

      <main className="detail-main">
        <div className="detail-name" style={{ '--accent': light.color }}>
          {project.name}
        </div>

        {project.description && (
          <p className="detail-desc">{project.description}</p>
        )}

        {project.target && (
          <div className="detail-meta">
            <span className="detail-meta-label">TARGET</span>
            <span>{project.target}</span>
          </div>
        )}

        <div className="detail-status">{project.status}</div>

        <div className="detail-grid">
          {project.blockers.length > 0 && (
            <div className="detail-section detail-section--blocked">
              <div className="detail-section-title">BLOCKED ON</div>
              <ul>
                {project.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {project.next.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">NEXT ACTIONS</div>
              <ul>
                {project.next.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="detail-section" style={{ marginTop: '40px' }}>
          <div className="detail-section-title">HEALTH CHECKS</div>
          <HealthChecks health={project.health} />
        </div>

        <div className="detail-section" style={{ marginTop: '24px' }}>
          <div className="detail-section-title">SECRETS REGISTRY</div>
          <SecretsRegistry secrets={project.secrets} />
        </div>

        <div className="detail-section" style={{ marginTop: '24px' }}>
          <div className="detail-section-title">CHANGELOG</div>
          <Changelog commits={project.commits} />
        </div>
      </main>
    </div>
  )
}
